import ApplicationForm from '@/components/tracker/ApplicationForm';
import { getSessionOrThrow } from '@/lib/auth/session';
import { getApplicationById } from '@/lib/services/application-service';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Application - JobOS',
};

export default async function EditApplicationPage({ params }) {
  const resolvedParams = await params;
  const session = await getSessionOrThrow();

  let application;
  try {
    application = await getApplicationById(resolvedParams.id, session.user.id);
  } catch (error) {
    notFound();
  }

  // Convert dates to YYYY-MM-DD for date inputs
  const initialData = {
    ...application,
    applicationDate: application.applicationDate ? application.applicationDate.toISOString().split('T')[0] : '',
    deadline: application.deadline ? application.deadline.toISOString().split('T')[0] : '',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Application</h1>
        <p className="mt-2 text-sm text-gray-500">
          Update your job application details.
        </p>
      </div>

      <ApplicationForm initialData={initialData} />
    </div>
  );
}
