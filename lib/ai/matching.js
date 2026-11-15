import { z } from 'zod';
import { complete } from './provider.js';
import { buildUntrustedContentBlock } from './prompt-guard.js';

export const semanticMatchSchema = z.object({
  skillPairs: z.array(
    z.object({
      resumeSkill: z.string(),
      jobSkill: z.string(),
      confidence: z.number().min(0).max(1),
      rationale: z.string().optional(),
    })
  ),
});

const SYSTEM_PROMPT = `You are an expert technical recruiter and talent engineer evaluating skill equivalence.
Your goal is to compare candidate resume skills against required or preferred job skills.

Identify pairs of skills that are semantic near-equivalents, direct implementations of a concept, or functional substitutes (e.g., "Redis" <-> "In-Memory Caching", "PostgreSQL" <-> "Relational Databases", "GCP" <-> "Cloud Infrastructure", "Kubernetes" <-> "Container Orchestration").

Rules:
1. Only evaluate skills present in the provided candidate and job lists.
2. Only return pairs where the candidate skill provides substantial coverage of the job skill (confidence >= 0.5).
3. Do NOT match unrelated or distinct domains (e.g. "CSS" <-> "Python" is invalid; "React" <-> "PostgreSQL" is invalid).
4. For each valid pair, specify:
   - resumeSkill: exact string from candidate list
   - jobSkill: exact string from job list
   - confidence: float between 0.5 and 1.0
   - rationale: concise 1-sentence explanation of why these skills match
5. If no residual skills match, return an empty array for skillPairs.
Output strictly JSON conforming to the requested schema.`;

/**
 * Evaluates semantic near-equivalence between residual unmatched resume skills and job skills.
 * 
 * @param {Array<string|{name: string}>} unmatchedResumeSkills 
 * @param {Array<string|{name: string}>} unmatchedJobSkills 
 * @returns {Promise<{ skillPairs: Array<{ resumeSkill: string, jobSkill: string, confidence: number, rationale?: string }> }>}
 */
export async function semanticSkillMatch(unmatchedResumeSkills = [], unmatchedJobSkills = []) {
  const resumeList = (unmatchedResumeSkills || [])
    .map(s => (typeof s === 'string' ? s.trim() : s?.name?.trim()))
    .filter(Boolean);

  const jobList = (unmatchedJobSkills || [])
    .map(s => (typeof s === 'string' ? s.trim() : s?.name?.trim()))
    .filter(Boolean);

  // Short-circuit if either set is empty to eliminate unnecessary LLM calls
  if (resumeList.length === 0 || jobList.length === 0) {
    return { skillPairs: [] };
  }

  const userContent = [
    'Candidate Resume Skills to evaluate:',
    buildUntrustedContentBlock(JSON.stringify(resumeList, null, 2), 'candidate_skills'),
    '',
    'Job Requirement Skills to evaluate:',
    buildUntrustedContentBlock(JSON.stringify(jobList, null, 2), 'job_skills'),
  ].join('\n');

  const messages = [
    {
      role: 'user',
      content: userContent,
    },
  ];

  const result = await complete({
    system: SYSTEM_PROMPT,
    messages,
    schema: semanticMatchSchema,
    maxRetries: 2,
  });

  return result || { skillPairs: [] };
}
