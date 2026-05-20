import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;

describe('Validation + EPACOM stub (e2e)', () => {
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
      .send({ email: 'gerente@epacat.gob.ec', password: 'epacat123' });
    managerToken = login.body.accessToken;
  });

  afterAll(async () => {
    if (!hasDb || !app) return;
    await app.close();
  });

  (hasDb ? it : it.skip)('aprobar validación genera job EPACOM DONE con archivo', async () => {
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

    const job = await prisma.epacomExportJob.findFirst({
      where: { visitaId: pending.visitaId, status: 'DONE' },
      orderBy: { createdAt: 'desc' },
    });

    expect(job).toBeTruthy();
    expect(job?.outputPath).toBeTruthy();
    if (job?.outputPath) {
      expect(fs.existsSync(path.resolve(job.outputPath))).toBe(true);
    }

    const updated = await prisma.validacion.findUnique({ where: { id: pending.id } });
    expect(updated?.status).toBe('APPROVED');
  });
});
