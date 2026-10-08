import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../lib/auth/password';

describe('Password Utilities', () => {
  it('hashes and verifies a normal password', async () => {
    const plain = 'mySuperSecretP@ssword123';
    const hash = await hashPassword(plain);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    
    const isValid = await verifyPassword(plain, hash);
    expect(isValid).toBe(true);
  });

  it('fails verification with an incorrect password', async () => {
    const plain = 'correctPassword';
    const wrongPlain = 'incorrectPassword';
    const hash = await hashPassword(plain);
    
    const isValid = await verifyPassword(wrongPlain, hash);
    expect(isValid).toBe(false);
  });

  it('handles empty string properly (upstream Zod validates length)', async () => {
    const plain = '';
    const hash = await hashPassword(plain);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    
    const isValid = await verifyPassword(plain, hash);
    expect(isValid).toBe(true);
    
    const isValidWrong = await verifyPassword('notEmpty', hash);
    expect(isValidWrong).toBe(false);
  });

  it('rejects non-string inputs', async () => {
    await expect(hashPassword(null)).rejects.toThrow(TypeError);
    await expect(hashPassword(123)).rejects.toThrow(TypeError);
    await expect(verifyPassword(null, 'hash')).rejects.toThrow(TypeError);
    await expect(verifyPassword('pass', null)).rejects.toThrow(TypeError);
  });
});
