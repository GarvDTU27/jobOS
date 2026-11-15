import prisma from '../db/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { normalizeSkill } from '../matching/skill-normalizer.js';
import { semanticSkillMatch } from '../ai/matching.js';
import { computeMatch } from '../matching/score-engine.js';
import { logger } from '../utils/logger.js';

/**
 * Runs end-to-end match analysis for an application against a resume and job description.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.applicationId
 * @param {string} [params.resumeId] Optional, defaults to application.resumeId
 * @param {string} [params.jobId] Optional, defaults to application.jobId
 * @returns {Promise<Object>} The persisted MatchAnalysis record with skill gaps
 */
export async function runMatchAnalysis({ userId, applicationId, resumeId, jobId }) {
  if (!applicationId) {
    throw new ValidationError('Application ID is required to run match analysis');
  }

  // 1. Fetch application and ensure ownership
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  const effectiveResumeId = resumeId || application.resumeId;
  const effectiveJobId = jobId || application.jobId;

  if (!effectiveResumeId) {
    throw new ValidationError('A resume must be attached to the application or provided to run match analysis');
  }

  if (!effectiveJobId) {
    throw new ValidationError('A job description must be attached to the application or provided to run match analysis');
  }

  // 2. Fetch full resume data
  const resume = await prisma.resume.findFirst({
    where: { id: effectiveResumeId, userId },
    include: {
      skills: {
        include: { skill: true },
      },
      experience: true,
      education: true,
      projects: true,
    },
  });

  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  // 3. Fetch full job data
  const job = await prisma.job.findFirst({
    where: { id: effectiveJobId, userId },
    include: {
      skills: {
        include: { skill: true },
      },
      analysis: true,
    },
  });

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  // 4. Extract structured skill lists
  const resumeSkills = resume.skills.map(rs => rs.skill?.name || '').filter(Boolean);
  const normalizedResumeSkills = new Set(resumeSkills.map(s => normalizeSkill(s)).filter(Boolean));

  const jobSkills = job.skills.map(js => ({
    name: js.skill?.name || '',
    requirement: js.requirement || 'REQUIRED',
  })).filter(s => Boolean(s.name));

  // Determine unmatched residual sets for semantic matching
  const unmatchedJobSkills = jobSkills.filter(js => !normalizedResumeSkills.has(normalizeSkill(js.name)));
  const unmatchedResumeSkills = resumeSkills.filter(rs => {
    const norm = normalizeSkill(rs);
    return !jobSkills.some(js => normalizeSkill(js.name) === norm);
  });

  // 5. Call semantic matcher only on residual unmatched skills
  let semanticPairs = [];
  try {
    const semanticResult = await semanticSkillMatch(unmatchedResumeSkills, unmatchedJobSkills);
    semanticPairs = semanticResult?.skillPairs || [];
  } catch (error) {
    logger.warn('Semantic skill matching failed or timed out, proceeding with deterministic matching', {
      error: error.message,
      applicationId,
    });
  }

  // 6. Fetch user preference weight overrides if configured
  const preference = await prisma.userPreference.findUnique({
    where: { userId },
  });

  // 7. Compute deterministic match scores
  const matchResult = computeMatch({
    resumeData: {
      skills: resumeSkills,
      experience: resume.experience,
      education: resume.education,
      rawText: resume.rawText || '',
    },
    jobData: {
      role: job.role,
      skills: jobSkills,
      experienceReq: job.experienceReq,
      description: job.description || '',
      analysis: job.analysis || {},
    },
    semanticPairs,
    weights: preference?.matchWeightOverrides,
  });

  // 8. Persist MatchAnalysis and SkillGaps in a transaction
  const persistedAnalysis = await prisma.$transaction(async (tx) => {
    // Flip prior analyses for this application to isCurrent: false
    await tx.matchAnalysis.updateMany({
      where: { applicationId, isCurrent: true },
      data: { isCurrent: false },
    });

    // Create new current analysis
    const analysis = await tx.matchAnalysis.create({
      data: {
        applicationId,
        resumeId: effectiveResumeId,
        jobId: effectiveJobId,
        overallScore: matchResult.overallScore,
        technicalSkillsScore: matchResult.categoryScores.technicalSkillsScore,
        experienceScore: matchResult.categoryScores.experienceScore,
        educationScore: matchResult.categoryScores.educationScore,
        responsibilitiesScore: matchResult.categoryScores.responsibilitiesScore,
        keywordsScore: matchResult.categoryScores.keywordsScore,
        seniorityScore: matchResult.categoryScores.seniorityScore,
        isCurrent: true,
        skillGaps: {
          create: matchResult.skillGaps.map(gap => ({
            skillName: gap.skillName,
            matchLevel: gap.matchLevel,
            requirement: gap.requirement,
            evidence: gap.evidence,
          })),
        },
      },
      include: {
        skillGaps: true,
      },
    });

    // Update denormalized matchScore on Application for fast list sorting
    await tx.application.update({
      where: { id: applicationId },
      data: {
        matchScore: matchResult.overallScore,
        resumeId: effectiveResumeId,
        jobId: effectiveJobId,
      },
    });

    return analysis;
  });

  logger.info('Match analysis completed and saved', {
    userId,
    applicationId,
    overallScore: persistedAnalysis.overallScore,
    gapsCount: persistedAnalysis.skillGaps.length,
  });

  return persistedAnalysis;
}

/**
 * Retrieves the current match analysis for an application.
 * 
 * @param {string} userId
 * @param {string} applicationId
 * @returns {Promise<Object>}
 */
export async function getMatchAnalysisByApplicationId(userId, applicationId) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  const analysis = await prisma.matchAnalysis.findFirst({
    where: {
      applicationId,
      isCurrent: true,
    },
    include: {
      skillGaps: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!analysis) {
    throw new NotFoundError('No match analysis found for this application');
  }

  return analysis;
}
