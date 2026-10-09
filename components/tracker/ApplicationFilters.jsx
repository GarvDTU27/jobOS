'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';

export default function ApplicationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.getAll('status') || []);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const isInitialMount = React.useRef(true);

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const handler = setTimeout(() => {
      applyFilters({ search, status, sortBy, sortOrder });
    }, 300);
    return () => clearTimeout(handler);
  }, [search]); // Only run when search changes

  const applyFilters = (filters) => {
    const params = new URLSearchParams(searchParams);
    
    if (filters.search) params.set('search', filters.search);
    else params.delete('search');

    params.delete('status');
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(s => params.append('status', s));
    }

    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    
    // Reset to page 1 on filter change if there's a skip param
    params.delete('skip');

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    let newStatus = [...status];
    if (e.target.checked) {
      newStatus.push(val);
    } else {
      newStatus = newStatus.filter(s => s !== val);
    }
    setStatus(newStatus);
    applyFilters({ search, status: newStatus, sortBy, sortOrder });
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    applyFilters({ search, status, sortBy: newSortBy, sortOrder: newSortOrder });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4 mb-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
          />
        </div>
        
        <div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white text-gray-900"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="matchScore-desc">Highest Match Score</option>
            <option value="deadline-asc">Deadline Approaching</option>
          </select>
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-gray-700 mb-2 block">Status Filters:</span>
        <div className="flex flex-wrap gap-3">
          {['SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'TECHNICAL_INTERVIEW', 'HR', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED'].map((s) => (
            <label key={s} className="inline-flex items-center">
              <input
                type="checkbox"
                value={s}
                checked={status.includes(s)}
                onChange={handleStatusChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">{s.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
