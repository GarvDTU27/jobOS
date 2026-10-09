'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/Button';

export default function JDInputPanel({ onExtractionComplete }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!text && !file) {
      setError('Please provide text or a file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/jd/parse', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/jd/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to parse Job Description');
      }

      const { data } = await res.json();
      if (onExtractionComplete) {
        onExtractionComplete(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Analyze Job Description</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF, DOCX, TXT)</label>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
        </div>

        <div className="flex items-center text-gray-400 text-sm">
          <span className="flex-1 border-t border-gray-300"></span>
          <span className="px-3">OR</span>
          <span className="flex-1 border-t border-gray-300"></span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paste Job Description</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!!file}
            rows={8}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            placeholder="Paste job description text here..."
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button onClick={handleParse} disabled={loading} className="w-full">
          {loading ? 'Analyzing...' : 'Parse Job Description'}
        </Button>
      </div>
    </div>
  );
}
