import request from 'supertest';
import app from '../src/index';

describe('Inventory/Store API', () => {
  let token: string;
  let itemId: string;
  let requestId: string;

  beforeAll(async () => {
    // TODO: Replace with real login or mock
    token = 'test-token';
  });

  it('should reject unauthenticated inventory item creation', async () => {
    const res = await request(app)
      .post('/api/inventory/items')
      .send({ name: 'Cement', quantity: 100, unit: 'bags' });
    expect(res.status).toBe(401);
  });

  it('should create an inventory item with valid token and role', async () => {
    // TODO: Use a real token with store role
    const res = await request(app)
      .post('/api/inventory/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cement', quantity: 100, unit: 'bags' });
    // expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty('id');
    if (res.body && res.body.id) itemId = res.body.id;
    else throw new Error('No item id returned');
  });

  it('should create a material request', async () => {
    // TODO: Use a real token with site role and real itemId
    const res = await request(app)
      .post('/api/inventory/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId: 'proj1', itemId, quantity: 10 });
    // expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty('id');
    if (res.body && res.body.id) requestId = res.body.id;
    else throw new Error('No request id returned');
  });

  // Add more tests for RBAC, update, delete, etc.
}); 