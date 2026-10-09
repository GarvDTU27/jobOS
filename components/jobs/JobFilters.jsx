'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [archived, setArchived] = useState(searchParams.get('archived') === 'true');

  const updateFilters = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('skip', '0'); // reset pagination
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters('search', searchTerm);
  };

  return (
    <div className="bg-white px-4 py-3 sm:px-6 border border-gray-200 rounded-lg">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search</label>
          <input
            type="text"
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search company or role..."
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="archived"
            name="archived"
            type="checkbox"
            checked={archived}
            onChange={(e) => {
              setArchived(e.target.checked);
              updateFilters('archived', e.target.checked ? 'true' : '');
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="archived" className="ml-2 block text-sm text-gray-900">
            Show Archived
          </label>
        </div>

        <button
          type="submit"
          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}
