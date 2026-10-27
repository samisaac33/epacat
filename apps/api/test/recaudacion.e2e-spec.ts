import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;
const BANCO_KEY = process.env.BANCO_PACIFICO_API_KEY ?? 'dev-banco-pacifico-key';

describe('Recaudacion Banco Pacífico (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let managerToken: string;
  let periodoId: string;
  let facturaNumero: string;

  beforeAll(async () => {
    if (!hasDb) return;
    process.env.BANCO_PACIFICO_API_KEY = BANCO_KEY;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'gerente@epim.gob.ec', password: 'epim123' });
    managerToken = login.body.accessToken;

    await prisma.tarifa.upsert({
      where: { id: 'tarifa-rec-e2e' },
      update: { activa: true },
      create: {
        id: 'tarifa-rec-e2e',
        nombre: 'E2E Recaudación',
        cargoFijo: 2.5,
        precioM3: 0.5,
        activa: true,
      },
    });
    await prisma.tarifa.updateMany({
      where: { id: { not: 'tarifa-rec-e2e' } },
      data: { activa: false },
    });

    const now = new Date();
    const periodo = await prisma.periodoFacturacion.upsert({
      where: { anio_mes: { anio: now.getFullYear(), mes: now.getMonth() + 1 } },
      update: { status: 'ABIERTO' },
      create: {
        anio: now.getFullYear(),
        mes: now.getMonth() + 1,
        status: 'ABIERTO',
        fechaInicio: new Date(now.getFullYear(), now.getMonth(), 1),
        fechaFin: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      },
    });
    periodoId = periodo.id;

    const pending = await prisma.validacion.findFirst({ where: { status: 'PENDING' } });
    if (pending) {
      await request(app.getHttpServer())
        .patch(`/validation/${pending.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: 'APPROVED' });
    }

    const cierre = await request(app.getHttpServer())
      .post(`/billing/periodos/${periodoId}/cerrar`)
      .set('Authorization', `Bearer ${managerToken}`);
    if (cierre.body.facturaIds?.length) {
      const f = await prisma.factura.findUnique({ where: { id: cierre.body.facturaIds[0] } });
      facturaNumero = f!.numero;
      await prisma.factura.update({
        where: { id: f!.id },
        data: { status: 'EMITIDA' },
      });
    } else {
      const f = await prisma.factura.findFirst({
        where: { status: { in: ['EMITIDA', 'VENCIDA'] } },
      });
      facturaNumero = f?.numero ?? '';
    }
  });

  afterAll(async () => {
    if (!hasDb || !app) return;
    await app.close();
  });

  (hasDb ? it : it.skip)('consulta deuda por cédula', async () => {
    const res = await request(app.getHttpServer())
      .get('/recaudacion/v1/consulta?identificacion=1301234567')
      .set('X-Banco-Api-Key', BANCO_KEY)
      .expect(200);

    expect(res.body.nombre).toBeTruthy();
    expect(res.body).toHaveProperty('totalPendiente');
  });

  (hasDb ? it : it.skip)('notificación de pago idempotente', async () => {
    if (!facturaNumero) return;

    const consulta = await request(app.getHttpServer())
      .get('/recaudacion/v1/consulta?identificacion=1301234567')
      .set('X-Banco-Api-Key', BANCO_KEY)
      .expect(200);

    const deuda = consulta.body.deudas.find((d: { referencia: string }) => d.referencia === facturaNumero);
    if (!deuda) return;

    const payload = {
      transaccionId: 'BP-E2E-RECAUDACION-001',
      identificacion: '1301234567',
      referencia: facturaNumero,
      monto: deuda.monto,
      canal: 'VENTANILLA',
    };

    await request(app.getHttpServer())
      .post('/recaudacion/v1/pago')
      .set('X-Banco-Api-Key', BANCO_KEY)
      .send(payload)
      .expect(200);

    await request(app.getHttpServer())
      .post('/recaudacion/v1/pago')
      .set('X-Banco-Api-Key', BANCO_KEY)
      .send(payload)
      .expect(200);

    const factura = await prisma.factura.findUnique({ where: { numero: facturaNumero } });
    expect(factura?.status).toBe('PAGADA');

    const emailLog = await prisma.cobranzaEmail.findFirst({
      where: { facturaId: factura!.id, tipo: 'COMPROBANTE_PAGO' },
    });
    expect(emailLog).toBeTruthy();
  });
});
