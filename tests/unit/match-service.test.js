import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db/prisma.js', () => ({
  default: {
    application: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    resume: {
      findFirst: vi.fn(),
    },
    job: {
      findFirst: vi.fn(),
    },
    userPreference: {
      findUnique: vi.fn(),
    },
    matchAnalysis: {
      updateMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../lib/ai/matching.js', () => ({
  semanticSkillMatch: vi.fn(),
}));

import prisma from '../../lib/db/prisma.js';
import { semanticSkillMatch } from '../../lib/ai/matching.js';
import { runMatchAnalysis, getMatchAnalysisByApplicationId } from '../../lib/services/match-service.js';
import { NotFoundError, ValidationError } from '../../lib/utils/errors.js';

describe('Match Service (lib/services/match-service.js)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-123';
  const mockAppId = 'app-123';
  const mockResumeId = 'resume-123';
  const mockJobId = 'job-123';

  it('throws ValidationError if applicationId is missing', async () => {
    await expect(runMatchAnalysis({ userId: mockUserId, applicationId: '' })).rejects.toThrow(ValidationError);
  });

  it('throws NotFoundError if application does not belong to user', async () => {
    prisma.application.findFirst.mockResolvedValueOnce(null);
    await expect(runMatchAnalysis({ userId: mockUserId, applicationId: mockAppId })).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError if application has neither resume nor job attached', async () => {
    prisma.application.findFirst.mockResolvedValueOnce({
      id: mockAppId,
      userId: mockUserId,
      resumeId: null,
      jobId: null,
    });

    await expect(runMatchAnalysis({ userId: mockUserId, applicationId: mockAppId })).rejects.toThrow(ValidationError);
  });

  it('orchestrates normalizer, semantic matcher, score engine, and persists MatchAnalysis transactionally', async () => {
    prisma.application.findFirst.mockResolvedValueOnce({
      id: mockAppId,
      userId: mockUserId,
      resumeId: mockResumeId,
      jobId: mockJobId,
    });

    prisma.resume.findFirst.mockResolvedValueOnce({
      id: mockResumeId,
      userId: mockUserId,
      skills: [{ skill: { name: 'React' } }, { skill: { name: 'Postgres' } }],
      experience: [{ title: 'Developer', startDate: '2020-01-01', endDate: '2023-01-01', bullets: [] }],
      education: [{ degree: "Bachelor's" }],
      rawText: 'Experienced React developer',
    });

    prisma.job.findFirst.mockResolvedValueOnce({
      id: mockJobId,
      userId: mockUserId,
      role: 'Full Stack Engineer',
      skills: [
        { skill: { name: 'React' }, requirement: 'REQUIRED' },
        { skill: { name: 'PostgreSQL' }, requirement: 'REQUIRED' },
      ],
      experienceReq: '3 years',
      description: 'Looking for full stack dev',
      analysis: {
        responsibilities: ['Build features'],
        keywords: ['react'],
      },
    });

    semanticSkillMatch.mockResolvedValueOnce({ skillPairs: [] });
    prisma.userPreference.findUnique.mockResolvedValueOnce(null);

    const mockCreatedAnalysis = {
      id: 'analysis-999',
      applicationId: mockAppId,
      overallScore: 95,
      skillGaps: [{ id: 'gap-1', skillName: 'React', matchLevel: 'STRONG' }],
    };

    prisma.$transaction.mockImplementationOnce(async (callback) => {
      return await callback({
        matchAnalysis: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue(mockCreatedAnalysis),
        },
        application: {
          update: vi.fn().mockResolvedValue({}),
        },
      });
    });

    const result = await runMatchAnalysis({
      userId: mockUserId,
      applicationId: mockAppId,
    });

    expect(result.id).toBe('analysis-999');
    expect(result.overallScore).toBe(95);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('retrieves current match analysis by applicationId', async () => {
    prisma.application.findFirst.mockResolvedValueOnce({ id: mockAppId, userId: mockUserId });
    prisma.matchAnalysis.findFirst.mockResolvedValueOnce({
      id: 'analysis-current',
      applicationId: mockAppId,
      overallScore: 88,
      isCurrent: true,
      skillGaps: [],
    });

    const result = await getMatchAnalysisByApplicationId(mockUserId, mockAppId);
    expect(result.id).toBe('analysis-current');
    expect(result.overallScore).toBe(88);
  });
});
