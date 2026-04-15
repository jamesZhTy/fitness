import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    username: `testuser${Date.now()}`,
  };

  let accessToken: string;

  it('POST /auth/register - should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
  });

  it('POST /auth/register - should reject duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('POST /auth/login - should login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/login - should reject invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /auth/refresh - should return new tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/register - should reject invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'notanemail', password: 'password123', username: 'test' })
      .expect(400);
  });
});
