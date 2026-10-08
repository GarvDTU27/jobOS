import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { authorizeCredentials } from '../../lib/auth/auth.config';
import { authService } from '../../lib/services/auth-service';
import prisma from '../../lib/db/prisma';

describe('Auth Credentials Authorize', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('authorizes a valid user', async () => {
    const plainPassword = 'Password123!';
    const user = await authService.registerUser({
      email: 'test@example.com',
      password: plainPassword,
      name: 'Test User'
    });

    const result = await authorizeCredentials({
      email: 'test@example.com',
      password: plainPassword
    });

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(result.id).toBe(user.id);
  });

  it('rejects an invalid password', async () => {
    await authService.registerUser({
      email: 'test2@example.com',
      password: 'Password123!',
      name: 'Test User 2'
    });

    const result = await authorizeCredentials({
      email: 'test2@example.com',
      password: 'WrongPassword!'
    });

    expect(result).toBeNull();
  });

  it('rejects a non-existent email', async () => {
    const result = await authorizeCredentials({
      email: 'notfound@example.com',
      password: 'Password123!'
    });

    expect(result).toBeNull();
  });
});

