import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const hasDb = !!process.env.DATABASE_URL;

describe('Comercial (e2e)', () => {
  let app: INestApplication;
  let managerToken: string;

  beforeAll(async () => {
    if (!hasDb) return;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'gerente@epim.gob.ec', password: 'epim123' });
    managerToken = login.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /comercial/tarifas', async () => {
    if (!hasDb) return;
    const res = await request(app.getHttpServer())
      .get('/comercial/tarifas')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(5);
  });

  it('GET /comercial/analisis', async () => {
    if (!hasDb) return;
    const res = await request(app.getHttpServer())
      .get('/comercial/analisis')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    expect(res.body.meta?.id).toBe('manabi-cruce-ruaa-epa');
    expect(res.body.result?.resumen?.totalFilasEpa).toBeGreaterThan(0);
    expect(Array.isArray(res.body.result?.filas)).toBe(true);
  });
});
