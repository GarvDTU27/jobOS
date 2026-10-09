import { z } from 'zod';

export const addTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
});
