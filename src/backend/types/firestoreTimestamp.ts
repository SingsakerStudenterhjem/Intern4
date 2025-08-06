import { z } from 'zod';

export const FirestoreTimestamp = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
});

export type FirestoreTimestamp = z.infer<typeof FirestoreTimestamp>;
