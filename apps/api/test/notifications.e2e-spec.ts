import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { NotificationsService } from '../src/notifications/notifications.service';
import { PrismaService } from '../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;

describe('Notifications Resend stub (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let notifications: NotificationsService;

  beforeAll(async () => {
    if (!hasDb) return;
    delete process.env.RESEND_API_KEY;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    notifications = app.get(NotificationsService);
  });

  afterAll(async () => {
    if (!hasDb || !app) return;
    await app.close();
  });

  (hasDb ? it : it.skip)('registra CobranzaEmail en modo stub', async () => {
    const factura = await prisma.factura.findFirst({
      include: { abonado: true },
    });
    if (!factura) return;

    await prisma.abonado.update({
      where: { id: factura.abonadoId },
      data: { email: 'test-cobranza@example.com' },
    });

    await notifications.sendFacturaEmitida(factura.id);

    const log = await prisma.cobranzaEmail.findFirst({
      where: { facturaId: factura.id, tipo: 'FACTURA_EMITIDA' },
      orderBy: { createdAt: 'desc' },
    });

    expect(log).toBeTruthy();
    expect(log?.status).toBe('STUB');
    expect(log?.destino).toBe('test-cobranza@example.com');
  });
});
