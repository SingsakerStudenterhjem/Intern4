import { z } from 'zod';

const FirestoreTimestamp = z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
});

const UserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    birthDate: FirestoreTimestamp,
    address: z.object({
        street: z.string(),
        postalCode: z.string(),
        city: z.string(),
    }),
    study: z.string(),
    studyPlace: z.string(),
    profilePicture: z.string().optional(),
    seniority: z.number().int(),
    roomNumber: z.number().int(),
    role: z.string().refine(
        (value) => ['Halv/Halv', 'Full Regi', 'Full Vakt', 'Utvalgsmedlem', 'Daglig leder'].includes(value),
    ),
    onLeave: z.boolean(),
    isActive: z.boolean(),
    lastLogin: FirestoreTimestamp.optional(),
    leadershipRoles: z.array(z.string()).optional(),
    tasks: z.array(z.string()).optional(),
    createdAt: FirestoreTimestamp,
});

export type User = z.infer<typeof UserSchema>;
export type FirestoreTimestamp = z.infer<typeof FirestoreTimestamp>;