'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/Button';
import Link from 'next/link';

export default function ResumeDetailPage({ params }) {
  const router = useRouter();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resumes/${params.id}`)
      .then(r => {
        if (!r.ok) {
          if (r.status === 404) router.push('/resumes');
          throw new Error('Failed to fetch');
        }
        return r.json();
      })
      .then(d => {
        setResume(d.data);
        setLoading(false);
      })
      .catch(console.error);
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    await fetch(`/api/resumes/${params.id}`, { method: 'DELETE' });
    router.push('/resumes');
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!resume) return <div className="p-8">Resume not found</div>;

  return (
    <div>
      <div className="mb-8">
        <Link href="/resumes" className="text-indigo-600 text-sm hover:underline mb-2 inline-block">
          &larr; Back to Resumes
        </Link>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{resume.name}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {resume.fileType} • {(resume.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-600 hover:bg-red-50">
              Delete Resume
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Parsing Status</h2>
        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            resume.parseStatus === 'PARSED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
            resume.parseStatus === 'FAILED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
            'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
          }`}>
            {resume.parseStatus}
          </span>
          {resume.parseError && (
            <span className="text-red-600 text-sm">{resume.parseError}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Extracted Text (Raw)</h2>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded overflow-auto max-h-96 text-sm font-mono whitespace-pre-wrap text-gray-800">
          {resume.rawText || 'No text extracted.'}
        </div>
      </div>
    </div>
  );
}
