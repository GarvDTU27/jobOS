import prisma from '../db/prisma';
import { hashPassword } from '../auth/password';
import { ConflictError, AppError } from '../utils/errors';
import { registerSchema } from '../validation/schemas/auth';
import crypto from 'crypto';

export const authService = {
  /**
   * Registers a new user.
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} [data.name]
   * @returns {Promise<Object>} The created user without the password hash.
   */
  async registerUser(data) {
    // Validate input against schema
    const validatedData = registerSchema.parse(data);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        name: validatedData.name,
      }
    });

    // Return the user without the password hash
    const { passwordHash, ...userWithoutPassword } = user;

    // Issue email verification token
    const verificationToken = await authService.createEmailVerificationToken(user.email);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] Email verification link for ${user.email}: http://localhost:3000/api/auth/verify-email?token=${verificationToken}`);
    }

    return userWithoutPassword;
  },

  /**
   * Generates an email verification token for the given email.
   * @param {string} email
   * @returns {Promise<string>} The raw token.
   */
  async createEmailVerificationToken(email) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Invalidate existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: expiresAt
      }
    });

    return rawToken;
  },

  /**
   * Verifies the user's email using the provided token.
   * @param {string} rawToken
   * @returns {Promise<void>}
   */
  async verifyEmail(rawToken) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: hashedToken }
    });

    if (!tokenRecord) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    if (new Date() > tokenRecord.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token: hashedToken }
      });
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Transaction to update user and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: tokenRecord.identifier },
        data: { emailVerified: new Date() }
      }),
      prisma.verificationToken.delete({
        where: { token: hashedToken }
      })
    ]);
  },

  /**
   * Generates a password reset token for the given email.
   * @param {string} email
   * @returns {Promise<string|null>} The raw token if user exists, null otherwise.
   */
  async createPasswordResetToken(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: expiresAt
      }
    });

    return rawToken;
  },

  /**
   * Resets the user's password using the provided token.
   * @param {string} rawToken
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async resetPassword(rawToken, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    if (new Date() > tokenRecord.expiresAt) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: tokenRecord.id }
      });
      throw new AppError('Invalid or expired reset token', 400);
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Transaction to update password, delete token, and invalidate sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: newPasswordHash }
      }),
      prisma.passwordResetToken.delete({
        where: { id: tokenRecord.id }
      }),
      prisma.session.deleteMany({
        where: { userId: tokenRecord.userId }
      })
    ]);
  }
};
