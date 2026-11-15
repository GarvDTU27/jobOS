import { z } from 'zod';

export const runMatchSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  resumeId: z.string().optional(),
  jobId: z.string().optional(),
});
