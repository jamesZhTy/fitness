import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CheckInController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: `checkin-${Date.now()}@test.com`, password: 'password123', username: `checkin${Date.now()}`,
    });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('POST /checkins - should create a check-in', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app.getHttpServer()).post('/checkins')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ date: today, duration: 30, caloriesBurned: 200, mood: 'great', note: 'Good workout' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.duration).toBe(30);
    expect(res.body.mood).toBe('great');
  });

  it('POST /checkins - should reject without auth', async () => {
    await request(app.getHttpServer()).post('/checkins').send({ duration: 30 }).expect(401);
  });

  it('GET /checkins - should return check-ins for current month', async () => {
    const now = new Date();
    const res = await request(app.getHttpServer()).get('/checkins')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ year: now.getFullYear(), month: now.getMonth() + 1 })
      .expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /checkins/stats - should return stats', async () => {
    const res = await request(app.getHttpServer()).get('/checkins/stats')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ period: 'week' })
      .expect(200);
    expect(res.body).toHaveProperty('totalCheckIns');
    expect(res.body).toHaveProperty('totalDuration');
    expect(res.body).toHaveProperty('totalCalories');
    expect(res.body).toHaveProperty('streak');
  });
});
