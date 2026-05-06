import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '../../../server/dao/categoriesDAO';
import { getTasks } from '../../../server/dao/tasksDAO';
import { getActiveUsersWithRole, getUser } from '../../../server/dao/userDAO';
import { Category, Task } from '../../../shared/types/regi/tasks';
import { ParticipantNames, TaskContactPersonOption } from '../components/types';

export const useTaskManagementData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [participantNames, setParticipantNames] = useState<ParticipantNames>({});
  const [contactPeople, setContactPeople] = useState<TaskContactPersonOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadParticipantNames = useCallback(async (tasksData: Task[]): Promise<void> => {
    const allParticipantIds = new Set<string>();
    tasksData.forEach((task) => {
      task.participants.forEach((participant) => allParticipantIds.add(participant.userId));
      if (task.contactPersonId) {
        allParticipantIds.add(task.contactPersonId);
      }
    });

    const namePromises = Array.from(allParticipantIds).map(async (userId) => {
      try {
        const userData = await getUser(userId);
        return { userId, name: userData?.name || 'Ukjent bruker' };
      } catch {
        return { userId, name: 'Ukjent bruker' };
      }
    });

    const names = await Promise.all(namePromises);
    const nameMap = names.reduce((acc, { userId, name }) => {
      acc[userId] = name;
      return acc;
    }, {} as ParticipantNames);

    setParticipantNames(nameMap);
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [tasksData, categoriesData, activeUsers] = await Promise.all([
        getTasks(),
        getCategories(),
        getActiveUsersWithRole(),
      ]);

      setTasks(tasksData);
      setCategories(categoriesData);
      setContactPeople(
        activeUsers.map((activeUser) => ({
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
        }))
      );

      if (tasksData.length > 0) {
        await loadParticipantNames(tasksData);
      } else {
        setParticipantNames({});
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Kunne ikke laste data. Prøv å oppdatere siden.');
    } finally {
      setLoading(false);
    }
  }, [loadParticipantNames]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    tasks,
    categories,
    participantNames,
    contactPeople,
    loading,
    error,
    clearError: () => setError(null),
    loadData,
  };
};
