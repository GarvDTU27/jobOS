'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Form schema allows YYYY-MM-DD dates from standard HTML date inputs
const formSchema = z.object({
  company: z.string().min(1, 'Company is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  location: z.string().max(100).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum([
    'SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'TECHNICAL_INTERVIEW',
    'HR', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED'
  ]).default('SAVED'),
  applicationDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  recruiterName: z.string().max(100).optional().nullable(),
  recruiterContact: z.string().max(255).optional().nullable(),
});

export default function ApplicationForm({ initialData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      company: '',
      role: '',
      location: '',
      status: 'SAVED',
      priority: 'MEDIUM',
      applicationDate: '',
      deadline: '',
      recruiterName: '',
      recruiterContact: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Clean up empty strings to undefined to match schema/db
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, val]) => [key, val === '' ? undefined : val])
      );
      
      // Keep dates properly formatted (from YYYY-MM-DD back to ISO or leaving it as YYYY-MM-DD)
      if (cleanData.applicationDate) {
        cleanData.applicationDate = new Date(cleanData.applicationDate).toISOString();
      }
      if (cleanData.deadline) {
        cleanData.deadline = new Date(cleanData.deadline).toISOString();
      }

      const url = isEditing ? `/api/applications/${initialData.id}` : '/api/applications';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save application');
      }

      const savedData = await res.json();
      router.push(`/applications/${savedData.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="col-span-1">
          <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900">
            Company *
          </label>
          <div className="mt-2">
            <input
              {...register('company')}
              id="company"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
            Role *
          </label>
          <div className="mt-2">
            <input
              {...register('role')}
              id="role"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>
        </div>

        <div className="col-span-2">
          <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
            Location
          </label>
          <div className="mt-2">
            <input
              {...register('location')}
              id="location"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
            Status
          </label>
          <div className="mt-2">
            <select
              {...register('status')}
              id="status"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2 bg-white"
            >
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="OA">OA</option>
              <option value="INTERVIEW">Interview</option>
              <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
              <option value="HR">HR</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="GHOSTED">Ghosted</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="priority" className="block text-sm font-medium leading-6 text-gray-900">
            Priority
          </label>
          <div className="mt-2">
            <select
              {...register('priority')}
              id="priority"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2 bg-white"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="applicationDate" className="block text-sm font-medium leading-6 text-gray-900">
            Application Date
          </label>
          <div className="mt-2">
            <input
              type="date"
              {...register('applicationDate')}
              id="applicationDate"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.applicationDate && <p className="mt-1 text-sm text-red-600">{errors.applicationDate.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="deadline" className="block text-sm font-medium leading-6 text-gray-900">
            Deadline
          </label>
          <div className="mt-2">
            <input
              type="date"
              {...register('deadline')}
              id="deadline"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="recruiterName" className="block text-sm font-medium leading-6 text-gray-900">
            Recruiter Name
          </label>
          <div className="mt-2">
            <input
              {...register('recruiterName')}
              id="recruiterName"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.recruiterName && <p className="mt-1 text-sm text-red-600">{errors.recruiterName.message}</p>}
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="recruiterContact" className="block text-sm font-medium leading-6 text-gray-900">
            Recruiter Contact (Email/LinkedIn)
          </label>
          <div className="mt-2">
            <input
              {...register('recruiterContact')}
              id="recruiterContact"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
            />
            {errors.recruiterContact && <p className="mt-1 text-sm text-red-600">{errors.recruiterContact.message}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Application'}
        </button>
      </div>
    </form>
  );
}
