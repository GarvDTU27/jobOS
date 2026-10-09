import ApplicationForm from '@/components/tracker/ApplicationForm';
import { getSessionOrThrow } from '@/lib/auth/session';

export const metadata = {
  title: 'New Application - JobOS',
};

export default async function NewApplicationPage() {
  await getSessionOrThrow();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Application</h1>
        <p className="mt-2 text-sm text-gray-500">
          Track a new job application and its progress.
        </p>
      </div>

      <ApplicationForm />
    </div>
  );
}
