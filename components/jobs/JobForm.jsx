'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobForm({ initialData = null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      company: formData.get('company'),
      role: formData.get('role'),
      jobUrl: formData.get('jobUrl') || null,
      location: formData.get('location') || null,
      salaryMin: formData.get('salaryMin') ? parseInt(formData.get('salaryMin'), 10) : null,
      salaryMax: formData.get('salaryMax') ? parseInt(formData.get('salaryMax'), 10) : null,
      currency: formData.get('currency') || 'USD',
      employmentType: formData.get('employmentType') || null,
      experienceReq: formData.get('experienceReq') || null,
      description: formData.get('description') || null,
    };

    try {
      const url = isEdit ? `/api/jobs/${initialData.id}` : '/api/jobs';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to save job');
      }

      const job = await res.json();
      router.push('/jobs'); // or /jobs/${job.id} later
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-gray-200">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Job Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Information about the job posting.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  required
                  defaultValue={initialData?.company || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                  Role *
                </label>
                <input
                  type="text"
                  name="role"
                  id="role"
                  required
                  defaultValue={initialData?.role || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="jobUrl" className="block text-sm font-medium leading-6 text-gray-900">
                  Job URL
                </label>
                <input
                  type="url"
                  name="jobUrl"
                  id="jobUrl"
                  defaultValue={initialData?.jobUrl || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  defaultValue={initialData?.location || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="employmentType" className="block text-sm font-medium leading-6 text-gray-900">
                  Employment Type
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  defaultValue={initialData?.employmentType || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select...</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="salaryMin" className="block text-sm font-medium leading-6 text-gray-900">
                  Min Salary
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  id="salaryMin"
                  defaultValue={initialData?.salaryMin || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="salaryMax" className="block text-sm font-medium leading-6 text-gray-900">
                  Max Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  id="salaryMax"
                  defaultValue={initialData?.salaryMax || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="currency" className="block text-sm font-medium leading-6 text-gray-900">
                  Currency
                </label>
                <input
                  type="text"
                  name="currency"
                  id="currency"
                  defaultValue={initialData?.currency || 'USD'}
                  maxLength={3}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={initialData?.description || ''}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </form>
  );
}
