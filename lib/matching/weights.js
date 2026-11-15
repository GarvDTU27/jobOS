import { logger } from '../utils/logger.js';

export const DEFAULT_WEIGHTS = {
  technicalSkills: 0.30,
  experience: 0.20,
  education: 0.10,
  responsibilities: 0.20,
  keywords: 0.10,
  seniority: 0.10,
};

const REQUIRED_CATEGORIES = [
  'technicalSkills',
  'experience',
  'education',
  'responsibilities',
  'keywords',
  'seniority',
];

/**
 * Resolves match scoring weights, merging user preference overrides with defaults.
 * Falls back to defaults if overrides are invalid or do not sum sanely.
 * 
 * @param {Object} [overrides] Optional user preference weight overrides
 * @returns {typeof DEFAULT_WEIGHTS}
 */
export function resolveWeights(overrides) {
  if (!overrides || typeof overrides !== 'object') {
    return { ...DEFAULT_WEIGHTS };
  }

  // Check that all required categories exist and are non-negative numbers
  for (const cat of REQUIRED_CATEGORIES) {
    if (typeof overrides[cat] !== 'number' || isNaN(overrides[cat]) || overrides[cat] < 0) {
      logger.warn('Invalid match weight override: missing or negative category', {
        category: cat,
        value: overrides[cat],
      });
      return { ...DEFAULT_WEIGHTS };
    }
  }

  const rawSum = REQUIRED_CATEGORIES.reduce((acc, cat) => acc + overrides[cat], 0);

  // If sum is zero or absurdly out of range, fallback
  if (rawSum <= 0.001) {
    logger.warn('Invalid match weight override: total sum is zero', { overrides });
    return { ...DEFAULT_WEIGHTS };
  }

  // If user passed percentages (e.g. sum is ~100), normalize to fraction 0 - 1.0
  const normalized = {};
  for (const cat of REQUIRED_CATEGORIES) {
    normalized[cat] = overrides[cat] / rawSum;
  }

  return normalized;
}
