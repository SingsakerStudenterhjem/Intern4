import { z } from 'zod';

export const ApplicationSchema = z.object({
  applicationId: z.string(),
  status: z.string().refine((value) => ['Under behandling', 'Godkjent', 'Avvist'].includes(value)),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  birthDate: z.date(),
  gender: z.string(),
  address: z.object({
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
  }),
  study: z.string(),
  studyPlace: z.string(),
  profilePicture: z.string(),
  certificate: z.string(),
  skills: z.string(),
  knowsAboutSing: z.string(),
  knowsResidents: z.string(),
  applicationText: z.string(),
  applicationDate: z.date(),
});

export type Application = z.infer<typeof ApplicationSchema>;
