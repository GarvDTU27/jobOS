'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import MatchScoreCard from '@/features/matching/MatchScoreCard';
import SkillGapList from '@/features/matching/SkillGapList';

export default function MatchAnalysisPage({ params }) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.applicationId;

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [application, setApplication] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        // 1. Fetch application details
        const appRes = await fetch(`/api/applications/${applicationId}`);
        if (!appRes.ok) {
          throw new Error('Failed to load application details');
        }
        const appData = await appRes.json();
        if (ignore) return;
        setApplication(appData);
        setSelectedResumeId(appData.resumeId || '');

        // 2. Fetch user's resumes to allow evaluation against different variants
        const resumesRes = await fetch('/api/resumes');
        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          if (!ignore) {
            setResumes(resumesData.data || []);
          }
        }

        // 3. Fetch latest match analysis if exists
        const matchRes = await fetch(`/api/match?applicationId=${applicationId}`);
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          if (!ignore) {
            setAnalysis(matchData.data);
          }
        } else if (!ignore) {
          setAnalysis(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'An unexpected error occurred');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [applicationId]);

  const handleRunMatch = async () => {
    try {
      setRunning(true);
      setError(null);

      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          resumeId: selectedResumeId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Match analysis execution failed');
      }

      setAnalysis(data.data);
      // Reload application to update displayed match score
      const appRes = await fetch(`/api/applications/${applicationId}`);
      if (appRes.ok) {
        setApplication(await appRes.json());
      }
    } catch (err) {
      setError(err.message || 'Failed to run match analysis');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const hasJob = Boolean(application?.jobId || application?.job);
  const hasResume = Boolean(selectedResumeId || application?.resumeId);
  const canRun = hasJob && (hasResume || resumes.length > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/applications" className="hover:underline">Applications</Link>
            <span>/</span>
            <Link href={`/applications/${applicationId}`} className="hover:underline">{application?.role || 'Details'}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Match Analysis</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {application?.role} <span className="text-gray-500 font-normal">at</span> {application?.company}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/applications/${applicationId}`}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Back to Application
          </Link>
          <button
            type="button"
            onClick={handleRunMatch}
            disabled={running || !canRun}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Analyzing...' : analysis ? 'Re-run Analysis' : 'Run Match Analysis'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-rose-50 p-4 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Configuration Card: Attached Job & Resume Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Target Requirements & Resume Source</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Attached Job Posting</label>
            {hasJob ? (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 font-medium flex items-center justify-between">
                <span>{application?.job?.role || application?.role} ({application?.job?.company || application?.company})</span>
                <span className="text-xs text-emerald-600 font-semibold">✓ Attached</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                No job description is attached to this application. Link a job to analyze requirements.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Resume for Evaluation</label>
            {resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border"
              >
                <option value="">Select a resume...</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                No resumes uploaded yet.{' '}
                <Link href="/resumes" className="font-semibold underline">
                  Upload a resume
                </Link>{' '}
                first.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis Results */}
      {analysis ? (
        <div className="space-y-8">
          <MatchScoreCard analysis={analysis} />
          <SkillGapList skillGaps={analysis.skillGaps || []} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4">
            %
          </div>
          <h2 className="text-base font-semibold text-gray-900">No match analysis computed yet</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Run an analysis to compare your resume against the job description requirements across 6 dimensions.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleRunMatch}
              disabled={running || !canRun}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {running ? 'Running Analysis...' : 'Compute Match Analysis'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
