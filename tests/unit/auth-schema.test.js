import { describe, it, expect } from 'vitest';
import { registerSchema } from '../../lib/validation/schemas/auth';

describe('Auth Schema Validation', () => {
  it('accepts valid registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Valid1Password!',
      name: 'John Doe'
    };
    expect(() => registerSchema.parse(validData)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'Valid1Password!',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow(/Invalid email address/);
  });

  it('rejects password without uppercase', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'valid1password!',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow(/uppercase/i);
  });

  it('rejects password without lowercase', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'VALID1PASSWORD!',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow(/lowercase/i);
  });

  it('rejects password without number', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'ValidPassword!',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow(/number/i);
  });

  it('rejects password without special character', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Valid1Password',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow(/special character/i);
  });

  it('rejects password shorter than 8 characters', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Val1!',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow(/at least 8 characters/);
  });
});
