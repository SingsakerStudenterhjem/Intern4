import prismaClient from '../prismaClient';
import { Task, TaskCreationData } from '../../shared/types/regi/tasks';

// Helper to convert Prisma task to application Task type
async function toAppTask(task: any): Promise<Task> {
  const participants = await prismaClient.work_assignments.findMany({
    where: { work_id: task.id },
    select: { user_uuid: true },
  });

  return {
    id: task.id.toString(),
    title: task.work_items.title,
    description: task.work_items.description ?? '',
    category: task.work_items.work_categories.name ?? '',
    deadline: task.deadline,
    // Note: The new schema does not support maxParticipants, completedAt, completedBy, isActive
    //maxParticipants: 0,
    participants: participants.map((p: { user_uuid: any }) => p.user_uuid),
    createdAt: task.created_at,
    //isActive: true, // Not supported in new schema
  };
}

export async function addTask(data: TaskCreationData): Promise<string> {
  try {
    const category = await prismaClient.work_categories.findFirst({
      where: { name: data.category },
    });
    if (!category) {
      throw new Error(`Category '${data.category}' not found.`);
    }

    const result = await prismaClient.$transaction(
      async (tx: {
        work_items: {
          create: (arg0: {
            data: {
              title: string;
              description: string | undefined;
              type: string;
              work_category_id: any;
            };
          }) => any;
        };
        work_tasks: {
          create: (arg0: {
            data: { id: any; deadline: Date | undefined; time_estimate: number | undefined };
          }) => any;
        };
      }) => {
        const workItem = await tx.work_items.create({
          data: {
            title: data.title,
            description: data.description,
            type: 'task',
            work_category_id: category.id,
          },
        });

        await tx.work_tasks.create({
          data: {
            id: workItem.id,
            deadline: data.deadline,
            time_estimate: data.hourEstimate, // Using this field for time estimate
            // contact_person_uuid is not set from TaskCreationData
          },
        });
        return workItem;
      }
    );

    return result.id.toString();
  } catch (error: any) {
    throw new Error(`Could not add task: ${error.message}`);
  }
}

export async function getTask(taskId: string): Promise<Task | undefined> {
  try {
    const task = await prismaClient.work_tasks.findUnique({
      where: { id: BigInt(taskId) },
      include: {
        work_items: {
          include: { work_categories: true },
        },
      },
    });

    return task ? await toAppTask(task) : undefined;
  } catch (error: any) {
    throw new Error(`Could not get task: ${error.message}`);
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    // Note: isActive filter is removed as it's not in the new schema
    const tasks = await prismaClient.work_tasks.findMany({
      include: {
        work_items: {
          include: { work_categories: true },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return Promise.all(tasks.map(toAppTask));
  } catch (error: any) {
    throw new Error(`Could not get tasks: ${error.message}`);
  }
}

export async function updateTask(
  taskId: string,
  data: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const { title, description, deadline, ...rest } = data;
    await prismaClient.$transaction(
      async (tx: {
        work_items: {
          update: (arg0: {
            where: { id: bigint };
            data: { title: string | undefined; description: string | undefined };
          }) => any;
        };
        work_tasks: { update: (arg0: { where: { id: bigint }; data: { deadline: Date } }) => any };
      }) => {
        if (title || description) {
          await tx.work_items.update({
            where: { id: BigInt(taskId) },
            data: { title, description },
          });
        }
        if (deadline) {
          await tx.work_tasks.update({
            where: { id: BigInt(taskId) },
            data: { deadline },
          });
        }
      }
    );
  } catch (error: any) {
    throw new Error(`Could not update task: ${error.message}`);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    // Note: soft delete (isActive=false) is not supported in the new schema.
    // This is now a hard delete.
    await hardDeleteTask(taskId);
  } catch (error: any) {
    throw new Error(`Could not delete task: ${error.message}`);
  }
}

export async function hardDeleteTask(taskId: string): Promise<void> {
  const id = BigInt(taskId);
  try {
    await prismaClient.$transaction(
      async (tx: {
        work_assignments: { deleteMany: (arg0: { where: { work_id: bigint } }) => any };
        work_tasks: { delete: (arg0: { where: { id: bigint } }) => any };
        work_items: { delete: (arg0: { where: { id: bigint } }) => any };
      }) => {
        await tx.work_assignments.deleteMany({ where: { work_id: id } });
        await tx.work_tasks.delete({ where: { id } });
        await tx.work_items.delete({ where: { id } });
      }
    );
  } catch (error: any) {
    throw new Error(`Could not permanently delete task: ${error.message}`);
  }
}

export async function joinTask(taskId: string, userId: string): Promise<boolean> {
  try {
    const existing = await prismaClient.work_assignments.findFirst({
      where: { work_id: BigInt(taskId), user_uuid: userId },
    });

    if (existing) {
      throw new Error('User already joined this task');
    }

    // Note: maxParticipants check is not possible with the new schema.
    await prismaClient.work_assignments.create({
      data: {
        work_id: BigInt(taskId),
        user_uuid: userId,
        approved_state: 0, // Default state
      },
    });

    return true;
  } catch (error: any) {
    throw new Error(`Could not join task: ${error.message}`);
  }
}

export async function leaveTask(taskId: string, userId: string): Promise<boolean> {
  try {
    await prismaClient.work_assignments.deleteMany({
      where: {
        work_id: BigInt(taskId),
        user_uuid: userId,
      },
    });
    return true;
  } catch (error: any) {
    throw new Error(`Could not leave task: ${error.message}`);
  }
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  try {
    const assignments = await prismaClient.work_assignments.findMany({
      where: { user_uuid: userId },
      include: {
        work_items: {
          include: {
            work_tasks: true,
            work_categories: true,
          },
        },
      },
    });

    const tasks = assignments
      .filter(
        (a: { work_items: { type: string; work_tasks: any } }) =>
          a.work_items.type === 'task' && a.work_items.work_tasks
      )
      .map((a: { work_items: { work_tasks: any } }) => ({
        ...a.work_items.work_tasks,
        work_items: a.work_items,
      }));

    return Promise.all(tasks.map(toAppTask));
  } catch (error: any) {
    throw new Error(`Could not get user tasks: ${error.message}`);
  }
}
