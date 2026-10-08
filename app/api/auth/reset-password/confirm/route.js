import { authService } from '../../../../../lib/services/auth-service';
import { handleRouteError, AppError } from '../../../../../lib/utils/errors';
import { z } from 'zod';

const confirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, password } = confirmSchema.parse(body);

    await authService.resetPassword(token, password);

    return Response.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return Response.json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } }, { status: 400 });
    }
    return handleRouteError(error);
  }
}
