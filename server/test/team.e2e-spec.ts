import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Teams (e2e)', () => {
  let app: INestApplication;
  let token1: string;
  let token2: string;
  let teamId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const s = Date.now();
    const r1 = await request(app.getHttpServer()).post('/auth/register')
      .send({ email: `team1_${s}@t.com`, username: `team1_${s}`, password: 'Test1234!' });
    token1 = r1.body.accessToken;
    const r2 = await request(app.getHttpServer()).post('/auth/register')
      .send({ email: `team2_${s}@t.com`, username: `team2_${s}`, password: 'Test1234!' });
    token2 = r2.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('POST /teams - create team', async () => {
    const res = await request(app.getHttpServer()).post('/teams')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Fitness Warriors' })
      .expect(201);
    expect(res.body.name).toBe('Fitness Warriors');
    expect(res.body.memberCount).toBe(1);
    teamId = res.body.id;
  });

  it('GET /teams - list teams', async () => {
    const res = await request(app.getHttpServer()).get('/teams')
      .set('Authorization', `Bearer ${token1}`).expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /teams/:id - get team', async () => {
    const res = await request(app.getHttpServer()).get(`/teams/${teamId}`)
      .set('Authorization', `Bearer ${token1}`).expect(200);
    expect(res.body.name).toBe('Fitness Warriors');
  });

  it('POST /teams/:id/join - join team', async () => {
    await request(app.getHttpServer()).post(`/teams/${teamId}/join`)
      .set('Authorization', `Bearer ${token2}`).expect(201);
  });

  it('GET /teams/:id/members - list members', async () => {
    const res = await request(app.getHttpServer()).get(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token1}`).expect(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /teams/my - list my teams', async () => {
    const res = await request(app.getHttpServer()).get('/teams/my')
      .set('Authorization', `Bearer ${token2}`).expect(200);
    expect(res.body.length).toBe(1);
  });

  it('POST /teams/:id/leave - leave team', async () => {
    await request(app.getHttpServer()).post(`/teams/${teamId}/leave`)
      .set('Authorization', `Bearer ${token2}`).expect(201);
  });

  it('DELETE /teams/:id - delete team', async () => {
    await request(app.getHttpServer()).delete(`/teams/${teamId}`)
      .set('Authorization', `Bearer ${token1}`).expect(200);
  });
});
