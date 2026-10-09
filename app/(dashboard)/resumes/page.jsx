'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resumes')
      .then(r => r.json())
      .then(d => {
        setResumes(d.data || []);
        setLoading(false);
      });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('/api/resumes', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const err = await res.json();
      alert(err.error?.message || 'Upload failed');
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Resumes</h1>
          <p className="mt-2 text-sm text-gray-500">
            A list of all resumes you've uploaded.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Resume</h2>
        <form onSubmit={handleUpload} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input type="file" name="file" required accept=".txt,.pdf,.doc,.docx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isDefault" value="true" id="isDefault" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
            <label htmlFor="isDefault" className="text-sm text-gray-900">Set as default</label>
          </div>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">Upload Resume</Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Default</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : resumes.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-sm text-gray-500">No resumes found.</td></tr>
            ) : (
              resumes.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <Link href={`/resumes/${r.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {r.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{r.fileType}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      r.parseStatus === 'PARSED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      r.parseStatus === 'FAILED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                      'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {r.parseStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{r.isDefault ? 'Yes' : 'No'}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link href={`/resumes/${r.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View<span className="sr-only">, {r.name}</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
