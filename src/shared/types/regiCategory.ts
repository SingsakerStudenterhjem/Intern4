import { z } from 'zod';

export const RegiCategorySchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  requiredHours: z.number().min(0, 'Må være 0 eller mer'),
  createdAt: z.date(),
});
export type RegiCategory = z.infer<typeof RegiCategorySchema>;
export type RegiCategoryWithId = RegiCategory & { id: string };
