import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  birthDate: z.date().optional(),
  address: z.object({
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string().optional(),
  }),
  schoolId: z.string().optional(),
  studyId: z.string().optional(),
  study: z.string(),
  studyPlace: z.string(),
  profilePicture: z.string().optional(),
  seniority: z.number().int(),
  roomNumber: z.number().int(),
  role: z.string(),
  onLeave: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const NewUserInputSchema = UserSchema.omit({ createdAt: true }).extend({
  phone: UserSchema.shape.phone.optional(),
  birthDate: UserSchema.shape.birthDate.optional(),
  address: UserSchema.shape.address.partial(),
  schoolId: UserSchema.shape.schoolId.optional(),
  studyId: UserSchema.shape.studyId.optional(),
  study: UserSchema.shape.study.optional(),
  studyPlace: UserSchema.shape.studyPlace.optional(),
  profilePicture: UserSchema.shape.profilePicture.optional(),
  seniority: UserSchema.shape.seniority.default(0),
  roomNumber: UserSchema.shape.roomNumber.default(0),
  onLeave: UserSchema.shape.onLeave.default(false),
  isActive: UserSchema.shape.isActive.default(true),
});

export type NewUserInput = z.infer<typeof NewUserInputSchema>;
