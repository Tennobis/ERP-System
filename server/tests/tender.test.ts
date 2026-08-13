import request from 'supertest';
import app from '../src/index';

describe('Tender API', () => {
  let token: string;
  let tenderId: string;
  let bidId: string;

  beforeAll(async () => {
    // TODO: Replace with real login or mock
    token = 'test-token';
  });

  it('should reject unauthenticated tender creation', async () => {
    const res = await request(app)
      .post('/api/tenders')
      .send({ title: 'Tender X', description: 'Test', deadline: '2024-12-31', budget: 50000 });
    expect(res.status).toBe(401);
  });

  it('should create a tender with valid token and role', async () => {
    // TODO: Use a real token with md role
    const res = await request(app)
      .post('/api/tenders')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Tender X', description: 'Test', deadline: '2024-12-31', budget: 50000 });
    // expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty('id');
    if (res.body && res.body.id) tenderId = res.body.id;
    else throw new Error('No tender id returned');
  });

  it('should submit a bid to a tender', async () => {
    // TODO: Use a real token with client_manager role and real tenderId
    const res = await request(app)
      .post(`/api/tenders/${tenderId}/bids`)
      .set('Authorization', `Bearer ${token}`)
      .send({ vendorId: 'vendor1', amount: 10000 });
    // expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty('id');
    if (res.body && res.body.id) bidId = res.body.id;
    else throw new Error('No bid id returned');
  });

  // Add more tests for RBAC, update, delete, etc.
}); 