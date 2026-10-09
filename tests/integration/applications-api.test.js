import { describe, it, expect, beforeEach, vi } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import { GET as getList, POST as createOne } from '../../app/api/applications/route.js';
import { GET as getOne, PATCH as updateOne, DELETE as deleteOne } from '../../app/api/applications/[id]/route.js';
import { PATCH as updateStatus } from '../../app/api/applications/[id]/status/route.js';

vi.mock('../../lib/auth/session.js', () => ({
  getSessionOrThrow: vi.fn(),
}));
import { getSessionOrThrow } from '../../lib/auth/session.js';

describe('Applications API Routes', () => {
  let userA, userB;

  beforeEach(async () => {
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    userA = await prisma.user.create({
      data: { email: 'apia@example.com', passwordHash: 'dummy' },
    });
    userB = await prisma.user.create({
      data: { email: 'apib@example.com', passwordHash: 'dummy' },
    });

    getSessionOrThrow.mockResolvedValue({ user: { id: userA.id } });
  });

  const mockRequest = (method, body = null, url = 'http://localhost:3000/api/applications') => {
    return new Request(url, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  describe('GET /api/applications', () => {
    it('returns a list of applications', async () => {
      await prisma.application.create({
        data: { userId: userA.id, company: 'Google', role: 'Dev' },
      });

      const req = mockRequest('GET');
      const res = await getList(req);
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.applications.length).toBe(1);
    });
  });

  describe('POST /api/applications', () => {
    it('creates an application', async () => {
      const req = mockRequest('POST', { company: 'Apple', role: 'Dev' });
      const res = await createOne(req);
      
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.company).toBe('Apple');
      expect(data.status).toBe('SAVED');
    });

    it('returns 400 on validation error', async () => {
      const req = mockRequest('POST', { company: 'Apple' }); // missing role
      const res = await createOne(req);
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/applications/:id', () => {
    it('returns an application', async () => {
      const app = await prisma.application.create({
        data: { userId: userA.id, company: 'Google', role: 'Dev' },
      });

      const req = mockRequest('GET');
      const res = await getOne(req, { params: { id: app.id } });
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(app.id);
    });

    it('returns 404 for unowned application', async () => {
      const app = await prisma.application.create({
        data: { userId: userB.id, company: 'Google', role: 'Dev' },
      });

      const req = mockRequest('GET');
      const res = await getOne(req, { params: { id: app.id } });
      
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/applications/:id', () => {
    it('updates an application', async () => {
      const app = await prisma.application.create({
        data: { userId: userA.id, company: 'Google', role: 'Dev' },
      });

      const req = mockRequest('PATCH', { role: 'Lead Dev' });
      const res = await updateOne(req, { params: { id: app.id } });
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.role).toBe('Lead Dev');
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('deletes an application', async () => {
      const app = await prisma.application.create({
        data: { userId: userA.id, company: 'Google', role: 'Dev' },
      });

      const req = mockRequest('DELETE');
      const res = await deleteOne(req, { params: { id: app.id } });
      
      expect(res.status).toBe(204);
      const check = await prisma.application.findUnique({ where: { id: app.id } });
      expect(check).toBeNull();
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('updates status and history', async () => {
      const app = await prisma.application.create({
        data: { userId: userA.id, company: 'Google', role: 'Dev', status: 'SAVED' },
      });

      const req = mockRequest('PATCH', { status: 'INTERVIEW', note: 'Scheduled' });
      const res = await updateStatus(req, { params: { id: app.id } });
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('INTERVIEW');
    });
  });
});
