import { z } from 'zod';

// Core Task Schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Tittel er påkrevd'),
  category: z.string().min(1, 'Kategori er påkrevd'),
  description: z.string().optional(),
  contactPersonId: z.string().uuid().optional(),
  deadline: z.date().optional(),
  hourEstimate: z.number().positive().optional(), // Represents time_estimate
  participants: z.array(z.string().uuid()).default([]),
  createdAt: z.date(),
  // Fields that are no longer in the new schema:
  // taskName -> title
  // contactPerson (name) -> can be fetched via contactPersonId
  // maxParticipants -> no longer supported
  // completed -> no longer supported
  // completedAt -> no longer supported
  // isApproved -> no longer supported
  // createdBy -> no longer supported
  // isActive -> no longer supported
});

// Task Form Data Schema (for forms with string inputs)
export const TaskFormDataSchema = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string().default(''),
  deadline: z.string().default(''), // datetime-local input gives string
  hourEstimate: z.string().default(''), // number input as string
});

// Task Creation Data Schema (processed form data for API)
export const TaskCreationDataSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd'),
  category: z.string().min(1, 'Kategori er påkrevd'),
  description: z.string().optional(),
  contactPersonId: z.string().uuid().optional(),
  deadline: z.date().optional(),
  hourEstimate: z.number().positive().optional(),
});

// Task Update Schema (for partial updates)
export const TaskUpdateSchema = TaskCreationDataSchema.partial().omit({
  category: true, // Usually category is not updated.
});

// Task Filter Schema
export const TaskFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

// Participant Status Schema
export const ParticipantStatusSchema = z.object({
  userId: z.string(),
  joinedAt: z.date(),
  // status is now on work_assignments (approved_state)
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
