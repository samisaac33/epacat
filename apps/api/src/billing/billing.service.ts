import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  RecaudacionPagoInput,
  RecaudacionReversoInput,
  RegistrarPagoInput,
  TarifaInput,
} from '@epacat/shared';
import { FacturaStatus, MetodoPago, PagoCanal, User } from '@epacat/database';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  listPeriodos() {
    return this.prisma.periodoFacturacion.findMany({
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      include: {
        _count: { select: { facturas: true } },
        cerradoPor: { select: { id: true, nombre: true } },
      },
    });
  }

  async getPeriodoActual() {
    const periodo = await this.prisma.periodoFacturacion.findFirst({
      where: { status: 'ABIERTO' },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
    if (!periodo) {
      throw new NotFoundException('No hay periodo de facturación abierto');
    }

    const lecturasPendientes = await this.countLecturasFacturables(periodo);

    return {
      ...periodo,
      lecturasPendientes,
    };
  }

  async listFacturas(params: {
    periodoId?: string;
    status?: FacturaStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      ...(params.periodoId ? { periodoId: params.periodoId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.factura.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaEmision: 'desc' },
        include: {
          abonado: { select: { id: true, nombre: true, cedula: true, sector: true } },
          periodo: { select: { id: true, anio: true, mes: true } },
          pagos: { where: { revertido: false }, select: { monto: true } },
        },
      }),
      this.prisma.factura.count({ where }),
    ]);

    return {
      items: items.map((f) => ({
        id: f.id,
        numero: f.numero,
        status: f.status,
        subtotal: f.subtotal,
        cargoFijo: f.cargoFijo,
        total: f.total,
        fechaEmision: f.fechaEmision.toISOString(),
        fechaVencimiento: f.fechaVencimiento.toISOString(),
        abonado: f.abonado,
        periodo: f.periodo,
        totalPagado: f.pagos.reduce((sum, p) => sum + p.monto, 0),
      })),
      total,
      page,
      limit,
    };
  }

  async getFactura(id: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: {
        abonado: true,
        periodo: true,
        lineas: {
          include: {
            medidor: { select: { id: true, numeroSerie: true, marca: true } },
            lecturaAnterior: { select: { valor: true, fecha: true } },
            lecturaActual: { select: { valor: true, fecha: true } },
          },
        },
        pagos: {
          include: { registradoPor: { select: { id: true, nombre: true } } },
          orderBy: { fecha: 'desc' },
          where: { revertido: false },
        },
      },
    });
    if (!factura) throw new NotFoundException('Factura no encontrada');

    const totalPagado = factura.pagos.reduce((sum, p) => sum + p.monto, 0);

    return {
      id: factura.id,
      numero: factura.numero,
      status: factura.status,
      subtotal: factura.subtotal,
      cargoFijo: factura.cargoFijo,
      total: factura.total,
      totalPagado,
      saldoPendiente: Math.max(0, factura.total - totalPagado),
      fechaEmision: factura.fechaEmision.toISOString(),
      fechaVencimiento: factura.fechaVencimiento.toISOString(),
      abonado: factura.abonado,
      periodo: factura.periodo,
      lineas: factura.lineas.map((l) => ({
        id: l.id,
        medidor: l.medidor,
        consumo: l.consumo,
        precioM3: l.precioM3,
        monto: l.monto,
        lecturaAnterior: l.lecturaAnterior
          ? { valor: l.lecturaAnterior.valor, fecha: l.lecturaAnterior.fecha.toISOString() }
          : null,
        lecturaActual: {
          valor: l.lecturaActual.valor,
          fecha: l.lecturaActual.fecha.toISOString(),
        },
      })),
      pagos: factura.pagos.map((p) => ({
        id: p.id,
        monto: p.monto,
        metodo: p.metodo,
        origen: p.origen,
        canal: p.canal,
        referencia: p.referencia,
        fecha: p.fecha.toISOString(),
        registradoPor: p.registradoPor,
      })),
    };
  }

  getTarifaActiva() {
    return this.prisma.tarifa.findFirst({
      where: { activa: true },
      orderBy: { vigenteDesde: 'desc' },
    });
  }

  async updateTarifa(input: TarifaInput) {
    await this.prisma.tarifa.updateMany({ where: { activa: true }, data: { activa: false } });
    return this.prisma.tarifa.create({
      data: {
        nombre: input.nombre,
        cargoFijo: input.cargoFijo,
        precioM3: input.precioM3,
        activa: true,
      },
    });
  }

  async cerrarPeriodo(periodoId: string, user: User) {
    const periodo = await this.prisma.periodoFacturacion.findUnique({
      where: { id: periodoId },
    });
    if (!periodo) throw new NotFoundException('Periodo no encontrado');
    if (periodo.status !== 'ABIERTO') {
      throw new BadRequestException('El periodo ya está cerrado');
    }

    const tarifa = await this.getTarifaActiva();
    if (!tarifa) throw new BadRequestException('No hay tarifa activa configurada');

    const lecturas = await this.prisma.lectura.findMany({
      where: {
        fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
        visita: {
          status: 'VALIDATED',
          validacion: { status: 'APPROVED' },
        },
        facturaLineaActual: null,
      },
      include: {
        medidor: { include: { abonado: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const porMedidor = new Map<string, (typeof lecturas)[0]>();
    for (const lectura of lecturas) {
      if (!porMedidor.has(lectura.medidorId)) {
        porMedidor.set(lectura.medidorId, lectura);
      }
    }

    type LineaDraft = {
      abonadoId: string;
      medidorId: string;
      lecturaAnteriorId: string | null;
      lecturaActualId: string;
      consumo: number;
      precioM3: number;
      monto: number;
    };

    const lineasDraft: LineaDraft[] = [];

    for (const lecturaActual of porMedidor.values()) {
      const lastLinea = await this.prisma.facturaLinea.findFirst({
        where: { medidorId: lecturaActual.medidorId },
        orderBy: { lecturaActual: { fecha: 'desc' } },
        include: { lecturaActual: true },
      });

      const valorAnterior = lastLinea?.lecturaActual.valor ?? null;
      const consumo =
        valorAnterior === null ? 0 : Math.max(0, lecturaActual.valor - valorAnterior);
      const monto = consumo * tarifa.precioM3;

      lineasDraft.push({
        abonadoId: lecturaActual.medidor.abonadoId,
        medidorId: lecturaActual.medidorId,
        lecturaAnteriorId: lastLinea?.lecturaActualId ?? null,
        lecturaActualId: lecturaActual.id,
        consumo,
        precioM3: tarifa.precioM3,
        monto,
      });
    }

    const porAbonado = new Map<string, LineaDraft[]>();
    for (const linea of lineasDraft) {
      const list = porAbonado.get(linea.abonadoId) ?? [];
      list.push(linea);
      porAbonado.set(linea.abonadoId, list);
    }

    const existingCount = await this.prisma.factura.count({ where: { periodoId } });
    let seq = existingCount;

    const fechaVencimiento = new Date(periodo.anio, periodo.mes, 15);
    if (fechaVencimiento <= new Date()) {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    const facturasCreadas = await this.prisma.$transaction(async (tx) => {
      const created: string[] = [];

      for (const [abonadoId, lineas] of porAbonado) {
        seq += 1;
        const subtotal = lineas.reduce((sum, l) => sum + l.monto, 0);
        const total = subtotal + tarifa.cargoFijo;
        const numero = `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}-${String(seq).padStart(4, '0')}`;

        const factura = await tx.factura.create({
          data: {
            numero,
            abonadoId,
            periodoId,
            subtotal,
            cargoFijo: tarifa.cargoFijo,
            total,
            fechaVencimiento,
            lineas: {
              create: lineas.map((l) => ({
                medidorId: l.medidorId,
                lecturaAnteriorId: l.lecturaAnteriorId,
                lecturaActualId: l.lecturaActualId,
                consumo: l.consumo,
                precioM3: l.precioM3,
                monto: l.monto,
              })),
            },
          },
        });
        created.push(factura.id);
      }

      await tx.periodoFacturacion.update({
        where: { id: periodoId },
        data: {
          status: 'CERRADO',
          cerradoAt: new Date(),
          cerradoPorId: user.id,
        },
      });

      const nextMes = periodo.mes === 12 ? 1 : periodo.mes + 1;
      const nextAnio = periodo.mes === 12 ? periodo.anio + 1 : periodo.anio;
      const nextInicio = new Date(nextAnio, nextMes - 1, 1);
      const nextFin = new Date(nextAnio, nextMes, 0, 23, 59, 59, 999);

      await tx.periodoFacturacion.upsert({
        where: { anio_mes: { anio: nextAnio, mes: nextMes } },
        update: {},
        create: {
          anio: nextAnio,
          mes: nextMes,
          status: 'ABIERTO',
          fechaInicio: nextInicio,
          fechaFin: nextFin,
        },
      });

      return created;
    });

    for (const facturaId of facturasCreadas) {
      await this.notifications.sendFacturaEmitida(facturaId).catch(() => undefined);
    }

    return {
      periodoId,
      facturasEmitidas: facturasCreadas.length,
      facturaIds: facturasCreadas,
    };
  }

  async registrarPago(facturaId: string, user: User, input: RegistrarPagoInput) {
    await this.applyPago({
      facturaId,
      monto: input.monto,
      metodo: input.metodo,
      referencia: input.referencia,
      fecha: input.fecha ? new Date(input.fecha) : new Date(),
      origen: 'MANUAL',
      canal: 'MANUAL',
      registradoPorId: user.id,
    });
    return this.getFactura(facturaId);
  }

  async consultarDeuda(identificacion: string) {
    const abonado = await this.findAbonadoByIdentificacion(identificacion);
    if (!abonado) throw new NotFoundException('Abonado no encontrado');

    const facturas = await this.prisma.factura.findMany({
      where: {
        abonadoId: abonado.id,
        status: { in: ['EMITIDA', 'VENCIDA'] },
      },
      orderBy: { fechaEmision: 'asc' },
    });

    const deudas = [];
    for (const factura of facturas) {
      const saldo = await this.getSaldoFactura(factura.id);
      if (saldo <= 0) continue;
      deudas.push({
        referencia: factura.numero,
        concepto: 'Servicio de agua potable EPA Manabí',
        monto: saldo,
        vencimiento: factura.fechaVencimiento.toISOString(),
      });
    }

    return {
      institucion: 'EPA Manabí — EPIM',
      identificacion,
      nombre: abonado.nombre,
      deudas,
      totalPendiente: deudas.reduce((sum, d) => sum + d.monto, 0),
    };
  }

  async procesarPagoBancario(input: RecaudacionPagoInput) {
    const existing = await this.prisma.pago.findUnique({
      where: { transaccionBancoId: input.transaccionId },
      include: { factura: true },
    });
    if (existing && !existing.revertido) {
      return {
        ok: true,
        transaccionId: input.transaccionId,
        referencia: existing.factura.numero,
        facturaStatus: existing.factura.status,
      };
    }

    const abonado = await this.findAbonadoByIdentificacion(input.identificacion);
    if (!abonado) throw new NotFoundException('Abonado no encontrado');

    const factura = await this.prisma.factura.findFirst({
      where: { numero: input.referencia, abonadoId: abonado.id },
    });
    if (!factura) throw new NotFoundException('Factura no encontrada');

    const saldo = await this.getSaldoFactura(factura.id);
    if (saldo <= 0) throw new BadRequestException('La factura no tiene saldo pendiente');
    if (Math.abs(input.monto - saldo) > 0.01) {
      throw new BadRequestException(`Monto incorrecto. Saldo pendiente: ${saldo.toFixed(2)}`);
    }

    await this.applyPago({
      facturaId: factura.id,
      monto: input.monto,
      metodo: this.canalToMetodo(input.canal),
      referencia: input.transaccionId,
      fecha: input.fechaPago ? new Date(input.fechaPago) : new Date(),
      origen: 'BANCO_PACIFICO',
      canal: input.canal,
      transaccionBancoId: input.transaccionId,
    });

    const updated = await this.prisma.factura.findUnique({ where: { id: factura.id } });

    return {
      ok: true,
      transaccionId: input.transaccionId,
      referencia: factura.numero,
      facturaStatus: updated?.status ?? 'PAGADA',
    };
  }

  async procesarReversoBancario(input: RecaudacionReversoInput) {
    const pago = await this.prisma.pago.findUnique({
      where: { transaccionBancoId: input.transaccionId },
      include: { factura: true },
    });
    if (!pago) throw new NotFoundException('Transacción no encontrada');
    if (pago.revertido) {
      return { ok: true, transaccionId: input.transaccionId, facturaStatus: pago.factura.status };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.pago.update({ where: { id: pago.id }, data: { revertido: true } });
      const pagosActivos = await tx.pago.findMany({
        where: { facturaId: pago.facturaId, revertido: false },
      });
      const totalPagado = pagosActivos.reduce((s, p) => s + p.monto, 0);
      const nuevoStatus = totalPagado >= pago.factura.total ? 'PAGADA' : 'EMITIDA';
      await tx.factura.update({
        where: { id: pago.facturaId },
        data: { status: nuevoStatus },
      });
    });

    const factura = await this.prisma.factura.findUnique({ where: { id: pago.facturaId } });
    return {
      ok: true,
      transaccionId: input.transaccionId,
      facturaStatus: factura?.status ?? 'EMITIDA',
    };
  }

  private async applyPago(params: {
    facturaId: string;
    monto: number;
    metodo: MetodoPago;
    referencia?: string;
    fecha: Date;
    origen: 'MANUAL' | 'BANCO_PACIFICO';
    canal?: PagoCanal;
    transaccionBancoId?: string;
    registradoPorId?: string;
  }) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: params.facturaId },
      include: { pagos: { where: { revertido: false } } },
    });
    if (!factura) throw new NotFoundException('Factura no encontrada');
    if (factura.status === 'ANULADA') {
      throw new BadRequestException('No se pueden registrar pagos en facturas anuladas');
    }

    const totalPagado = factura.pagos.reduce((sum, p) => sum + p.monto, 0);
    const saldo = factura.total - totalPagado;
    if (saldo <= 0) throw new BadRequestException('La factura ya está pagada');

    await this.prisma.$transaction(async (tx) => {
      await tx.pago.create({
        data: {
          facturaId: params.facturaId,
          monto: params.monto,
          metodo: params.metodo,
          origen: params.origen,
          canal: params.canal,
          transaccionBancoId: params.transaccionBancoId,
          referencia: params.referencia,
          fecha: params.fecha,
          registradoPorId: params.registradoPorId,
        },
      });

      const nuevoTotal = totalPagado + params.monto;
      if (nuevoTotal >= factura.total) {
        await tx.factura.update({
          where: { id: params.facturaId },
          data: { status: 'PAGADA' },
        });
      }
    });

    await this.notifications.sendComprobantePago(params.facturaId, params.monto).catch(() => undefined);
  }

  private async findAbonadoByIdentificacion(identificacion: string) {
    return this.prisma.abonado.findFirst({
      where: { OR: [{ cedula: identificacion }, { ruc: identificacion }] },
    });
  }

  private async getSaldoFactura(facturaId: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: { pagos: { where: { revertido: false } } },
    });
    if (!factura) return 0;
    const pagado = factura.pagos.reduce((s, p) => s + p.monto, 0);
    return Math.max(0, factura.total - pagado);
  }

  private canalToMetodo(canal: RecaudacionPagoInput['canal']): MetodoPago {
    const map = {
      VENTANILLA: 'PACIFICO_VENTANILLA',
      BANCA_WEB: 'PACIFICO_BANCA_WEB',
      BANCA_MOVIL: 'PACIFICO_BANCA_MOVIL',
    } as const;
    return map[canal];
  }

  async getResumen(periodoId?: string) {
    if (!periodoId) {
      const facturas = await this.prisma.factura.findMany({
        include: { pagos: { where: { revertido: false } } },
      });
      const totalEmitido = facturas.reduce((sum, f) => sum + f.total, 0);
      const totalCobrado = facturas.reduce(
        (sum, f) => sum + f.pagos.reduce((ps, p) => ps + p.monto, 0),
        0,
      );
      return {
        periodoId: null,
        totalFacturas: facturas.length,
        totalEmitido,
        totalCobrado,
        totalPendiente: Math.max(0, totalEmitido - totalCobrado),
      };
    }

    const periodo = await this.prisma.periodoFacturacion.findUnique({ where: { id: periodoId } });

    if (!periodo) {
      return { totalFacturas: 0, totalEmitido: 0, totalCobrado: 0, totalPendiente: 0 };
    }

    const facturas = await this.prisma.factura.findMany({
      where: { periodoId: periodo.id },
      include: { pagos: { where: { revertido: false } } },
    });

    const totalEmitido = facturas.reduce((sum, f) => sum + f.total, 0);
    const totalCobrado = facturas.reduce(
      (sum, f) => sum + f.pagos.reduce((ps, p) => ps + p.monto, 0),
      0,
    );

    return {
      periodoId: periodo.id,
      totalFacturas: facturas.length,
      totalEmitido,
      totalCobrado,
      totalPendiente: Math.max(0, totalEmitido - totalCobrado),
    };
  }

  private async countLecturasFacturables(periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  }) {
    const lecturas = await this.prisma.lectura.findMany({
      where: {
        fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
        visita: {
          status: 'VALIDATED',
          validacion: { status: 'APPROVED' },
        },
        facturaLineaActual: null,
      },
      select: { medidorId: true },
    });

    return new Set(lecturas.map((l) => l.medidorId)).size;
  }
}
