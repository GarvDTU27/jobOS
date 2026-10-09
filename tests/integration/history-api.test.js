import { describe, it, expect, beforeEach, vi } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import { GET as getHistory } from '../../app/api/applications/[id]/history/route.js';

vi.mock('../../lib/auth/session.js', () => ({
  getSessionOrThrow: vi.fn(),
}));
import { getSessionOrThrow } from '../../lib/auth/session.js';

describe('Application History API Routes', () => {
  let userA, userB, appA, appB;

  beforeEach(async () => {
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    userA = await prisma.user.create({ data: { email: 'histA@example.com', passwordHash: 'dummy' } });
    userB = await prisma.user.create({ data: { email: 'histB@example.com', passwordHash: 'dummy' } });

    appA = await prisma.application.create({ data: { userId: userA.id, company: 'A', role: 'A', status: 'SAVED' } });
    appB = await prisma.application.create({ data: { userId: userB.id, company: 'B', role: 'B', status: 'SAVED' } });

    getSessionOrThrow.mockResolvedValue({ user: { id: userA.id } });
  });

  const mockRequest = () => {
    return new Request('http://localhost:3000', {
      method: 'GET',
    });
  };

  it('gets application status history', async () => {
    await prisma.applicationStatusHistory.create({
      data: { applicationId: appA.id, toStatus: 'SAVED', changedAt: new Date('2023-01-01') },
    });
    await prisma.applicationStatusHistory.create({
      data: { applicationId: appA.id, fromStatus: 'SAVED', toStatus: 'APPLIED', changedAt: new Date('2023-01-02') },
    });

    const res = await getHistory(mockRequest(), { params: { id: appA.id } });
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.length).toBe(2);
    expect(data[0].toStatus).toBe('SAVED');
    expect(data[1].toStatus).toBe('APPLIED');
  });

  it('rejects fetching history for unowned application', async () => {
    const res = await getHistory(mockRequest(), { params: { id: appB.id } });
    expect(res.status).toBe(404);
  });
});
