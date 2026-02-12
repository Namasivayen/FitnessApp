import request from 'supertest';
import app from '../src/index';

describe('User Roadmap Rules', () => {
  it('should only allow one active roadmap per user', async () => {
    const userToken = 'USER_JWT_TOKEN';
    // First selection
    await request(app)
      .post('/api/roadmaps/select')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ roadmapId: 'roadmap1' });
    // Second selection should fail
    const res = await request(app)
      .post('/api/roadmaps/select')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ roadmapId: 'roadmap2' });
    expect(res.status).toBe(409);
  });
});
