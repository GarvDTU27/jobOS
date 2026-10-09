import JobForm from '@/components/jobs/JobForm';

export default function NewJobPage() {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Job
          </h2>
        </div>
      </div>
      <JobForm />
    </div>
  );
}
