import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Challenges (e2e)', () => {
  let app: INestApplication;
  let token1: string;
  let token2: string;
  let challengeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const s = Date.now();
    const r1 = await request(app.getHttpServer()).post('/auth/register')
      .send({ email: `chal1_${s}@t.com`, username: `chal1_${s}`, password: 'Test1234!' });
    token1 = r1.body.accessToken;
    const r2 = await request(app.getHttpServer()).post('/auth/register')
      .send({ email: `chal2_${s}@t.com`, username: `chal2_${s}`, password: 'Test1234!' });
    token2 = r2.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('POST /challenges - create challenge', async () => {
    const res = await request(app.getHttpServer()).post('/challenges')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: '30 Day Check-in',
        description: 'Check in every day for 30 days',
        type: 'consecutive_checkin',
        goal: 30,
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      })
      .expect(201);
    expect(res.body.title).toBe('30 Day Check-in');
    challengeId = res.body.id;
  });

  it('GET /challenges - list challenges', async () => {
    const res = await request(app.getHttpServer()).get('/challenges')
      .set('Authorization', `Bearer ${token1}`).expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /challenges/:id - get challenge', async () => {
    const res = await request(app.getHttpServer()).get(`/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${token1}`).expect(200);
    expect(res.body.title).toBe('30 Day Check-in');
  });

  it('POST /challenges/:id/join - join challenge', async () => {
    await request(app.getHttpServer()).post(`/challenges/${challengeId}/join`)
      .set('Authorization', `Bearer ${token2}`).expect(201);
  });

  it('POST /challenges/:id/join - duplicate join fails', async () => {
    await request(app.getHttpServer()).post(`/challenges/${challengeId}/join`)
      .set('Authorization', `Bearer ${token2}`).expect(400);
  });

  it('GET /challenges/:id/leaderboard - get leaderboard', async () => {
    const res = await request(app.getHttpServer()).get(`/challenges/${challengeId}/leaderboard`)
      .set('Authorization', `Bearer ${token1}`).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /challenges/my - list my challenges', async () => {
    const res = await request(app.getHttpServer()).get('/challenges/my')
      .set('Authorization', `Bearer ${token2}`).expect(200);
    expect(res.body.length).toBe(1);
  });
});
