'use client';

import React, { useState } from 'react';

export default function SkillGapList({ skillGaps = [] }) {
  const [filter, setFilter] = useState('ALL'); // ALL | STRONG | PARTIAL | MISSING

  const strongMatches = skillGaps.filter(g => g.matchLevel === 'STRONG');
  const partialMatches = skillGaps.filter(g => g.matchLevel === 'PARTIAL');
  const missingSkills = skillGaps.filter(g => g.matchLevel === 'MISSING');

  const filteredGaps = skillGaps.filter(g => {
    if (filter === 'ALL') return true;
    return g.matchLevel === filter;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Skill Gap Breakdown</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Detailed inspection of JD requirements matched against your background.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-lg bg-gray-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition ${filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            All ({skillGaps.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('STRONG')}
            className={`px-3 py-1.5 rounded-md transition ${filter === 'STRONG' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ✓ Strong ({strongMatches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PARTIAL')}
            className={`px-3 py-1.5 rounded-md transition ${filter === 'PARTIAL' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ~ Partial ({partialMatches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('MISSING')}
            className={`px-3 py-1.5 rounded-md transition ${filter === 'MISSING' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ✗ Missing ({missingSkills.length})
          </button>
        </div>
      </div>

      {/* List items */}
      {filteredGaps.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          No skills found under this filter.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredGaps.map((gap) => (
            <div key={gap.id || `${gap.skillName}-${gap.requirement}`} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                {gap.matchLevel === 'STRONG' && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                {gap.matchLevel === 'PARTIAL' && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                    ~
                  </span>
                )}
                {gap.matchLevel === 'MISSING' && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                    ✗
                  </span>
                )}
                <div>
                  <span className="text-sm font-semibold text-gray-900">{gap.skillName}</span>
                  {gap.evidence && (
                    <p className="text-xs text-gray-500 mt-0.5">{gap.evidence}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  gap.requirement === 'REQUIRED'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : gap.requirement === 'PREFERRED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {gap.requirement}
                </span>

                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                  gap.matchLevel === 'STRONG'
                    ? 'bg-emerald-50 text-emerald-700'
                    : gap.matchLevel === 'PARTIAL'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {gap.matchLevel === 'STRONG' ? 'Strong Match' : gap.matchLevel === 'PARTIAL' ? 'Partial / Semantic' : 'Missing Requirement'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explicit ATS Disclaimer */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
        <span className="font-semibold text-gray-800">ATS Readiness Disclaimer:</span> This match analysis is a deterministic readiness evaluation computed from structured requirements and normalized skill aliases. It is designed to help you identify skill gaps and tailor your application. It does not simulate or claim algorithmic parity with proprietary third-party Applicant Tracking Systems.
      </div>
    </div>
  );
}
