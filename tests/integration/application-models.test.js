import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../lib/db/prisma.js';

describe('Application Models', () => {
  beforeEach(async () => {
    await prisma.applicationNote.deleteMany();
    await prisma.applicationEvent.deleteMany();
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.applicationTag.deleteMany();
    await prisma.application.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();
  });

  it('cascades deletion from User to Application', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'app_cascade@example.com',
        passwordHash: 'dummy',
      },
    });

    await prisma.application.create({
      data: {
        userId: user.id,
        company: 'Test Co',
        role: 'Engineer',
      },
    });

    let apps = await prisma.application.findMany({ where: { userId: user.id } });
    expect(apps.length).toBe(1);

    await prisma.user.delete({ where: { id: user.id } });

    apps = await prisma.application.findMany({ where: { userId: user.id } });
    expect(apps.length).toBe(0);
  });

  it('cascades deletion from Application to its events, notes, and history', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'app_children_cascade@example.com',
        passwordHash: 'dummy',
      },
    });

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        company: 'Test Co',
        role: 'Engineer',
      },
    });

    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        toStatus: 'APPLIED',
      },
    });

    await prisma.applicationEvent.create({
      data: {
        applicationId: application.id,
        type: 'INTERVIEW',
        title: 'Initial Call',
      },
    });

    await prisma.applicationNote.create({
      data: {
        applicationId: application.id,
        body: 'A test note',
      },
    });

    const tag = await prisma.tag.create({
      data: {
        name: 'Remote',
      },
    });

    await prisma.applicationTag.create({
      data: {
        applicationId: application.id,
        tagId: tag.id,
      },
    });

    // Verify children exist
    let histories = await prisma.applicationStatusHistory.findMany({ where: { applicationId: application.id } });
    let events = await prisma.applicationEvent.findMany({ where: { applicationId: application.id } });
    let notes = await prisma.applicationNote.findMany({ where: { applicationId: application.id } });
    let tags = await prisma.applicationTag.findMany({ where: { applicationId: application.id } });

    expect(histories.length).toBe(1);
    expect(events.length).toBe(1);
    expect(notes.length).toBe(1);
    expect(tags.length).toBe(1);

    // Delete application
    await prisma.application.delete({ where: { id: application.id } });

    // Verify children are deleted
    histories = await prisma.applicationStatusHistory.findMany({ where: { applicationId: application.id } });
    events = await prisma.applicationEvent.findMany({ where: { applicationId: application.id } });
    notes = await prisma.applicationNote.findMany({ where: { applicationId: application.id } });
    tags = await prisma.applicationTag.findMany({ where: { applicationId: application.id } });

    expect(histories.length).toBe(0);
    expect(events.length).toBe(0);
    expect(notes.length).toBe(0);
    expect(tags.length).toBe(0);
    
    // Tag should still exist as it is not cascaded
    const remainingTag = await prisma.tag.findUnique({ where: { id: tag.id } });
    expect(remainingTag).not.toBeNull();
  });
});
