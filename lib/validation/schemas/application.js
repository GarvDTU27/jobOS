import { z } from 'zod';

export const createApplicationSchema = z.object({
  company: z.string().min(1, 'Company is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  location: z.string().max(100).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum([
    'SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'TECHNICAL_INTERVIEW',
    'HR', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED'
  ]).optional().default('SAVED'),
  applicationDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  recruiterName: z.string().max(100).optional().nullable(),
  recruiterContact: z.string().max(255).optional().nullable(),
  jobId: z.string().cuid().optional().nullable(),
  resumeId: z.string().cuid().optional().nullable(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum([
    'SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'TECHNICAL_INTERVIEW',
    'HR', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED'
  ]),
  note: z.string().max(1000).optional().nullable(),
});
