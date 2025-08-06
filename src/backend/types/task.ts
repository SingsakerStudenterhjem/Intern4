import {z} from "zod";
import {User} from "./user";

export const TaskSchema = z.object({
    taskName: z.string(),
    category: z.string(),
    description: z.string().optional(),
    contactPerson: z.object<User>(),
    deadline: z.iso.datetime().optional(),
    hourEstimate: z.number().optional(), // int or float
    takenBy: z.object<User>().optional(),
    completed: z.boolean(),
    completedAt: z.iso.datetime().optional(),
})

export type Task = z.infer<typeof TaskSchema>;
