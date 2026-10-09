import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import {
  createApplication,
  getApplicationById,
  listApplications,
  updateApplication,
  deleteApplication,
  updateStatus
} from '../../lib/services/application-service.js';
import { NotFoundError } from '../../lib/utils/errors.js';

describe('Application Service', () => {
  let userA, userB;

  beforeEach(async () => {
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    userA = await prisma.user.create({
      data: { email: 'userA@example.com', passwordHash: 'dummy' },
    });
    userB = await prisma.user.create({
      data: { email: 'userB@example.com', passwordHash: 'dummy' },
    });
  });

  describe('createApplication', () => {
    it('creates an application and an initial status history record', async () => {
      const app = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      expect(app.status).toBe('SAVED');
      expect(app.company).toBe('Acme');

      const histories = await prisma.applicationStatusHistory.findMany({
        where: { applicationId: app.id },
      });
      expect(histories.length).toBe(1);
      expect(histories[0].toStatus).toBe('SAVED');
    });
  });

  describe('cross-user isolation', () => {
    it('prevents user B from fetching user A\'s application', async () => {
      const appA = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      
      await expect(getApplicationById(appA.id, userB.id)).rejects.toThrow(NotFoundError);
      await expect(getApplicationById(appA.id, userA.id)).resolves.not.toThrow();
    });

    it('prevents user B from updating user A\'s application', async () => {
      const appA = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      
      await expect(updateApplication(appA.id, userB.id, { location: 'Remote' })).rejects.toThrow(NotFoundError);
    });

    it('prevents user B from deleting user A\'s application', async () => {
      const appA = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      
      await expect(deleteApplication(appA.id, userB.id)).rejects.toThrow(NotFoundError);
    });

    it('prevents user B from updating status of user A\'s application', async () => {
      const appA = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      
      await expect(updateStatus(appA.id, userB.id, 'APPLIED', 'Note')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateStatus transaction', () => {
    it('creates a status history record and updates the status atomically', async () => {
      const app = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      
      const updated = await updateStatus(app.id, userA.id, 'APPLIED', 'Applied on website');
      expect(updated.status).toBe('APPLIED');

      const histories = await prisma.applicationStatusHistory.findMany({
        where: { applicationId: app.id },
        orderBy: { changedAt: 'asc' },
      });

      expect(histories.length).toBe(2);
      expect(histories[0].toStatus).toBe('SAVED');
      expect(histories[1].fromStatus).toBe('SAVED');
      expect(histories[1].toStatus).toBe('APPLIED');
      expect(histories[1].note).toBe('Applied on website');
    });

    it('does not create history if status is unchanged', async () => {
      const app = await createApplication(userA.id, { company: 'Acme', role: 'Dev' });
      
      await updateStatus(app.id, userA.id, 'SAVED', 'Same status');

      const histories = await prisma.applicationStatusHistory.findMany({
        where: { applicationId: app.id },
      });
      // Still only 1 record from creation
      expect(histories.length).toBe(1);
    });
  });

  describe('listApplications', () => {
    it('only lists applications for the requesting user', async () => {
      await createApplication(userA.id, { company: 'A1', role: 'Dev' });
      await createApplication(userA.id, { company: 'A2', role: 'Dev' });
      await createApplication(userB.id, { company: 'B1', role: 'Dev' });

      const result = await listApplications(userA.id);
      expect(result.total).toBe(2);
      expect(result.applications.length).toBe(2);
      expect(result.applications.some(a => a.company === 'B1')).toBe(false);
    });
  });
});
