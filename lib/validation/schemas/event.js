import { z } from 'zod';

export const createEventSchema = z.object({
  type: z.enum(['DEADLINE', 'INTERVIEW', 'ASSESSMENT', 'OFFER', 'OTHER']),
  title: z.string().min(1, 'Title is required').max(100),
  scheduledAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial();
