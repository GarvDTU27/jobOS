import { authService } from '../../../../lib/services/auth-service';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=MissingToken', req.url));
  }

  try {
    await authService.verifyEmail(token);
    // Redirect to dashboard with a success message
    return NextResponse.redirect(new URL('/dashboard?verified=true', req.url));
  } catch (error) {
    // Redirect with error
    return NextResponse.redirect(new URL('/login?error=InvalidToken', req.url));
  }
}
