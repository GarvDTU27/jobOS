import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/ai/provider.js', () => ({
  complete: vi.fn(),
}));

import { complete } from '../../lib/ai/provider.js';
import { semanticSkillMatch, semanticMatchSchema } from '../../lib/ai/matching.js';

describe('AI Semantic Skill Matcher (lib/ai/matching.js)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates schema with valid semantic pairs', () => {
    const validData = {
      skillPairs: [
        {
          resumeSkill: 'Redis',
          jobSkill: 'In-Memory Cache',
          confidence: 0.9,
          rationale: 'Redis is an industry standard in-memory caching system',
        },
      ],
    };

    const parsed = semanticMatchSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('rejects schema with invalid confidence range', () => {
    const invalidData = {
      skillPairs: [
        {
          resumeSkill: 'Redis',
          jobSkill: 'In-Memory Cache',
          confidence: 1.5,
        },
      ],
    };

    const parsed = semanticMatchSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('returns empty skillPairs immediately without calling provider if resume skills are empty', async () => {
    const result = await semanticSkillMatch([], ['Docker', 'Kubernetes']);
    expect(result).toEqual({ skillPairs: [] });
    expect(complete).not.toHaveBeenCalled();
  });

  it('returns empty skillPairs immediately without calling provider if job skills are empty', async () => {
    const result = await semanticSkillMatch(['React', 'TypeScript'], []);
    expect(result).toEqual({ skillPairs: [] });
    expect(complete).not.toHaveBeenCalled();
  });

  it('calls Gemini provider with wrapped content blocks and returns validated skill pairs', async () => {
    complete.mockResolvedValueOnce({
      skillPairs: [
        {
          resumeSkill: 'Redis',
          jobSkill: 'Distributed Caching',
          confidence: 0.85,
          rationale: 'Redis is used for distributed caching',
        },
      ],
    });

    const result = await semanticSkillMatch(['Redis', 'Node.js'], ['Distributed Caching', 'PostgreSQL']);

    expect(complete).toHaveBeenCalledTimes(1);
    const callArgs = complete.mock.calls[0][0];
    expect(callArgs.system).toContain('technical recruiter');
    expect(callArgs.messages[0].content).toContain('<candidate_skills>');
    expect(callArgs.messages[0].content).toContain('<job_skills>');
    expect(result.skillPairs).toHaveLength(1);
    expect(result.skillPairs[0].resumeSkill).toBe('Redis');
    expect(result.skillPairs[0].confidence).toBe(0.85);
  });
});
