import { z } from 'zod';
import { FirestoreTimestamp } from './firestoreTimestamp';

export const TaskSchema = z.object({
  taskName: z.string(),
  category: z.string(),
  description: z.string().optional(),
  contactPerson: z.uuid(),
  deadline: FirestoreTimestamp,
  hourEstimate: z.number().optional(), // int or float
  takenBy: z.uuid(),
  completed: z.boolean(),
  completedAt: FirestoreTimestamp,
  isApproved: z.boolean(),
});

export type Task = z.infer<typeof TaskSchema>;
