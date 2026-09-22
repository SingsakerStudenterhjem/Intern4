import { z } from 'zod';

export const StudySchema = z.object({
  name: z.string(),
  slug: z.string(),
  id: z.number().int(),
  createdAt: z.string(),
});

export type Study = z.infer<typeof StudySchema>;
