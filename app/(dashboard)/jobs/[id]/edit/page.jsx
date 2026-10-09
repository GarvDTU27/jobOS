import { getSessionOrThrow } from '@/lib/auth/session';
import { getJobById } from '@/lib/services/job-service';
import JobForm from '@/components/jobs/JobForm';
import { notFound } from 'next/navigation';
import { NotFoundError } from '@/lib/utils/errors';

export default async function EditJobPage({ params }) {
  const session = await getSessionOrThrow();
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let job;
  try {
    job = await getJobById(id, session.user.id);
  } catch (err) {
    if (err instanceof NotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Job
          </h2>
        </div>
      </div>
      <JobForm initialData={job} />
    </div>
  );
}
