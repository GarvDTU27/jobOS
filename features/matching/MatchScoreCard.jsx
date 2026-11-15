'use client';

import React from 'react';

function getScoreBadgeColor(score) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 ring-emerald-600/20';
  if (score >= 60) return 'text-amber-700 bg-amber-50 ring-amber-600/20';
  return 'text-rose-700 bg-rose-50 ring-rose-600/20';
}

function getScoreProgressColor(score) {
  if (score >= 80) return 'bg-emerald-600';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function MatchScoreCard({ analysis }) {
  if (!analysis) return null;

  const {
    overallScore = 0,
    technicalSkillsScore = 0,
    experienceScore = 0,
    educationScore = 0,
    responsibilitiesScore = 0,
    keywordsScore = 0,
    seniorityScore = 0,
  } = analysis;

  const categories = [
    { label: 'Technical Skills (30%)', score: technicalSkillsScore },
    { label: 'Experience Alignment (20%)', score: experienceScore },
    { label: 'Responsibilities Overlap (20%)', score: responsibilitiesScore },
    { label: 'Education Alignment (10%)', score: educationScore },
    { label: 'Keywords Density (10%)', score: keywordsScore },
    { label: 'Seniority Level (10%)', score: seniorityScore },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Overall Match Alignment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Deterministic multi-category qualification score based on normalized skills and requirements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-3xl font-extrabold ring-1 ring-inset ${getScoreBadgeColor(overallScore)}`}>
            {overallScore}%
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{cat.label}</span>
              <span className="font-semibold text-gray-900">{cat.score}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${getScoreProgressColor(cat.score)}`}
                style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
