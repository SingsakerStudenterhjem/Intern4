import { z } from 'zod';
import { FirestoreTimestamp } from './firestoreTimestamp';

const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  birthDate: FirestoreTimestamp,
  address: z.object({
    street: z.string(),
    postalCode: z.number(),
    city: z.string(),
  }),
  study: z.string(),
  studyPlace: z.string(),
  profilePicture: z.string().optional(),
  seniority: z.number().int(),
  roomNumber: z.number().int(),
  role: z
    .string()
    .refine((value) =>
      [
        'Halv/Halv',
        'Full Regi',
        'Full Vakt',
        'Data Åpmand',
        'Utvalgsmedlem',
        'Daglig leder',
      ].includes(value)
    ),
  onLeave: z.boolean(),
  isActive: z.boolean(),
  lastLogin: FirestoreTimestamp.optional(),
  volunteerPositions: z.array(z.string()),
  createdAt: FirestoreTimestamp,
});

export type User = z.infer<typeof UserSchema>;
