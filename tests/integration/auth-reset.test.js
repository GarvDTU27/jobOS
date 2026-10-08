import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '../../lib/db/prisma';
import { authService } from '../../lib/services/auth-service';
import { hashPassword, verifyPassword } from '../../lib/auth/password';
import crypto from 'crypto';
import { AppError } from '../../lib/utils/errors';

describe('Password Reset Integration', () => {
  const testEmail = 'reset@example.com';
  const initialPassword = 'Password123!';
  const newPassword = 'NewPassword456!';
  let userId;

  beforeEach(async () => {
    // Clean up
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: await hashPassword(initialPassword)
      }
    });
    userId = user.id;

    // Create a dummy session to test invalidation
    await prisma.session.create({
      data: {
        sessionToken: 'dummy-token',
        userId: userId,
        expires: new Date(Date.now() + 100000)
      }
    });
  });

  afterEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should generate a token for an existing user and save it hashed', async () => {
    const rawToken = await authService.createPasswordResetToken(testEmail);
    expect(rawToken).toBeTypeOf('string');
    
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    });
    
    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord.userId).toBe(userId);
  });

  it('should return null when generating token for non-existent user', async () => {
    const rawToken = await authService.createPasswordResetToken('nonexistent@example.com');
    expect(rawToken).toBeNull();
  });

  it('should reset password, delete token, and invalidate sessions on success', async () => {
    const rawToken = await authService.createPasswordResetToken(testEmail);
    
    await authService.resetPassword(rawToken, newPassword);

    // 1. Password updated?
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isNewPasswordValid = await verifyPassword(newPassword, user.passwordHash);
    expect(isNewPasswordValid).toBe(true);

    // 2. Token deleted?
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    });
    expect(tokenRecord).toBeNull();

    // 3. Sessions invalidated?
    const sessions = await prisma.session.findMany({ where: { userId } });
    expect(sessions).toHaveLength(0);
  });

  it('should throw error and delete token if token is expired', async () => {
    // Generate manually with expired date
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 1000) // expired
      }
    });

    await expect(authService.resetPassword(rawToken, newPassword))
      .rejects.toThrow(AppError);

    // Token should be deleted
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    });
    expect(tokenRecord).toBeNull();
  });

  it('should fail if token does not exist', async () => {
    const fakeToken = crypto.randomBytes(32).toString('hex');
    await expect(authService.resetPassword(fakeToken, newPassword))
      .rejects.toThrow(/Invalid or expired reset token/);
  });

  it('should enforce password length requirement on reset', async () => {
    const rawToken = await authService.createPasswordResetToken(testEmail);
    await expect(authService.resetPassword(rawToken, 'short'))
      .rejects.toThrow(/at least 8 characters long/);
  });
});
