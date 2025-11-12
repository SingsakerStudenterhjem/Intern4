import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  birthDate: z.date(),
  address: z.object({
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string().optional(),
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
        'Utvalgsmedlem',
        'Data Åpmand',
        'Daglig leder',
      ].includes(value)
    ),
  onLeave: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
