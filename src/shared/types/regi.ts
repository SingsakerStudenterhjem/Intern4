import { z } from 'zod';

export const WorkTypeSchema = z.string().min(1, 'Arbeidets art er påkrevd');
export type WorkType = z.infer<typeof WorkTypeSchema>;

export const WorkStatusSchema = z
  .string()
  .refine((value) => ['pending', 'approved', 'rejected'].includes(value));
export type WorkStatus = z.infer<typeof WorkStatusSchema>;

export const RegiLogSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.date(),
  hours: z.number().positive(),
  type: WorkTypeSchema,
  status: WorkStatusSchema.default('pending'),
  createdAt: z.date(),
  reviewedBy: z.string().optional(),
  reviewerComment: z.string().optional(),
});
export type RegiLog = z.infer<typeof RegiLogSchema>;

// Helper for database reads that add the document id
export type RegiLogWithId = RegiLog & { id: string };

export const RegiPenaltySchema = z.object({
  userId: z.string(),
  hours: z.number().positive(),
  reason: z.string().min(1, 'Årsak er påkrevd'),
  assignedByUuid: z.string(),
  createdAt: z.date(),
});
export type RegiPenalty = z.infer<typeof RegiPenaltySchema>;
export type RegiPenaltyWithId = RegiPenalty & { id: string };

export const RegiTransferStatusSchema = z
  .string()
  .refine((value) => ['pending', 'approved', 'rejected'].includes(value));
export type RegiTransferStatus = z.infer<typeof RegiTransferStatusSchema>;

export const RegiTransferSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  hours: z.number().positive(),
  status: RegiTransferStatusSchema.default('pending'),
  createdAt: z.date(),
});
export type RegiTransfer = z.infer<typeof RegiTransferSchema>;
export type RegiTransferWithId = RegiTransfer & { id: string };
