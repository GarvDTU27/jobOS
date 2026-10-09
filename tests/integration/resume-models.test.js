import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '../../lib/db/prisma';
import crypto from 'node:crypto';

describe('Resume Models and Cascade Deletes', () => {
  let user;

  beforeEach(async () => {
    // Clean up
    await prisma.user.deleteMany();
    
    // Create test user
    user = await prisma.user.create({
      data: {
        email: `test-${crypto.randomUUID()}@jobos.com`,
        passwordHash: 'dummy',
        name: 'Test User'
      }
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('cascades deletes from Resume to child models', async () => {
    // Create skill
    const skill = await prisma.skill.create({
      data: {
        name: 'JavaScript',
        normalizedName: 'javascript'
      }
    });

    // Create a resume with children
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        name: 'My Resume',
        fileType: 'application/pdf',
        fileSize: 1024,
        storageKey: 'fake/key.pdf',
        education: {
          create: [{ institution: 'MIT' }]
        },
        experience: {
          create: [{ company: 'Google', title: 'SWE', bullets: ['Did things'] }]
        },
        projects: {
          create: [{ name: 'JobOS', technologies: ['React'] }]
        },
        certifications: {
          create: [{ name: 'AWS Certified' }]
        },
        skills: {
          create: [{ skillId: skill.id }]
        }
      }
    });

    // Verify children exist
    const eduCount = await prisma.education.count({ where: { resumeId: resume.id } });
    const expCount = await prisma.experience.count({ where: { resumeId: resume.id } });
    const projCount = await prisma.project.count({ where: { resumeId: resume.id } });
    const certCount = await prisma.certification.count({ where: { resumeId: resume.id } });
    const skillCount = await prisma.resumeSkill.count({ where: { resumeId: resume.id } });

    expect(eduCount).toBe(1);
    expect(expCount).toBe(1);
    expect(projCount).toBe(1);
    expect(certCount).toBe(1);
    expect(skillCount).toBe(1);

    // Delete the resume
    await prisma.resume.delete({ where: { id: resume.id } });

    // Verify children are deleted
    const eduCountAfter = await prisma.education.count({ where: { resumeId: resume.id } });
    const expCountAfter = await prisma.experience.count({ where: { resumeId: resume.id } });
    const projCountAfter = await prisma.project.count({ where: { resumeId: resume.id } });
    const certCountAfter = await prisma.certification.count({ where: { resumeId: resume.id } });
    const skillCountAfter = await prisma.resumeSkill.count({ where: { resumeId: resume.id } });

    expect(eduCountAfter).toBe(0);
    expect(expCountAfter).toBe(0);
    expect(projCountAfter).toBe(0);
    expect(certCountAfter).toBe(0);
    expect(skillCountAfter).toBe(0);
  });
});
