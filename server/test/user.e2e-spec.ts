import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `usertest-${Date.now()}@example.com`,
        password: 'password123',
        username: `usertest${Date.now()}`,
      });

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/me - should return current user profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('username');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('GET /users/me - should reject without token', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
  });

  it('PATCH /users/me - should update user profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bio: 'Fitness beginner!', height: 175, weight: 70 })
      .expect(200);

    expect(res.body.bio).toBe('Fitness beginner!');
    expect(res.body.height).toBe(175);
    expect(res.body.weight).toBe(70);
  });

  it('PATCH /users/me - should reject invalid fitnessLevel', async () => {
    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fitnessLevel: 'invalid' })
      .expect(400);
  });
});
