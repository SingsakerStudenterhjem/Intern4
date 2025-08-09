import { z } from 'zod';
import { FirestoreTimestamp } from './firestoreTimestamp';

export const WorkTypeSchema = z.enum([
  'vedlikehold',
  'rengjoring',
  'arrangement',
  'kafe',
  'dugnad',
  'annet',
]);
export type WorkType = z.infer<typeof WorkTypeSchema>;

export const WorkStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type WorkStatus = z.infer<typeof WorkStatusSchema>;

export const RegiLogSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  date: FirestoreTimestamp,
  hours: z.number().positive(),
  type: WorkTypeSchema,
  images: z.array(z.string()).default([]),
  status: WorkStatusSchema.default('pending'),
  createdAt: FirestoreTimestamp,
  reviewedBy: z.string().optional(),
  reviewedAt: FirestoreTimestamp.optional(),
  reviewerComment: z.string().optional(),
});
export type RegiLog = z.infer<typeof RegiLogSchema>;

// Helper for Firestore reads that add the document id
export type RegiLogWithId = RegiLog & { id: string };
