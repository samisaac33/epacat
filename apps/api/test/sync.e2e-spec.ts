import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;

describe('Sync idempotency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  const clientBatchId = 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee';

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
      .send({ email: 'tecnico1@epim.gob.ec', password: 'epim123' });
    token = login.body.accessToken;
  });

  afterAll(async () => {
    if (!hasDb || !app) return;
    await prisma.syncBatch.deleteMany({ where: { clientBatchId } }).catch(() => {});
    await app.close();
  });

  (hasDb ? it : it.skip)('POST /sync/batches es idempotente con mismo clientBatchId', async () => {
    const payload = {
      clientBatchId,
      deviceId: 'e2e-test-device',
      operations: [
        {
          opId: '11111111-1111-4111-8111-111111111111',
          type: 'CREATE',
          entity: 'ABONADO',
          clientEntityId: '22222222-2222-4222-8222-222222222222',
          payload: {
            clientId: '22222222-2222-4222-8222-222222222222',
            cedula: '1399999999',
            nombre: 'Test E2E Abonado',
            direccion: 'Calle Test',
            sector: 'Test',
          },
        },
      ],
    };

    const first = await request(app.getHttpServer())
      .post('/sync/batches')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    const second = await request(app.getHttpServer())
      .post('/sync/batches')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(second.body.clientBatchId).toBe(first.body.clientBatchId);
    expect(second.body.accepted).toBe(first.body.accepted);

    const count = await prisma.abonado.count({
      where: { clientId: '22222222-2222-4222-8222-222222222222' },
    });
    expect(count).toBe(1);
  });
});
