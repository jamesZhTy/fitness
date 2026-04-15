import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Social (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let accessToken2: string;
  let userId: string;
  let userId2: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const suffix = Date.now();
    const res1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `social1_${suffix}@test.com`,
        username: `social1_${suffix}`,
        password: 'Test1234!',
      });
    accessToken = res1.body.accessToken;

    const profile1 = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    userId = profile1.body.id;

    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `social2_${suffix}@test.com`,
        username: `social2_${suffix}`,
        password: 'Test1234!',
      });
    accessToken2 = res2.body.accessToken;

    const profile2 = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken2}`);
    userId2 = profile2.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /posts - should create a post', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'My first workout post!' })
      .expect(201);

    expect(res.body.content).toBe('My first workout post!');
    expect(res.body.id).toBeDefined();
    postId = res.body.id;
  });

  it('GET /posts/:id - should get post detail', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.content).toBe('My first workout post!');
    expect(res.body.user).toBeDefined();
  });

  it('GET /posts/feed - should return feed', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts/feed')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /posts/:postId/comments - should add comment', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({ content: 'Great job!' })
      .expect(201);

    expect(res.body.content).toBe('Great job!');
    commentId = res.body.id;
  });

  it('GET /posts/:postId/comments - should list comments', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe('Great job!');
  });

  it('POST /posts/:postId/like - should toggle like on', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(201);

    expect(res.body.liked).toBe(true);
  });

  it('POST /posts/:postId/like - should toggle like off', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(201);

    expect(res.body.liked).toBe(false);
  });

  it('POST /users/:userId/follow - should follow user', async () => {
    const res = await request(app.getHttpServer())
      .post(`/users/${userId}/follow`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(201);

    expect(res.body.following).toBe(true);
  });

  it('GET /users/:userId/followers - should list followers', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}/followers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.length).toBe(1);
  });

  it('GET /users/:userId/follow-counts - should return counts', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}/follow-counts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.followers).toBe(1);
    expect(res.body.following).toBe(0);
  });

  it('GET /posts/feed - user2 should see user1 posts after following', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts/feed')
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(200);

    expect(res.body.some((p: any) => p.id === postId)).toBe(true);
  });

  it('DELETE /comments/:id - should delete own comment', async () => {
    await request(app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(200);
  });

  it('DELETE /posts/:id - should delete own post', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
