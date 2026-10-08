import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { authService } from '../../lib/services/auth-service';
import prisma from '../../lib/db/prisma';
import { ConflictError } from '../../lib/utils/errors';

describe('Auth Service', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a user successfully', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User'
    };

    const user = await authService.registerUser(userData);
    
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    // Ensure password hash is not returned
    expect(user.passwordHash).toBeUndefined();

    // Verify it was saved to DB correctly
    const dbUser = await prisma.user.findUnique({ where: { email: userData.email } });
    expect(dbUser).toBeDefined();
    expect(dbUser.passwordHash).toBeDefined();
    // Plaintext should not be stored
    expect(dbUser.passwordHash).not.toBe(userData.password);
  });

  it('throws ConflictError on duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'Password123!'
    };

    // First registration
    await authService.registerUser(userData);

    // Second registration with same email
    await expect(authService.registerUser(userData)).rejects.toThrow(ConflictError);
  });
});
