import { RegisterForm } from '../../../features/auth/RegisterForm';

export const metadata = {
  title: 'Register | JobOS',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <RegisterForm />
    </div>
  );
}
