import { getSessionOrThrow } from '@/lib/auth/session';
import { getApplicationById } from '@/lib/services/application-service';
import { getTagsForApplication } from '@/lib/services/tag-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const session = await getSessionOrThrow();
    const app = await getApplicationById(resolvedParams.id, session.user.id);
    return { title: `${app.role} at ${app.company} - JobOS` };
  } catch (e) {
    return { title: 'Application Not Found' };
  }
}

export default async function ApplicationDetailPage({ params }) {
  const resolvedParams = await params;
  const session = await getSessionOrThrow();

  let application, tags;
  try {
    [application, tags] = await Promise.all([
      getApplicationById(resolvedParams.id, session.user.id),
      getTagsForApplication(resolvedParams.id, session.user.id),
    ]);
  } catch (error) {
    notFound();
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {application.role}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Company: {application.company}
            </div>
            {application.location && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                Location: {application.location}
              </div>
            )}
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Status: {application.status}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Priority: {application.priority}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            {tags.map(tag => (
              <span key={tag.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href={`/applications/${application.id}/edit`}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            href={`/applications`}
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* TODO: Add History, Notes, and Events sections here */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Application Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Deadline</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {application.deadline ? new Date(application.deadline).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Recruiter Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.recruiterName || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Recruiter Contact</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.recruiterContact || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
