import {z} from "zod";
import {User} from "./user";

export const TaskSchema = z.object({
    taskName: z.string(),
    category: z.string(),
    description: z.string(),
    contactPerson: z.object<User>,
    deadline: z.iso.datetime(),
    hourEstimate: z.number(), // int or float
    takenBy: z.object<User>,
    completed: false,
    completedAt: z.iso.datetime(),
})

export type Task = z.infer<typeof TaskSchema>;
