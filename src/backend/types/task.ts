import {z} from "zod";
import UserSchema from "./user";

export const TaskSchema = z.object({
    taskName: z.string(),
    category: z.string(),
    description: z.string().optional(),
    contactPerson: UserSchema,
    deadline: z.iso.datetime().optional(),
    hourEstimate: z.number().optional(), // int or float
    takenBy: UserSchema,
    completed: z.boolean(),
    completedAt: z.iso.datetime().optional(),
    isApproved: z.boolean(),
})

export type Task = z.infer<typeof TaskSchema>;
