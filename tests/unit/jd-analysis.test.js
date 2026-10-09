import { describe, it, expect, vi } from 'vitest';
import { extractJobDescription } from '../../lib/ai/jd-analysis';

vi.mock('../../lib/ai/provider', () => ({
  complete: vi.fn(async ({ schema }) => {
    // Return a valid mock payload matching the schema
    return schema.parse({
      company: 'Tech Corp',
      role: 'Frontend Developer',
      location: 'Remote',
      salary: { min: 100000, max: 150000, currency: 'USD' },
      experience: '3+ years',
      employmentType: 'FULL_TIME',
      seniority: 'Mid-Level',
      skills: [
        { name: 'React', requirement: 'REQUIRED' },
        { name: 'TypeScript', requirement: 'PREFERRED' },
        { name: 'UI/UX Design', requirement: 'INFERRED' }
      ],
      responsibilities: ['Build UI components', 'Write tests'],
      qualifications: ['CS Degree'],
      technologies: ['React', 'Next.js'],
      softSkills: ['Communication'],
      keywords: ['SaaS'],
      educationReq: 'Bachelors'
    });
  })
}));

describe('JD Analysis AI Module', () => {
  it('should successfully extract data and match schema', async () => {
    const rawText = 'We are hiring a Frontend Developer at Tech Corp...';
    
    const result = await extractJobDescription(rawText);
    
    expect(result.company).toBe('Tech Corp');
    expect(result.role).toBe('Frontend Developer');
    expect(result.skills).toHaveLength(3);
    expect(result.skills[0].requirement).toBe('REQUIRED');
    expect(result.skills[1].requirement).toBe('PREFERRED');
    expect(result.skills[2].requirement).toBe('INFERRED');
  });
});
