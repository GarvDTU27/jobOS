import { z } from 'zod';

export const createJobSchema = z.object({
  company: z.string().min(1, 'Company is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  jobUrl: z.string().url().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  currency: z.string().length(3).default('USD').optional().nullable(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).optional().nullable(),
  experienceReq: z.string().max(100).optional().nullable(),
  description: z.string().max(50000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  postingDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
});

export const updateJobSchema = createJobSchema.partial();
