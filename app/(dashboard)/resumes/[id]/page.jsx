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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/resumes" className="text-blue-600 text-sm hover:underline mb-2 inline-block">
            &larr; Back to Resumes
          </Link>
          <h1 className="text-3xl font-bold">{resume.name}</h1>
          <p className="text-gray-500 mt-1">{resume.fileType} • {(resume.fileSize / 1024).toFixed(1)} KB</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-600 hover:bg-red-50">
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Parsing Status</h2>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            resume.parseStatus === 'PARSED' ? 'bg-green-100 text-green-800' :
            resume.parseStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {resume.parseStatus}
          </span>
          {resume.parseError && (
            <span className="text-red-600 text-sm">{resume.parseError}</span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Extracted Text (Raw)</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96 text-sm font-mono whitespace-pre-wrap">
          {resume.rawText || 'No text extracted.'}
        </div>
      </div>
    </div>
  );
}
