import { auth } from '../../lib/auth/auth';
import { AlertCircle } from 'lucide-react';

export async function VerificationBanner() {
  const session = await auth();
  
  if (!session || session.user.emailVerified) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-800">
        Please verify your email address. We sent a verification link to <span className="font-semibold">{session.user.email}</span>.
      </p>
    </div>
  );
}
