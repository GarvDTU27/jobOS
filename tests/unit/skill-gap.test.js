import { describe, it, expect } from 'vitest';
import { computeMatch } from '../../lib/matching/score-engine.js';

describe('Skill Gap Derivation (JOBOS-060)', () => {
  it('categorizes every JD skill into exactly one SkillGap row with matchLevel and requirement', () => {
    const resumeData = {
      skills: [{ name: 'React' }, { name: 'PostgreSQL' }, { name: 'Redis' }],
    };

    const jobData = {
      skills: [
        { name: 'React', requirement: 'REQUIRED' },
        { name: 'Postgres', requirement: 'REQUIRED' }, // Alias for PostgreSQL -> STRONG
        { name: 'In-Memory Cache', requirement: 'PREFERRED' }, // Semantic match with Redis -> PARTIAL
        { name: 'Kubernetes', requirement: 'REQUIRED' }, // MISSING
        { name: 'GraphQL', requirement: 'INFERRED' }, // MISSING
      ],
    };

    const semanticPairs = [
      {
        resumeSkill: 'Redis',
        jobSkill: 'In-Memory Cache',
        confidence: 0.88,
      },
    ];

    const result = computeMatch({ resumeData, jobData, semanticPairs });

    expect(result.skillGaps).toHaveLength(5);

    // 1. Direct React match
    const reactGap = result.skillGaps.find(g => g.skillName === 'React');
    expect(reactGap.matchLevel).toBe('STRONG');
    expect(reactGap.requirement).toBe('REQUIRED');

    // 2. Alias Postgres match
    const postgresGap = result.skillGaps.find(g => g.skillName === 'Postgres');
    expect(postgresGap.matchLevel).toBe('STRONG');
    expect(postgresGap.requirement).toBe('REQUIRED');

    // 3. Semantic Redis match
    const cacheGap = result.skillGaps.find(g => g.skillName === 'In-Memory Cache');
    expect(cacheGap.matchLevel).toBe('PARTIAL');
    expect(cacheGap.requirement).toBe('PREFERRED');
    expect(cacheGap.evidence).toContain('88%');

    // 4. Missing Kubernetes
    const k8sGap = result.skillGaps.find(g => g.skillName === 'Kubernetes');
    expect(k8sGap.matchLevel).toBe('MISSING');
    expect(k8sGap.requirement).toBe('REQUIRED');

    // 5. Missing Inferred GraphQL
    const gqlGap = result.skillGaps.find(g => g.skillName === 'GraphQL');
    expect(gqlGap.matchLevel).toBe('MISSING');
    expect(gqlGap.requirement).toBe('INFERRED');
  });
});
