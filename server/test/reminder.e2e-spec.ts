import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ReminderController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let reminderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: `reminder-${Date.now()}@test.com`, password: 'password123', username: `reminder${Date.now()}`,
    });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('POST /reminders - should create a reminder', async () => {
    const res = await request(app.getHttpServer()).post('/reminders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ time: '08:00', repeatDays: ['Mon', 'Wed', 'Fri'], message: 'Morning workout!' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.time).toBe('08:00:00');
    reminderId = res.body.id;
  });

  it('GET /reminders - should return user reminders', async () => {
    const res = await request(app.getHttpServer()).get('/reminders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
  });

  it('PATCH /reminders/:id - should update reminder', async () => {
    const res = await request(app.getHttpServer()).patch(`/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isEnabled: false })
      .expect(200);
    expect(res.body.isEnabled).toBe(false);
  });

  it('DELETE /reminders/:id - should delete reminder', async () => {
    await request(app.getHttpServer()).delete(`/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /reminders - should be empty after delete', async () => {
    const res = await request(app.getHttpServer()).get('/reminders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toHaveLength(0);
  });
});
