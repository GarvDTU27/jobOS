import { LoginForm } from '../../../features/auth/LoginForm';

export const metadata = {
  title: 'Log In | JobOS',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <LoginForm />
    </div>
  );
}
