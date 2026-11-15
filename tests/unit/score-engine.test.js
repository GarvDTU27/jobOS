import { describe, it, expect } from 'vitest';
import { computeMatch } from '../../lib/matching/score-engine.js';

describe('Deterministic Score Engine (lib/matching/score-engine.js)', () => {
  it('returns perfect technical skills score (100) when all skills match directly or via alias', () => {
    const resumeData = {
      skills: [{ name: 'javascript' }, { name: 'postgresql' }, { name: 'react' }],
      experience: [
        {
          title: 'Senior Software Engineer',
          startDate: '2019-01-01',
          endDate: '2024-01-01',
          bullets: [{ text: 'Architected scalable web apps' }],
        },
      ],
      education: [{ degree: 'Bachelor of Science in Computer Science' }],
    };

    const jobData = {
      role: 'Senior Full Stack Engineer',
      skills: [
        { name: 'JS', requirement: 'REQUIRED' },
        { name: 'Postgres', requirement: 'REQUIRED' },
        { name: 'React.js', requirement: 'PREFERRED' },
      ],
      experienceReq: '5 years',
      analysis: {
        seniority: 'Senior',
        educationReq: "Bachelor's degree",
        responsibilities: ['Architect scalable web apps'],
        keywords: ['javascript', 'react'],
      },
    };

    const result = computeMatch({ resumeData, jobData });

    expect(result.categoryScores.technicalSkillsScore).toBe(100);
    expect(result.categoryScores.experienceScore).toBe(100);
    expect(result.categoryScores.educationScore).toBe(100);
    expect(result.categoryScores.seniorityScore).toBe(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.skillGaps).toHaveLength(3);
    expect(result.skillGaps.every(g => g.matchLevel === 'STRONG')).toBe(true);
  });

  it('returns 0 in technical skills when no skills match', () => {
    const resumeData = {
      skills: [{ name: 'Photoshop' }, { name: 'Figma' }],
      experience: [],
      education: [],
    };

    const jobData = {
      role: 'Backend Engineer',
      skills: [
        { name: 'Go', requirement: 'REQUIRED' },
        { name: 'Kubernetes', requirement: 'REQUIRED' },
      ],
      analysis: {},
    };

    const result = computeMatch({ resumeData, jobData });

    expect(result.categoryScores.technicalSkillsScore).toBe(0);
    expect(result.skillGaps).toHaveLength(2);
    expect(result.skillGaps.every(g => g.matchLevel === 'MISSING')).toBe(true);
  });

  it('awards partial credit for semantic matches', () => {
    const resumeData = {
      skills: [{ name: 'Redis' }],
    };

    const jobData = {
      skills: [{ name: 'Distributed Caching', requirement: 'REQUIRED' }],
    };

    const semanticPairs = [
      {
        resumeSkill: 'Redis',
        jobSkill: 'Distributed Caching',
        confidence: 0.9,
      },
    ];

    const result = computeMatch({ resumeData, jobData, semanticPairs });

    expect(result.categoryScores.technicalSkillsScore).toBeGreaterThan(0);
    expect(result.categoryScores.technicalSkillsScore).toBeLessThan(100);
    expect(result.skillGaps[0].matchLevel).toBe('PARTIAL');
  });

  it('evaluates experience score proportionally when candidate has fewer years than required', () => {
    const resumeData = {
      experience: [
        {
          startDate: '2022-01-01',
          endDate: '2024-01-01', // ~2 years
        },
      ],
    };

    const jobData = {
      experienceReq: '4 years',
    };

    const result = computeMatch({ resumeData, jobData });
    expect(result.categoryScores.experienceScore).toBeCloseTo(50, -1);
  });

  it('respects user weight overrides', () => {
    const resumeData = {
      skills: [{ name: 'React' }],
    };

    const jobData = {
      skills: [{ name: 'React', requirement: 'REQUIRED' }],
    };

    // Give 100% weight to technical skills
    const customWeights = {
      technicalSkills: 100,
      experience: 0,
      education: 0,
      responsibilities: 0,
      keywords: 0,
      seniority: 0,
    };

    const result = computeMatch({ resumeData, jobData, weights: customWeights });
    expect(result.overallScore).toBe(100);
  });
});
