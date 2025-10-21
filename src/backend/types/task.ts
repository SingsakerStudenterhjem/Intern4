import { z } from 'zod';
import { FirestoreTimestamp } from './firestoreTimestamp';

export const TaskSchema = z.object({
  taskName: z.string(),
  category: z.string(),
  description: z.string().optional(),
  contactPerson: z.string(), // Changed from z.uuid() to z.string() for display name
  contactPersonId: z.string(), // Separate field for user ID
  deadline: FirestoreTimestamp.optional(),
  hourEstimate: z.number().optional(),
  participants: z.array(z.string()).default([]), // Array of user IDs who signed up
  maxParticipants: z.number().optional(), // Maximum number of participants (undefined = unlimited)
  completed: z.boolean().default(false),
  completedAt: FirestoreTimestamp.optional(),
  isApproved: z.boolean().default(false),
  createdAt: FirestoreTimestamp,
  createdBy: z.string(), // User ID who created the task
  isActive: z.boolean().default(true), // For soft delete
});

export type Task = z.infer<typeof TaskSchema>;
