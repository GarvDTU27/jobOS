import { z } from 'zod';

export const jdExtractionSchema = z.object({
  company: z.string().nullable().describe('The name of the company hiring, or null if not found.'),
  role: z.string().nullable().describe('The job title or role being hired for, or null if not found.'),
  location: z.string().nullable().describe('The location of the job (e.g. San Francisco, CA or Remote), or null if not found.'),
  salary: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
    currency: z.string().nullable()
  }).nullable().describe('Extracted salary information if available, otherwise null.'),
  experience: z.string().nullable().describe('String describing years of experience required (e.g. "3-5 years", "5+ years").'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).nullable(),
  seniority: z.string().nullable().describe('Extracted seniority level (e.g. "Junior", "Senior", "Lead", "Staff", "Director").'),
  skills: z.array(
    z.object({
      name: z.string(),
      requirement: z.enum(['REQUIRED', 'PREFERRED', 'INFERRED'])
    })
  ).describe('List of all skills mentioned in the job description.'),
  responsibilities: z.array(z.string()).describe('List of core job responsibilities.'),
  qualifications: z.array(z.string()).describe('List of required and preferred qualifications (excluding specific skills).'),
  technologies: z.array(z.string()).describe('List of technologies, tools, and languages mentioned.'),
  softSkills: z.array(z.string()).describe('List of soft skills (e.g. "Communication", "Leadership", "Teamwork").'),
  keywords: z.array(z.string()).describe('Other important keywords to track for this job.'),
  educationReq: z.string().nullable().describe('Educational requirement (e.g. "Bachelor\'s degree in Computer Science").')
});
