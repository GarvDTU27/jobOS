import { describe, it, expect } from 'vitest';
import {
  SKILL_ALIASES,
  normalizeSkill,
  areSkillsMatching,
  findSkillMatch
} from '../../lib/matching/skill-normalizer';

describe('Skill Normalizer (JOBOS-055)', () => {
  it('exposes a maintainable SKILL_ALIASES map', () => {
    expect(typeof SKILL_ALIASES).toBe('object');
    expect(SKILL_ALIASES['js']).toBe('javascript');
    expect(SKILL_ALIASES['postgres']).toBe('postgresql');
    expect(SKILL_ALIASES['k8s']).toBe('kubernetes');
  });

  describe('normalizeSkill', () => {
    it('handles empty or non-string inputs', () => {
      expect(normalizeSkill('')).toBe('');
      expect(normalizeSkill(null)).toBe('');
      expect(normalizeSkill(undefined)).toBe('');
      expect(normalizeSkill(123)).toBe('');
    });

    it('lowercases and trims whitespace', () => {
      expect(normalizeSkill('  Python  ')).toBe('python');
      expect(normalizeSkill('RUBY ON RAILS')).toBe('ruby on rails');
    });

    it('normalizes known aliases', () => {
      expect(normalizeSkill('JS')).toBe('javascript');
      expect(normalizeSkill('Postgres')).toBe('postgresql');
      expect(normalizeSkill('psql')).toBe('postgresql');
      expect(normalizeSkill('K8s')).toBe('kubernetes');
      expect(normalizeSkill('golang')).toBe('go');
      expect(normalizeSkill('React.js')).toBe('react');
      expect(normalizeSkill('Next.js')).toBe('nextjs');
      expect(normalizeSkill('Node.js')).toBe('nodejs');
    });

    it('retains non-aliased skill names in lowercase trimmed form', () => {
      expect(normalizeSkill('Rust')).toBe('rust');
      expect(normalizeSkill('Elixir')).toBe('elixir');
      expect(normalizeSkill('Distributed Systems')).toBe('distributed systems');
    });
  });

  describe('areSkillsMatching', () => {
    it('returns true for direct matches', () => {
      expect(areSkillsMatching('Python', 'python')).toBe(true);
      expect(areSkillsMatching('Docker', 'docker')).toBe(true);
    });

    it('returns true for alias matches', () => {
      expect(areSkillsMatching('JS', 'JavaScript')).toBe(true);
      expect(areSkillsMatching('postgres', 'PostgreSQL')).toBe(true);
      expect(areSkillsMatching('k8s', 'Kubernetes')).toBe(true);
      expect(areSkillsMatching('React.js', 'react')).toBe(true);
      expect(areSkillsMatching('golang', 'Go')).toBe(true);
    });

    it('returns false for non-matches', () => {
      expect(areSkillsMatching('Java', 'JavaScript')).toBe(false);
      expect(areSkillsMatching('React', 'Angular')).toBe(false);
      expect(areSkillsMatching('Python', 'Ruby')).toBe(false);
      expect(areSkillsMatching('', 'Python')).toBe(false);
      expect(areSkillsMatching(null, 'Python')).toBe(false);
    });
  });

  describe('findSkillMatch', () => {
    const candidateStrings = ['JavaScript', 'PostgreSQL', 'Docker', 'AWS'];
    const candidateObjects = [
      { name: 'JavaScript', id: '1' },
      { name: 'PostgreSQL', id: '2' },
      { name: 'Docker', id: '3' }
    ];

    it('finds matches in a list of string candidates', () => {
      expect(findSkillMatch('js', candidateStrings)).toBe('JavaScript');
      expect(findSkillMatch('postgres', candidateStrings)).toBe('PostgreSQL');
      expect(findSkillMatch('docker', candidateStrings)).toBe('Docker');
    });

    it('finds matches in a list of object candidates with name property', () => {
      expect(findSkillMatch('js', candidateObjects)).toEqual({ name: 'JavaScript', id: '1' });
      expect(findSkillMatch('psql', candidateObjects)).toEqual({ name: 'PostgreSQL', id: '2' });
    });

    it('returns null when no candidate matches', () => {
      expect(findSkillMatch('Python', candidateStrings)).toBeNull();
      expect(findSkillMatch('', candidateStrings)).toBeNull();
      expect(findSkillMatch('Docker', [])).toBeNull();
    });
  });
});
