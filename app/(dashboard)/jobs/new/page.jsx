'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JobForm from '@/components/jobs/JobForm';
import JDInputPanel from '@/features/jd-analysis/JDInputPanel';
import { Button } from '@/components/ui/Button';

export default function NewJobPage() {
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const router = useRouter();

  const handleExtractionComplete = (jobData) => {
    // Navigate to the job page where they can see the extraction results
    router.push(`/jobs/${jobData.id}`);
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Job
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
          >
            {mode === 'auto' ? 'Enter Manually' : 'Parse with AI'}
          </Button>
        </div>
      </div>
      
      {mode === 'auto' ? (
        <div className="max-w-3xl">
          <JDInputPanel onExtractionComplete={handleExtractionComplete} />
        </div>
      ) : (
        <JobForm />
      )}
    </div>
  );
}
