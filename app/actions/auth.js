'use server';

import { authService } from '../../lib/services/auth-service';
import { AppError } from '../../lib/utils/errors';

export async function register(formData) {
  try {
    const data = Object.fromEntries(formData.entries());
    await authService.registerUser(data);
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    // Zod errors are caught here
    if (error.name === 'ZodError') {
      return { error: error.issues[0].message };
    }
    return { error: 'An unexpected error occurred during registration.' };
  }
}
