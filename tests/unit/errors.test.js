import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError, handleRouteError } from '../../lib/utils/errors.js';

describe('Error Hierarchy', () => {
  it('instantiates ValidationError with 400 status', () => {
    const err = new ValidationError('Bad input');
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Bad input');
  });

  it('instantiates NotFoundError with 404 status', () => {
    const err = new NotFoundError('Not found');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('handleRouteError formats AppErrors correctly', async () => {
    const err = new ValidationError('Invalid data');
    const response = handleRouteError(err);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toBe('Invalid data');
  });
});
