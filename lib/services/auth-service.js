import prisma from '../db/prisma';
import { hashPassword } from '../auth/password';
import { ConflictError } from '../utils/errors';
import { registerSchema } from '../validation/schemas/auth';

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
    return userWithoutPassword;
  }
};
