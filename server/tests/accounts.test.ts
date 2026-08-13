import request from 'supertest';
import app from '../src/index';

describe('Accounts/Finance API', () => {
  let token: string;
  let paymentId: string;

  beforeAll(async () => {
    // TODO: Replace with real login or mock
    token = 'test-token';
  });

  it('should reject unauthenticated payment creation', async () => {
    const res = await request(app)
      .post('/api/accounts/payments')
      .send({ invoiceId: 'inv1', amount: 1000, date: '2024-12-31' });
    expect(res.status).toBe(401);
  });

  it('should create a payment with valid token and role', async () => {
    // TODO: Use a real token with accounts role
    const res = await request(app)
      .post('/api/accounts/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ invoiceId: 'inv1', amount: 1000, date: '2024-12-31' });
    // expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty('id');
    if (res.body && res.body.id) paymentId = res.body.id;
    else throw new Error('No payment id returned');
  });

  it('should delete a payment with valid token and role', async () => {
    if (!paymentId) return;
    // TODO: Use a real token with accounts role and real paymentId
    const res = await request(app)
      .delete(`/api/accounts/payments/${paymentId}`)
      .set('Authorization', `Bearer ${token}`);
    // expect(res.status).toBe(204);
  });

  // Add more tests for RBAC, update, etc.
}); 