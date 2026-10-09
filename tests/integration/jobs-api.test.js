import { describe, it, expect, beforeEach, vi } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import { POST, GET } from '../../app/api/jobs/route.js';
import { GET as GET_ID, PATCH, DELETE } from '../../app/api/jobs/[id]/route.js';

vi.mock('../../lib/auth/session.js', () => ({
  getSessionOrThrow: vi.fn(),
}));
import { getSessionOrThrow } from '../../lib/auth/session.js';

describe('Jobs API', () => {
  let user;
  let job;

  beforeEach(async () => {
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.jobSkill.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();
    
    user = await prisma.user.create({
      data: {
        email: `jobs_api_test_${Date.now()}@example.com`,
        passwordHash: 'hashed',
        name: 'Jobs API Tester'
      }
    });

    getSessionOrThrow.mockResolvedValue({ user: { id: user.id } });
  });

  it('should create a job via POST', async () => {
    const data = {
      company: 'API Corp',
      role: 'Fullstack Dev',
      salaryMin: 90000
    };

    const req = new Request('http://localhost/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    
    const body = await res.json();
    expect(body.company).toBe('API Corp');
    expect(body.id).toBeDefined();
    
    job = body;
  });

  it('should list jobs via GET', async () => {
    // Re-create the job in this test block since beforeEach deletes it
    job = await prisma.job.create({
      data: { userId: user.id, company: 'API Corp', role: 'Dev' }
    });
    
    const req = new Request('http://localhost/api/jobs?search=API');
    const res = await GET(req);
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.total).toBeGreaterThanOrEqual(1);
    expect(body.jobs.some(j => j.id === job.id)).toBe(true);
  });

  it('should get job by id via GET', async () => {
    job = await prisma.job.create({
      data: { userId: user.id, company: 'API Corp', role: 'Dev' }
    });

    const req = new Request(`http://localhost/api/jobs/${job.id}`);
    const res = await GET_ID(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.id).toBe(job.id);
    expect(body.company).toBe('API Corp');
  });

  it('should update job via PATCH', async () => {
    job = await prisma.job.create({
      data: { userId: user.id, company: 'API Corp', role: 'Dev' }
    });

    const req = new Request(`http://localhost/api/jobs/${job.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'Senior Fullstack Dev' })
    });
    
    const res = await PATCH(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.role).toBe('Senior Fullstack Dev');
  });

  it('should archive job via PATCH', async () => {
    job = await prisma.job.create({
      data: { userId: user.id, company: 'API Corp', role: 'Dev' }
    });

    const req = new Request(`http://localhost/api/jobs/${job.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ archived: true })
    });
    
    const res = await PATCH(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.archived).toBe(true);
  });

  it('should prevent delete without force if applications linked', async () => {
    job = await prisma.job.create({
      data: { userId: user.id, company: 'API Corp', role: 'Dev' }
    });

    await prisma.application.create({
      data: {
        userId: user.id,
        jobId: job.id,
        company: 'API Corp',
        role: 'Role'
      }
    });

    const req = new Request(`http://localhost/api/jobs/${job.id}`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(409);
    
    const body = await res.json();
    expect(body.error.message).toMatch(/Cannot delete job/);
  });

  it('should delete job via DELETE with force', async () => {
    job = await prisma.job.create({
      data: { userId: user.id, company: 'API Corp', role: 'Dev' }
    });

    const req = new Request(`http://localhost/api/jobs/${job.id}?force=true`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(204);

    const getReq = new Request(`http://localhost/api/jobs/${job.id}`);
    const getRes = await GET_ID(getReq, { params: Promise.resolve({ id: job.id }) });
    expect(getRes.status).toBe(404);
  });
});
