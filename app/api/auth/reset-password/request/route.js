import { authService } from '../../../../../lib/services/auth-service';
import { handleRouteError } from '../../../../../lib/utils/errors';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);

    const token = await authService.createPasswordResetToken(email);

    if (token) {
      // In a real application, you would send an email here.
      // For development, we'll log it or return it safely if in dev mode
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV MODE] Password reset link for ${email}: http://localhost:3000/reset-password?token=${token}`);
      }
    }

    // Always return a generic success message to prevent email enumeration
    return Response.json({ message: 'If that email is in our system, we sent a password reset link.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return Response.json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } }, { status: 400 });
    }
    return handleRouteError(error);
  }
}
