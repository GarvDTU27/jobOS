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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resumes</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" required className="w-full border rounded p-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input type="file" name="file" required accept=".txt,.pdf,.doc,.docx" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isDefault" value="true" id="isDefault" />
            <label htmlFor="isDefault" className="text-sm">Set as default</label>
          </div>
          <Button type="submit">Upload</Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b">
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Default</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            ) : resumes.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No resumes found</td></tr>
            ) : (
              resumes.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="p-4">
                    <Link href={`/resumes/${r.id}`} className="text-blue-600 hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="p-4">{r.fileType}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.parseStatus === 'PARSED' ? 'bg-green-100 text-green-800' :
                      r.parseStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {r.parseStatus}
                    </span>
                  </td>
                  <td className="p-4">{r.isDefault ? 'Yes' : 'No'}</td>
                  <td className="p-4">
                    <Link href={`/resumes/${r.id}`} className="text-blue-600 hover:underline text-sm">
                      View
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
