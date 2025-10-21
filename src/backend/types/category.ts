import { z } from 'zod';
import { FirestoreTimestamp } from './firestoreTimestamp';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().default('#3B82F6'), // Hex color for category
  isActive: z.boolean().default(true),
  createdAt: FirestoreTimestamp,
  createdBy: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;
