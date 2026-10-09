import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import { listApplications } from '../../lib/services/application-service.js';

describe('Application Filter and Sort', () => {
  let user;

  beforeEach(async () => {
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    user = await prisma.user.create({
      data: { email: 'filteruser@example.com', passwordHash: 'dummy' },
    });

    await prisma.application.createMany({
      data: [
        { userId: user.id, company: 'Apple', role: 'Engineer', status: 'SAVED', matchScore: 80, createdAt: new Date('2023-01-01') },
        { userId: user.id, company: 'Google', role: 'Manager', status: 'APPLIED', matchScore: 90, createdAt: new Date('2023-01-02') },
        { userId: user.id, company: 'Amazon', role: 'DevOps', status: 'INTERVIEW', matchScore: 70, createdAt: new Date('2023-01-03') },
        { userId: user.id, company: 'Netflix', role: 'Engineer', status: 'OFFER', matchScore: 95, createdAt: new Date('2023-01-04') },
      ]
    });
  });

  it('filters by search (company or role)', async () => {
    const res = await listApplications(user.id, { search: 'app' }); // Apple
    expect(res.applications.length).toBe(1);
    expect(res.applications[0].company).toBe('Apple');

    const res2 = await listApplications(user.id, { search: 'Engineer' }); // Apple, Netflix
    expect(res2.applications.length).toBe(2);
  });

  it('filters by status array', async () => {
    const res = await listApplications(user.id, { status: ['SAVED', 'OFFER'] });
    expect(res.applications.length).toBe(2);
    const companies = res.applications.map(a => a.company).sort();
    expect(companies).toEqual(['Apple', 'Netflix']);
  });

  it('sorts by matchScore desc', async () => {
    const res = await listApplications(user.id, { sortBy: 'matchScore', sortOrder: 'desc' });
    expect(res.applications[0].company).toBe('Netflix'); // 95
    expect(res.applications[3].company).toBe('Amazon'); // 70
  });

  it('sorts by createdAt asc', async () => {
    const res = await listApplications(user.id, { sortBy: 'createdAt', sortOrder: 'asc' });
    expect(res.applications[0].company).toBe('Apple'); // 01-01
    expect(res.applications[3].company).toBe('Netflix'); // 01-04
  });

  it('combines filters and sorting', async () => {
    const res = await listApplications(user.id, { 
      search: 'Engineer', 
      sortBy: 'matchScore', 
      sortOrder: 'asc' 
    });
    // Apple (80), Netflix (95)
    expect(res.applications.length).toBe(2);
    expect(res.applications[0].company).toBe('Apple');
    expect(res.applications[1].company).toBe('Netflix');
  });
});
