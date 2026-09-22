import { z } from 'zod';

export const SchoolSchema = z.object({
  name: z.string(),
  slug: z.string(),
  id: z.number().int(),
  createdAt: z.string(),
});

export type School = z.infer<typeof SchoolSchema>;
