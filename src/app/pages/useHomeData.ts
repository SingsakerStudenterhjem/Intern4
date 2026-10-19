import { useCallback, useEffect, useState } from 'react';
import { getPendingRegiApprovals, getRegiLogsByUser } from '../../server/dao/regiDAO';
import { getTasks } from '../../server/dao/tasksDAO';
import { getCategories } from '../../server/dao/categoriesDAO';
import { getUserNames } from '../../server/dao/userDAO';
import { canApproveWork } from '../../features/regi/permissions';
import { RegiLogWithId } from '../../shared/types/regi';
import {
  Category,
  Task,
  canUserJoinTask,
  getCurrentUserTaskParticipant,
} from '../../shared/types/regi/tasks';
import type { AuthUser } from '../../features/auth/hooks/useAuth';

const MY_TASK_ORDER = { rejected: 0, joined: 1, submitted: 2, approved: 3 } as const;

// Tasks the user still has something to do or wait for; approved ones are done.
export const getMyActiveTasks = (tasks: Task[], userId: string): Task[] =>
  tasks
    .filter((task) => {
      const participant = getCurrentUserTaskParticipant(task, userId);
      return participant && participant.status !== 'approved';
    })
    .sort(
      (a, b) =>
        MY_TASK_ORDER[getCurrentUserTaskParticipant(a, userId)!.status] -
        MY_TASK_ORDER[getCurrentUserTaskParticipant(b, userId)!.status]
    );

const deadlineTime = (task: Task) =>
  task.deadline ? new Date(task.deadline).getTime() : Number.POSITIVE_INFINITY;

export const getSuggestedTasks = (tasks: Task[], userId: string, limit = 3): Task[] =>
  tasks
    .filter((task) => canUserJoinTask(task, userId))
    .sort((a, b) => deadlineTime(a) - deadlineTime(b))
    .slice(0, limit);

type HomeData = {
  logs: RegiLogWithId[];
  tasks: Task[];
  categories: Category[];
  names: Record<string, string>;
  pendingApprovals: number | null;
};

const EMPTY: HomeData = { logs: [], tasks: [], categories: [], names: {}, pendingApprovals: null };

export const useHomeData = (user: AuthUser) => {
  const [data, setData] = useState<HomeData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;
  const isManager = canApproveWork(user?.role);

  const load = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      setError(null);
      const [logs, tasks, categories, pending] = await Promise.all([
        getRegiLogsByUser(userId),
        getTasks(),
        getCategories(),
        isManager ? getPendingRegiApprovals() : Promise.resolve(null),
      ]);

      const peopleIds = tasks.flatMap((task) => [
        ...task.participants.map((participant) => participant.userId),
        ...(task.contactPersonId ? [task.contactPersonId] : []),
      ]);
      const names = await getUserNames(peopleIds).catch(() => ({}));

      setData({ logs, tasks, categories, names, pendingApprovals: pending?.length ?? null });
    } catch (loadError) {
      console.error(loadError);
      setError('Kunne ikke laste forsiden. Prøv å oppdatere siden.');
    } finally {
      setLoading(false);
    }
  }, [userId, isManager]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...data, loading, error, reload: load };
};
