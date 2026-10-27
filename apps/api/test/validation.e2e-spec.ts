import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;

describe('Validation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let managerToken: string;

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
  });

  afterAll(async () => {
    if (!hasDb || !app) return;
    await app.close();
  });

  (hasDb ? it : it.skip)('aprobar validación actualiza estado sin export EPACOM', async () => {
    const pending = await prisma.validacion.findFirst({
      where: { status: 'PENDING' },
      include: { visita: true },
    });
    if (!pending) return;

    await request(app.getHttpServer())
      .patch(`/validation/${pending.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'APPROVED', comentario: 'E2E test' })
      .expect(200);

    const updated = await prisma.validacion.findUnique({ where: { id: pending.id } });
    expect(updated?.status).toBe('APPROVED');

    const visita = await prisma.visitaCampo.findUnique({ where: { id: pending.visitaId } });
    expect(visita?.status).toBe('VALIDATED');
  });
});
