import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WorkoutController (e2e)', () => {
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

  let categoryId: string;
  let planId: string;

  it('GET /workouts/categories - should return categories', async () => {
    const res = await request(app.getHttpServer()).get('/workouts/categories').expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('icon');
    categoryId = res.body[0].id;
  });

  it('GET /workouts/categories/:id - should return a category', async () => {
    const res = await request(app.getHttpServer()).get(`/workouts/categories/${categoryId}`).expect(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body.id).toBe(categoryId);
  });

  it('GET /workouts/categories/:id - should 404 for invalid id', async () => {
    await request(app.getHttpServer()).get('/workouts/categories/00000000-0000-0000-0000-000000000000').expect(404);
  });

  it('GET /workouts/categories/:categoryId/plans - should return plans', async () => {
    const res = await request(app.getHttpServer()).get(`/workouts/categories/${categoryId}/plans`).expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('title');
    planId = res.body[0].id;
  });

  it('GET /workouts/categories/:categoryId/plans?difficulty=beginner - should filter', async () => {
    const res = await request(app.getHttpServer()).get(`/workouts/categories/${categoryId}/plans?difficulty=beginner`).expect(200);
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach((plan: any) => { expect(plan.difficulty).toBe('beginner'); });
  });

  it('GET /workouts/plans/:id - should return plan with phases and exercises', async () => {
    const res = await request(app.getHttpServer()).get(`/workouts/plans/${planId}`).expect(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('phases');
    expect(res.body.phases).toBeInstanceOf(Array);
    expect(res.body.phases.length).toBeGreaterThanOrEqual(1);
    expect(res.body.phases[0]).toHaveProperty('exercises');
  });

  it('GET /workouts/plans/:id - should 404 for invalid id', async () => {
    await request(app.getHttpServer()).get('/workouts/plans/00000000-0000-0000-0000-000000000000').expect(404);
  });
});
