import request from 'supertest';
import app from '../src/index';

describe('Roadmap Immutability', () => {
  it('should not allow users to modify roadmap data', async () => {
    // Simulate user token
    const userToken = 'USER_JWT_TOKEN';
    const res = await request(app)
      .patch('/api/roadmaps/admin/activate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ roadmapId: 'test', isActive: false });
    expect(res.status).toBe(403);
  });

  it('should not allow AI to modify roadmap data', async () => {
    // Simulate AI token or context
    const aiToken = 'AI_JWT_TOKEN';
    const res = await request(app)
      .patch('/api/roadmaps/admin/activate')
      .set('Authorization', `Bearer ${aiToken}`)
      .send({ roadmapId: 'test', isActive: false });
    expect(res.status).toBe(403);
  });
});
