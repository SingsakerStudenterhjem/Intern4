import { z } from 'zod';

const FirestoreTimestamp = z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
});

const SøknadSchema = z.object({
    søknadId: z.string(),
    status: z.enum(['Under behandling', 'Godkjent', 'Avvist']),
    navn: z.string(),
    email: z.string(),
    telefon: z.string(),
    fødselsDato: FirestoreTimestamp,
    kjønn: z.string(),
    adresse: z.object({
        gate: z.string(),
        postnummer: z.string(),
        poststed: z.string(),
    }),
    studie: z.string(),
    studiested: z.string(),
    profilbilde: z.string(),
    fagbrev: z.string(),
    kompetanse: z.string(),
    kjennerTilSing: z.string(),
    kjennerBeboere: z.string(),
    søknadstekst: z.string(),
    søknadsDato: FirestoreTimestamp,
});

export type Søknad = z.infer<typeof SøknadSchema>;
export type FirestoreTimestamp = z.infer<typeof FirestoreTimestamp>;