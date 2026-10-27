import { Injectable, Logger } from '@nestjs/common';
import { CobranzaEmailStatus, CobranzaEmailTipo } from '@epacat/database';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendFacturaEmitida(facturaId: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: { abonado: true, periodo: true },
    });
    if (!factura?.abonado.email) return;

    const subject = `EPIM — Nueva factura ${factura.numero}`;
    const html = this.templateFacturaEmitida(
      factura.abonado.nombre,
      factura.numero,
      factura.total,
      factura.periodo.mes,
      factura.periodo.anio,
      factura.fechaVencimiento,
    );

    await this.sendEmail({
      facturaId,
      abonadoId: factura.abonadoId,
      tipo: 'FACTURA_EMITIDA',
      destino: factura.abonado.email,
      subject,
      html,
    });
  }

  async sendComprobantePago(facturaId: string, monto: number) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: { abonado: true },
    });
    if (!factura?.abonado.email) return;

    const subject = `EPIM — Comprobante de pago ${factura.numero}`;
    const html = this.templateComprobante(
      factura.abonado.nombre,
      factura.numero,
      monto,
      factura.status,
    );

    await this.sendEmail({
      facturaId,
      abonadoId: factura.abonadoId,
      tipo: 'COMPROBANTE_PAGO',
      destino: factura.abonado.email,
      subject,
      html,
    });
  }

  async sendRecordatoriosCobranza() {
    const hoy = new Date();
    const enTresDias = new Date(hoy);
    enTresDias.setDate(enTresDias.getDate() + 3);

    const facturas = await this.prisma.factura.findMany({
      where: {
        status: { in: ['EMITIDA', 'VENCIDA'] },
        OR: [
          { fechaVencimiento: { lte: hoy } },
          { fechaVencimiento: { lte: enTresDias, gte: hoy } },
        ],
      },
      include: { abonado: true },
    });

    for (const factura of facturas) {
      if (!factura.abonado.email) continue;

      const pagos = await this.prisma.pago.findMany({
        where: { facturaId: factura.id, revertido: false },
      });
      const pagado = pagos.reduce((s, p) => s + p.monto, 0);
      const saldo = factura.total - pagado;
      if (saldo <= 0) continue;

      const yaEnviado = await this.prisma.cobranzaEmail.findFirst({
        where: {
          facturaId: factura.id,
          tipo: { in: ['RECORDATORIO', 'VENCIMIENTO'] },
          createdAt: { gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) },
        },
      });
      if (yaEnviado) continue;

      const vencida = factura.fechaVencimiento < hoy;
      if (vencida && factura.status === 'EMITIDA') {
        await this.prisma.factura.update({
          where: { id: factura.id },
          data: { status: 'VENCIDA' },
        });
      }

      const tipo: CobranzaEmailTipo = vencida ? 'VENCIMIENTO' : 'RECORDATORIO';
      const subject = vencida
        ? `EPIM — Factura vencida ${factura.numero}`
        : `EPIM — Recordatorio de pago ${factura.numero}`;

      await this.sendEmail({
        facturaId: factura.id,
        abonadoId: factura.abonadoId,
        tipo,
        destino: factura.abonado.email,
        subject,
        html: this.templateRecordatorio(
          factura.abonado.nombre,
          factura.numero,
          saldo,
          factura.fechaVencimiento,
          vencida,
        ),
      });
    }
  }

  private async sendEmail(params: {
    facturaId?: string;
    abonadoId: string;
    tipo: CobranzaEmailTipo;
    destino: string;
    subject: string;
    html: string;
  }) {
    const from = process.env.RESEND_FROM_EMAIL ?? 'cobranza@epim.gob.ec';

    if (!this.resend) {
      this.logger.log(`[STUB] ${params.tipo} → ${params.destino}: ${params.subject}`);
      await this.prisma.cobranzaEmail.create({
        data: {
          facturaId: params.facturaId,
          abonadoId: params.abonadoId,
          tipo: params.tipo,
          destino: params.destino,
          status: 'STUB',
        },
      });
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from,
        to: params.destino,
        subject: params.subject,
        html: params.html,
      });

      await this.prisma.cobranzaEmail.create({
        data: {
          facturaId: params.facturaId,
          abonadoId: params.abonadoId,
          tipo: params.tipo,
          destino: params.destino,
          resendId: result.data?.id ?? null,
          status: 'SENT',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(`Resend error: ${message}`);
      await this.prisma.cobranzaEmail.create({
        data: {
          facturaId: params.facturaId,
          abonadoId: params.abonadoId,
          tipo: params.tipo,
          destino: params.destino,
          status: 'FAILED',
          error: message,
        },
      });
    }
  }

  private templateFacturaEmitida(
    nombre: string,
    numero: string,
    total: number,
    mes: number,
    anio: number,
    vencimiento: Date,
  ) {
    return `
      <h2>EPA Manabí — EPIM</h2>
      <p>Estimado/a ${nombre},</p>
      <p>Se ha emitido su factura de servicio de agua potable:</p>
      <ul>
        <li><strong>Número:</strong> ${numero}</li>
        <li><strong>Periodo:</strong> ${mes}/${anio}</li>
        <li><strong>Total:</strong> $${total.toFixed(2)}</li>
        <li><strong>Vencimiento:</strong> ${vencimiento.toLocaleDateString('es-EC')}</li>
      </ul>
      <p>Puede pagar en ventanilla o banca en línea de <strong>Banco Pacífico</strong> con su cédula o RUC.</p>
    `;
  }

  private templateComprobante(nombre: string, numero: string, monto: number, status: string) {
    return `
      <h2>EPA Manabí — EPIM</h2>
      <p>Estimado/a ${nombre},</p>
      <p>Confirmamos el registro de su pago:</p>
      <ul>
        <li><strong>Factura:</strong> ${numero}</li>
        <li><strong>Monto pagado:</strong> $${monto.toFixed(2)}</li>
        <li><strong>Estado:</strong> ${status}</li>
      </ul>
      <p>Gracias por mantener su servicio al día.</p>
    `;
  }

  private templateRecordatorio(
    nombre: string,
    numero: string,
    saldo: number,
    vencimiento: Date,
    vencida: boolean,
  ) {
    return `
      <h2>EPA Manabí — EPIM</h2>
      <p>Estimado/a ${nombre},</p>
      <p>${vencida ? 'Su factura se encuentra vencida.' : 'Le recordamos su factura pendiente de pago.'}</p>
      <ul>
        <li><strong>Factura:</strong> ${numero}</li>
        <li><strong>Saldo pendiente:</strong> $${saldo.toFixed(2)}</li>
        <li><strong>Vencimiento:</strong> ${vencimiento.toLocaleDateString('es-EC')}</li>
      </ul>
      <p>Pague en ventanilla o banca en línea de Banco Pacífico con su cédula o RUC.</p>
    `;
  }
}
