import { z } from 'zod';
import { FirestoreTimestamp } from '../../firestoreTimestamp';

// Core Task Schema
export const TaskSchema = z.object({
  id: z.string(),
  taskName: z.string().min(1, 'Oppgavenavn er påkrevd'),
  category: z.string().min(1, 'Kategori er påkrevd'),
  description: z.string().optional(),
  contactPerson: z.string(),
  contactPersonId: z.string(),
  deadline: FirestoreTimestamp.optional(),
  hourEstimate: z.number().positive().optional(),
  participants: z.array(z.string()).default([]),
  maxParticipants: z.number().positive().optional(),
  completed: z.boolean().default(false),
  completedAt: FirestoreTimestamp.optional(),
  isApproved: z.boolean().default(false),
  createdAt: FirestoreTimestamp,
  createdBy: z.string(),
  isActive: z.boolean().default(true),
});

// Task Form Data Schema (for forms with string inputs)
export const TaskFormDataSchema = z.object({
  taskName: z.string(),
  category: z.string(),
  description: z.string().default(''),
  deadline: z.string().default(''), // datetime-local input gives string
  hourEstimate: z.string().default(''), // number input as string
  maxParticipants: z.string().default(''), // number input as string
});

// Task Creation Data Schema (processed form data for API)
export const TaskCreationDataSchema = z.object({
  taskName: z.string().min(1, 'Oppgavenavn er påkrevd'),
  category: z.string().min(1, 'Kategori er påkrevd'),
  description: z.string().optional(),
  contactPerson: z.string(),
  contactPersonId: z.string(),
  deadline: z.date().optional(),
  hourEstimate: z.number().positive().optional(),
  maxParticipants: z.number().positive().optional(),
  participants: z.array(z.string()).default([]),
  completed: z.boolean().default(false),
  isApproved: z.boolean().default(false),
  createdBy: z.string(),
  isActive: z.boolean().default(true),
});

// Task Update Schema (for partial updates)
export const TaskUpdateSchema = TaskSchema.partial().omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

// Task Filter Schema
export const TaskFilterSchema = z.object({
  category: z.string().optional(),
  completed: z.boolean().optional(),
  createdBy: z.string().optional(),
  participants: z.string().optional(), // filter by participant ID
  search: z.string().optional(),
});

// Participant Status Schema
export const ParticipantStatusSchema = z.object({
  userId: z.string(),
  joinedAt: FirestoreTimestamp,
  status: z.string().refine((val) => ['active', 'completed', 'withdrawn'].includes(val), {
    message: "Status must be 'active', 'completed', or 'withdrawn'",
  }),
});

// Task with Participant Details Schema
export const TaskWithParticipantsSchema = TaskSchema.extend({
  participantDetails: z.array(ParticipantStatusSchema).optional(),
  participantNames: z.record(z.string(), z.string()).optional(),
});

// Export types
export type Task = z.infer<typeof TaskSchema>;
export type TaskFormData = z.infer<typeof TaskFormDataSchema>;
export type TaskCreationData = z.infer<typeof TaskCreationDataSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;
export type TaskWithParticipants = z.infer<typeof TaskWithParticipantsSchema>;

// Validation functions
export const validateTask = (data: unknown): Task => {
  return TaskSchema.parse(data);
};

export const validateTaskFormData = (data: unknown): TaskFormData => {
  return TaskFormDataSchema.parse(data);
};

export const validateTaskCreationData = (data: unknown): TaskCreationData => {
  return TaskCreationDataSchema.parse(data);
};

export const validateTaskUpdate = (data: unknown): TaskUpdate => {
  return TaskUpdateSchema.parse(data);
};

// Safe parsing functions (returns { success: boolean, data?: T, error?: ZodError })
export const safeParseTask = (data: unknown) => {
  return TaskSchema.safeParse(data);
};

export const safeParseTaskFormData = (data: unknown) => {
  return TaskFormDataSchema.safeParse(data);
};

export const safeParseTaskCreationData = (data: unknown) => {
  return TaskCreationDataSchema.safeParse(data);
};
