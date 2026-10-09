'use client';

export default function ExtractionResults({ data }) {
  if (!data) return null;
  const analysis = data.analysis;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mt-8 space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Analysis Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Company</h3>
          <p className="mt-1 text-gray-900">{data.company || 'Not detected'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Role</h3>
          <p className="mt-1 text-gray-900">{data.role || 'Not detected'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Location</h3>
          <p className="mt-1 text-gray-900">{data.location || 'Not detected'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Employment Type</h3>
          <p className="mt-1 text-gray-900">{data.employmentType || 'Not detected'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Experience</h3>
          <p className="mt-1 text-gray-900">{data.experienceReq || 'Not detected'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Education</h3>
          <p className="mt-1 text-gray-900">{analysis?.educationReq || 'Not detected'}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Skills Identified</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills?.length > 0 ? data.skills.map((jobSkill, idx) => {
            const isRequired = jobSkill.requirement === 'REQUIRED';
            const isPreferred = jobSkill.requirement === 'PREFERRED';
            const isInferred = jobSkill.requirement === 'INFERRED';
            
            return (
              <span key={idx} className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                isRequired ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                isPreferred ? 'bg-green-50 text-green-700 ring-green-600/20' :
                'bg-gray-50 text-gray-700 ring-gray-600/20 border border-dashed border-gray-400'
              }`}>
                {jobSkill.skill?.name || jobSkill.skillId}
                {isInferred && <span className="ml-1 opacity-60">(inferred)</span>}
              </span>
            );
          }) : (
            <span className="text-sm text-gray-500">No specific skills detected.</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Responsibilities</h3>
        <ul className="list-disc pl-5 space-y-1">
          {analysis?.responsibilities?.length > 0 ? (
            analysis.responsibilities.map((r, i) => <li key={i} className="text-sm text-gray-800">{r}</li>)
          ) : (
            <li className="text-sm text-gray-500 list-none -ml-5">None detected</li>
          )}
        </ul>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Qualifications</h3>
        <ul className="list-disc pl-5 space-y-1">
          {analysis?.qualifications?.length > 0 ? (
            analysis.qualifications.map((r, i) => <li key={i} className="text-sm text-gray-800">{r}</li>)
          ) : (
            <li className="text-sm text-gray-500 list-none -ml-5">None detected</li>
          )}
        </ul>
      </div>

    </div>
  );
}
