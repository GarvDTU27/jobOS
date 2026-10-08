import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '../../lib/db/prisma';
import { authService } from '../../lib/services/auth-service';
import { hashPassword } from '../../lib/auth/password';
import crypto from 'crypto';
import { AppError } from '../../lib/utils/errors';

describe('Email Verification Integration', () => {
  const testEmail = 'verify@example.com';
  const testPassword = 'Password123!';
  let userId;

  beforeEach(async () => {
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: await hashPassword(testPassword)
      }
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should generate a verification token on registration (simulate)', async () => {
    const rawToken = await authService.createEmailVerificationToken(testEmail);
    expect(rawToken).toBeTypeOf('string');

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: hashedToken }
    });
    
    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord.identifier).toBe(testEmail);
  });

  it('should verify email and delete token on success', async () => {
    const rawToken = await authService.createEmailVerificationToken(testEmail);
    
    await authService.verifyEmail(rawToken);

    // 1. Email verified?
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user.emailVerified).toBeInstanceOf(Date);

    // 2. Token deleted?
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: hashedToken }
    });
    expect(tokenRecord).toBeNull();
  });

  it('should throw error and delete token if token is expired', async () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: testEmail,
        token: hashedToken,
        expires: new Date(Date.now() - 1000) // expired
      }
    });

    await expect(authService.verifyEmail(rawToken)).rejects.toThrow(AppError);

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: hashedToken }
    });
    expect(tokenRecord).toBeNull();
  });

  it('should fail if token does not exist', async () => {
    const fakeToken = crypto.randomBytes(32).toString('hex');
    await expect(authService.verifyEmail(fakeToken))
      .rejects.toThrow(/Invalid or expired verification token/);
  });
});
