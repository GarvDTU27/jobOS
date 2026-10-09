import { z } from 'zod';

export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
];

export const uploadResumeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  isDefault: z.boolean().default(false)
});
