import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import prisma from '../../lib/db/prisma';

describe('User Model', () => {
  beforeAll(async () => {
    // Make sure we have a clean state for testing
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('enforces unique email constraint', async () => {
    const user1 = {
      email: 'test@example.com',
      passwordHash: 'hashed_password_here',
      name: 'Test User'
    };

    // First insert should succeed
    const createdUser = await prisma.user.create({
      data: user1
    });
    expect(createdUser.email).toBe(user1.email);

    // Second insert with the same email should fail
    await expect(prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'another_hashed_password',
      }
    })).rejects.toThrow(/Unique constraint failed on the fields: \(`email`\)/);
  });
});
