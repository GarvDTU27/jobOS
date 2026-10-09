'use client';

import Link from 'next/link';


export default function JobList({ jobs }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center bg-white rounded-lg border border-gray-200 py-12 px-4 mt-6">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by saving a new job.</p>
        <div className="mt-6">
          <Link
            href="/jobs/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Add Job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md border border-gray-200">
      <ul role="list" className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link href={`/jobs/${job.id}`} className="block hover:bg-gray-50">
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="truncate font-medium text-indigo-600">{job.role}</p>
                      <p className="ml-1 shrink-0 font-normal text-gray-500">at {job.company}</p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>
                          {job.location || 'Remote'}
                          {job.salaryMin && ` • ${job.currency} ${job.salaryMin.toLocaleString()}${job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 shrink-0 sm:ml-5 sm:mt-0">
                    <div className="flex -space-x-1 overflow-hidden">
                      {job.skills && job.skills.slice(0, 5).map((js) => (
                        <span key={js.skill.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-2">
                          {js.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ml-5 shrink-0">
                  <span className="text-sm text-gray-500">
                    Saved on {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
