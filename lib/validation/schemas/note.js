import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.string().min(1, 'Note content is required').max(5000),
});

export const updateNoteSchema = createNoteSchema;
