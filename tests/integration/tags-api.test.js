import { describe, it, expect, beforeEach, vi } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import { GET as getTags, POST as addTag } from '../../app/api/applications/[id]/tags/route.js';
import { DELETE as removeTag } from '../../app/api/applications/[id]/tags/[tagId]/route.js';

vi.mock('../../lib/auth/session.js', () => ({
  getSessionOrThrow: vi.fn(),
}));
import { getSessionOrThrow } from '../../lib/auth/session.js';

describe('Tags API Routes', () => {
  let userA, userB, appA, appB;

  beforeEach(async () => {
    await prisma.applicationTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    userA = await prisma.user.create({ data: { email: 'tagA@example.com', passwordHash: 'dummy' } });
    userB = await prisma.user.create({ data: { email: 'tagB@example.com', passwordHash: 'dummy' } });

    appA = await prisma.application.create({ data: { userId: userA.id, company: 'A', role: 'A' } });
    appB = await prisma.application.create({ data: { userId: userB.id, company: 'B', role: 'B' } });

    getSessionOrThrow.mockResolvedValue({ user: { id: userA.id } });
  });

  const mockRequest = (method, body = null) => {
    return new Request('http://localhost:3000', {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  it('adds a tag to an application', async () => {
    const res = await addTag(mockRequest('POST', { name: 'Remote' }), { params: { id: appA.id } });
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.tag.name).toBe('remote');
  });

  it('gets tags for an application', async () => {
    await addTag(mockRequest('POST', { name: 'Remote' }), { params: { id: appA.id } });
    
    const res = await getTags(mockRequest('GET'), { params: { id: appA.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('remote');
  });

  it('removes a tag from an application', async () => {
    const addRes = await addTag(mockRequest('POST', { name: 'Remote' }), { params: { id: appA.id } });
    const addData = await addRes.json();
    
    const delRes = await removeTag(mockRequest('DELETE'), { params: { id: appA.id, tagId: addData.tag.id } });
    expect(delRes.status).toBe(204);

    const getRes = await getTags(mockRequest('GET'), { params: { id: appA.id } });
    const getData = await getRes.json();
    expect(getData.length).toBe(0);
  });

  it('rejects adding tag to unowned application', async () => {
    const res = await addTag(mockRequest('POST', { name: 'Remote' }), { params: { id: appB.id } });
    expect(res.status).toBe(404);
  });

  it('prevents duplicate tags on same application', async () => {
    await addTag(mockRequest('POST', { name: 'Remote' }), { params: { id: appA.id } });
    const res2 = await addTag(mockRequest('POST', { name: ' remote ' }), { params: { id: appA.id } });
    
    // Upsert gracefully handles it
    expect(res2.status).toBe(201);
    
    const getRes = await getTags(mockRequest('GET'), { params: { id: appA.id } });
    const getData = await getRes.json();
    expect(getData.length).toBe(1);
  });
});
