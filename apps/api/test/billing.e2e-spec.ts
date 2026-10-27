import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;

describe('Billing (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let managerToken: string;
  let periodoId: string;

  beforeAll(async () => {
    if (!hasDb) return;
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
      where: { id: 'tarifa-e2e' },
      update: { activa: true, cargoFijo: 2.5, precioM3: 0.5 },
      create: {
        id: 'tarifa-e2e',
        nombre: 'E2E Tarifa',
        cargoFijo: 2.5,
        precioM3: 0.5,
        activa: true,
      },
    });
    await prisma.tarifa.updateMany({
      where: { id: { not: 'tarifa-e2e' } },
      data: { activa: false },
    });

    const now = new Date();
    const anio = now.getFullYear();
    const mes = now.getMonth() + 1;
    const periodo = await prisma.periodoFacturacion.upsert({
      where: { anio_mes: { anio, mes } },
      update: { status: 'ABIERTO' },
      create: {
        anio,
        mes,
        status: 'ABIERTO',
        fechaInicio: new Date(anio, mes - 1, 1),
        fechaFin: new Date(anio, mes, 0, 23, 59, 59, 999),
      },
    });
    periodoId = periodo.id;

    const pending = await prisma.validacion.findFirst({
      where: { status: 'PENDING' },
    });
    if (pending) {
      await request(app.getHttpServer())
        .patch(`/validation/${pending.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: 'APPROVED', comentario: 'E2E billing setup' });
    } else {
      const visita = await prisma.visitaCampo.findFirst({
        where: { status: 'SYNCED' },
        include: { validacion: true },
      });
      if (visita?.validacion) {
        await request(app.getHttpServer())
          .patch(`/validation/${visita.validacion.id}`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ status: 'APPROVED', comentario: 'E2E billing setup' });
      }
    }
  });

  afterAll(async () => {
    if (!hasDb || !app) return;
    await app.close();
  });

  (hasDb ? it : it.skip)('cerrar periodo emite facturas por lecturas validadas', async () => {
    const res = await request(app.getHttpServer())
      .post(`/billing/periodos/${periodoId}/cerrar`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(res.body.facturasEmitidas).toBeGreaterThanOrEqual(0);

    if (res.body.facturaIds?.length > 0) {
      const facturaId = res.body.facturaIds[0];
      const detalle = await request(app.getHttpServer())
        .get(`/billing/facturas/${facturaId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(detalle.body.numero).toBeTruthy();
      expect(detalle.body.total).toBeGreaterThanOrEqual(0);

      await request(app.getHttpServer())
        .post(`/billing/facturas/${facturaId}/pagos`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ monto: detalle.body.total, metodo: 'EFECTIVO' })
        .expect(200);

      const pagada = await prisma.factura.findUnique({ where: { id: facturaId } });
      expect(pagada?.status).toBe('PAGADA');
    }
  });
});
