import { describe, it, expect } from 'vitest';
import { createApplicationSchema, updateApplicationSchema } from '../../lib/validation/schemas/application.js';

describe('Application Schemas', () => {
  describe('createApplicationSchema', () => {
    it('validates a correct application', () => {
      const data = {
        company: 'Google',
        role: 'Software Engineer',
      };
      const result = createApplicationSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.priority).toBe('MEDIUM'); // default value
    });

    it('rejects missing company or role', () => {
      const data = { company: 'Google' };
      const result = createApplicationSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path[0]).toBe('role');
    });

    it('accepts valid optional fields', () => {
      const data = {
        company: 'Google',
        role: 'Software Engineer',
        location: 'Remote',
        priority: 'HIGH',
        applicationDate: new Date().toISOString(),
        recruiterName: 'John Doe',
      };
      const result = createApplicationSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.priority).toBe('HIGH');
    });
  });

  describe('updateApplicationSchema', () => {
    it('allows partial updates', () => {
      const data = { location: 'New York' };
      const result = updateApplicationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
