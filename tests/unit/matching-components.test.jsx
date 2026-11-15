import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MatchScoreCard from '../../features/matching/MatchScoreCard.jsx';
import SkillGapList from '../../features/matching/SkillGapList.jsx';

describe('Matching UI Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('MatchScoreCard', () => {
    it('renders overall score and category breakdown bars', () => {
      const mockAnalysis = {
        overallScore: 88,
        technicalSkillsScore: 95,
        experienceScore: 80,
        educationScore: 100,
        responsibilitiesScore: 75,
        keywordsScore: 85,
        seniorityScore: 70,
      };

      render(<MatchScoreCard analysis={mockAnalysis} />);

      expect(screen.getByText('Overall Match Alignment')).toBeDefined();
      expect(screen.getByText('88%')).toBeDefined();
      expect(screen.getByText('Technical Skills (30%)')).toBeDefined();
      expect(screen.getByText('95%')).toBeDefined();
    });

    it('returns null when analysis is missing', () => {
      const { container } = render(<MatchScoreCard analysis={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SkillGapList', () => {
    const mockGaps = [
      { id: '1', skillName: 'React', matchLevel: 'STRONG', requirement: 'REQUIRED', evidence: 'Direct match: React' },
      { id: '2', skillName: 'In-Memory Caching', matchLevel: 'PARTIAL', requirement: 'PREFERRED', evidence: 'Semantic match: Redis (85% confidence)' },
      { id: '3', skillName: 'Kubernetes', matchLevel: 'MISSING', requirement: 'REQUIRED', evidence: null },
    ];

    it('renders all skills and ATS disclaimer note', () => {
      render(<SkillGapList skillGaps={mockGaps} />);

      expect(screen.getByText('Skill Gap Breakdown')).toBeDefined();
      expect(screen.getByText('React')).toBeDefined();
      expect(screen.getByText('In-Memory Caching')).toBeDefined();
      expect(screen.getByText('Kubernetes')).toBeDefined();
      expect(screen.getByText(/ATS Readiness Disclaimer/i)).toBeDefined();
    });

    it('filters skills when clicking filter pills', () => {
      render(<SkillGapList skillGaps={mockGaps} />);

      // Filter by Strong matches
      fireEvent.click(screen.getByRole('button', { name: /✓ Strong/i }));
      expect(screen.getByText('React')).toBeDefined();
      expect(screen.queryByText('In-Memory Caching')).toBeNull();
      expect(screen.queryByText('Kubernetes')).toBeNull();

      // Filter by Missing
      fireEvent.click(screen.getByRole('button', { name: /✗ Missing/i }));
      expect(screen.queryByText('React')).toBeNull();
      expect(screen.getByText('Kubernetes')).toBeDefined();
    });
  });
});
