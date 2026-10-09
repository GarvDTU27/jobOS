import Link from 'next/link';

function StatusBadge({ status }) {
  const colors = {
    SAVED: 'bg-gray-100 text-gray-800',
    APPLIED: 'bg-blue-100 text-blue-800',
    OA: 'bg-purple-100 text-purple-800',
    INTERVIEW: 'bg-yellow-100 text-yellow-800',
    TECHNICAL_INTERVIEW: 'bg-orange-100 text-orange-800',
    HR: 'bg-pink-100 text-pink-800',
    OFFER: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-600',
    GHOSTED: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.SAVED}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function ApplicationList({ applications }) {
  if (applications.length === 0) {
    return (
      <div className="text-center bg-white rounded-lg shadow p-12 border border-gray-200">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No applications</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new application.</p>
        <div className="mt-6">
          <Link
            href="/applications/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            New Application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
      <ul role="list" className="divide-y divide-gray-200">
        {applications.map((application) => (
          <li key={application.id}>
            <Link href={`/applications/${application.id}`} className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-indigo-600 truncate">{application.role}</p>
                    <p className="text-sm text-gray-500 truncate">at {application.company}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <StatusBadge status={application.status} />
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex sm:gap-4">
                    {application.location && (
                      <p className="flex items-center text-sm text-gray-500">
                        {application.location}
                      </p>
                    )}
                    {application.matchScore && (
                      <p className="flex items-center text-sm text-gray-500">
                        Match: {application.matchScore}%
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Added on <time dateTime={application.createdAt.toISOString()}>{new Date(application.createdAt).toLocaleDateString()}</time>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
