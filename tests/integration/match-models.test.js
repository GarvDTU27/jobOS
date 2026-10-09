import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../lib/db/prisma.js';

describe('Match Models (MatchAnalysis & SkillGap)', () => {
  beforeEach(async () => {
    await prisma.skillGap.deleteMany();
    await prisma.matchAnalysis.deleteMany();
    await prisma.applicationNote.deleteMany();
    await prisma.applicationEvent.deleteMany();
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.applicationTag.deleteMany();
    await prisma.application.deleteMany();
    await prisma.resumeSkill.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.jobSkill.deleteMany();
    await prisma.jobAnalysis.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();
  });

  it('cascades deletion from Application to MatchAnalysis and SkillGap', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'match_cascade@example.com',
        passwordHash: 'dummy',
      },
    });

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        company: 'Test Co',
        role: 'Engineer',
      },
    });

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        name: 'My Resume',
        fileSize: 100,
        fileType: 'application/pdf',
        storageKey: 'key-1',
      },
    });

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        company: 'Test Co',
        role: 'Engineer',
        jobId: job.id,
        resumeId: resume.id,
      },
    });

    const matchAnalysis = await prisma.matchAnalysis.create({
      data: {
        applicationId: app.id,
        resumeId: resume.id,
        jobId: job.id,
        overallScore: 85,
        technicalSkillsScore: 90,
        experienceScore: 80,
        educationScore: 85,
        responsibilitiesScore: 80,
        keywordsScore: 85,
        seniorityScore: 90,
        isCurrent: true,
        skillGaps: {
          create: [
            {
              skillName: 'TypeScript',
              matchLevel: 'STRONG',
              requirement: 'REQUIRED',
              evidence: '5 years of TypeScript'
            },
            {
              skillName: 'GraphQL',
              matchLevel: 'MISSING',
              requirement: 'PREFERRED'
            }
          ]
        }
      }
    });

    let foundAnalysis = await prisma.matchAnalysis.findUnique({
      where: { id: matchAnalysis.id },
      include: { skillGaps: true }
    });
    expect(foundAnalysis).not.toBeNull();
    expect(foundAnalysis.skillGaps.length).toBe(2);

    // Deleting application should cascade delete MatchAnalysis and SkillGaps
    await prisma.application.delete({ where: { id: app.id } });

    foundAnalysis = await prisma.matchAnalysis.findUnique({ where: { id: matchAnalysis.id } });
    expect(foundAnalysis).toBeNull();

    const gaps = await prisma.skillGap.findMany({ where: { matchAnalysisId: matchAnalysis.id } });
    expect(gaps.length).toBe(0);
  });

  it('manages isCurrent flag transitions so only latest analysis is current', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'match_current@example.com',
        passwordHash: 'dummy',
      },
    });

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        company: 'Test Co',
        role: 'Engineer',
      },
    });

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        name: 'My Resume',
        fileSize: 100,
        fileType: 'application/pdf',
        storageKey: 'key-1',
      },
    });

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        company: 'Test Co',
        role: 'Engineer',
        jobId: job.id,
        resumeId: resume.id,
      },
    });

    // Create first analysis
    const analysis1 = await prisma.matchAnalysis.create({
      data: {
        applicationId: app.id,
        resumeId: resume.id,
        jobId: job.id,
        overallScore: 70,
        technicalSkillsScore: 70,
        experienceScore: 70,
        educationScore: 70,
        responsibilitiesScore: 70,
        keywordsScore: 70,
        seniorityScore: 70,
        isCurrent: true,
      }
    });

    expect(analysis1.isCurrent).toBe(true);

    // Transactionally flip prior ones and insert new one
    const analysis2 = await prisma.$transaction(async (tx) => {
      await tx.matchAnalysis.updateMany({
        where: { applicationId: app.id, isCurrent: true },
        data: { isCurrent: false }
      });

      return tx.matchAnalysis.create({
        data: {
          applicationId: app.id,
          resumeId: resume.id,
          jobId: job.id,
          overallScore: 88,
          technicalSkillsScore: 90,
          experienceScore: 85,
          educationScore: 85,
          responsibilitiesScore: 85,
          keywordsScore: 85,
          seniorityScore: 90,
          isCurrent: true,
        }
      });
    });

    const currentAnalyses = await prisma.matchAnalysis.findMany({
      where: { applicationId: app.id, isCurrent: true }
    });

    expect(currentAnalyses.length).toBe(1);
    expect(currentAnalyses[0].id).toBe(analysis2.id);

    const updatedAnalysis1 = await prisma.matchAnalysis.findUnique({ where: { id: analysis1.id } });
    expect(updatedAnalysis1.isCurrent).toBe(false);
  });
});
