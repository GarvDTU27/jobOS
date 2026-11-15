import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveWeights, DEFAULT_WEIGHTS } from '../../lib/matching/weights.js';
import { logger } from '../../lib/utils/logger.js';

describe('Match Weights Resolver (lib/matching/weights.js)', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  it('returns default weights when no overrides are provided', () => {
    const weights = resolveWeights();
    expect(weights).toEqual(DEFAULT_WEIGHTS);
  });

  it('normalizes percentage overrides (summing to 100) into unit fractions', () => {
    const overrides = {
      technicalSkills: 40,
      experience: 20,
      education: 10,
      responsibilities: 15,
      keywords: 10,
      seniority: 5,
    };

    const weights = resolveWeights(overrides);
    expect(weights.technicalSkills).toBeCloseTo(0.40);
    expect(weights.experience).toBeCloseTo(0.20);
    expect(weights.education).toBeCloseTo(0.10);
    expect(weights.responsibilities).toBeCloseTo(0.15);
    expect(weights.keywords).toBeCloseTo(0.10);
    expect(weights.seniority).toBeCloseTo(0.05);
  });

  it('falls back to defaults and logs a warning when a category is missing or negative', () => {
    const invalidOverrides = {
      technicalSkills: -10,
      experience: 20,
      education: 10,
      responsibilities: 15,
      keywords: 10,
      seniority: 5,
    };

    const weights = resolveWeights(invalidOverrides);
    expect(weights).toEqual(DEFAULT_WEIGHTS);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('falls back to defaults when total sum is 0', () => {
    const zeroOverrides = {
      technicalSkills: 0,
      experience: 0,
      education: 0,
      responsibilities: 0,
      keywords: 0,
      seniority: 0,
    };

    const weights = resolveWeights(zeroOverrides);
    expect(weights).toEqual(DEFAULT_WEIGHTS);
    expect(logger.warn).toHaveBeenCalled();
  });
});
