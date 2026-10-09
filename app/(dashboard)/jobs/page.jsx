import { getSessionOrThrow } from '@/lib/auth/session';
import { listJobs } from '@/lib/services/job-service';
import JobList from '@/components/jobs/JobList';
import JobFilters from '@/components/jobs/JobFilters';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function JobsPage({ searchParams }) {
  const session = await getSessionOrThrow();
  const resolvedParams = await searchParams;
  
  const skip = parseInt(resolvedParams.skip || '0', 10);
  const take = parseInt(resolvedParams.take || '50', 10);
  const search = resolvedParams.search;
  const archived = resolvedParams.archived === 'true';
  const sortBy = resolvedParams.sortBy || 'createdAt';
  const sortOrder = resolvedParams.sortOrder || 'desc';

  const { jobs, total } = await listJobs(session.user.id, {
    skip,
    take,
    search,
    archived,
    sortBy,
    sortOrder
  });

  const getPaginationLink = (newSkip) => {
    const params = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('skip', newSkip);
    params.set('take', take);
    return `?${params.toString()}`;
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Saved Jobs</h1>
          <p className="mt-2 text-sm text-gray-500">
            A list of all jobs you've saved.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/jobs/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            Add Job
          </Link>
        </div>
      </div>

      <JobFilters />

      <Suspense fallback={<div className="text-gray-500 py-10 text-center">Loading jobs...</div>}>
        <JobList jobs={jobs} />
      </Suspense>

      {total > take && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 sm:px-6 border border-gray-200 rounded-lg">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{skip + 1}</span> to <span className="font-medium">{Math.min(skip + take, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {skip > 0 && (
                  <Link
                    href={getPaginationLink(Math.max(0, skip - take))}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    Previous
                  </Link>
                )}
                {skip + take < total && (
                  <Link
                    href={getPaginationLink(skip + take)}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    Next
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
