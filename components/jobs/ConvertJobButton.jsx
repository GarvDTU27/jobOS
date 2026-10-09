'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConvertJobButton({ jobId }) {
  const router = useRouter();
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    try {
      setIsConverting(true);
      const res = await fetch(`/api/jobs/${jobId}/convert-to-application`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to convert job');
      }

      const application = await res.json();
      router.push(`/applications/${application.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error converting job:', error);
      alert('Failed to convert job to application.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleConvert}
      disabled={isConverting}
      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
    >
      {isConverting ? 'Converting...' : 'Convert to Application'}
    </button>
  );
}
