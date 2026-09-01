import { describe, it, expect } from 'vitest';
import { parsePageParams } from '../../lib/utils/pagination.js';

describe('parsePageParams', () => {
  it('uses default values when no params provided', () => {
    const result = parsePageParams(null);
    expect(result).toEqual({ page: 1, limit: 25, offset: 0 });
  });

  it('parses valid page and limit from object', () => {
    const result = parsePageParams({ page: '2', limit: '10' });
    expect(result).toEqual({ page: 2, limit: 10, offset: 10 });
  });

  it('clamps limit to maxPageSize', () => {
    const result = parsePageParams(new URLSearchParams('page=1&limit=200'));
    expect(result.limit).toBe(100);
  });

  it('falls back to defaults on invalid input', () => {
    const result = parsePageParams({ page: 'invalid', limit: '-5' });
    expect(result).toEqual({ page: 1, limit: 25, offset: 0 });
  });
});
