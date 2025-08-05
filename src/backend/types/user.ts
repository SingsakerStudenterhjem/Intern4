import {z} from 'zod';

const FirestoreTimestamp = z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
});

const UserSchema = z.object({
    navn: z.string(),
    email: z.email(),
    telefon: z.string(),
    fødselsdato: FirestoreTimestamp,
    adresse: z.object({
        gate: z.string(),
        postnummer: z.string(),
        by: z.string(),
    }),
    studie: z.string(),
    studiested: z.string(),
    profilBilde: z.string().optional(),
    ansiennitet: z.number().int(),
    romNummer: z.number().int(),
    rolle: z.string(),
    påpermisjon: z.boolean(),
    åpmandsVerv: z.array(z.string()).optional(),
    regioppgaver: z.array(z.string()).optional(),
    createdAt: FirestoreTimestamp,
});

export type User = z.infer<typeof UserSchema>;
export type FirestoreTimestamp = z.infer<typeof FirestoreTimestamp>;