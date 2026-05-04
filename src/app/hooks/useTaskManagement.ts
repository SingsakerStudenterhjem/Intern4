import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import {
  addTask,
  deleteTask,
  getTasks,
  joinTask,
  leaveTask,
  submitTaskCompletion,
  updateTask,
} from '../../server/dao/tasksDAO';
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryUsageCount,
  updateCategory,
} from '../../server/dao/categoriesDAO';
import { getActiveUsersWithRole, getUser } from '../../server/dao/userDAO';
import {
  Category,
  CategoryCreationData,
  Task,
  TaskCreationData,
} from '../../shared/types/regi/tasks';
import { ParticipantNames, TaskContactPersonOption } from '../components/regi/Tasks/types';
import { canManageCategories, canManageTasks } from '../constants/userRoles';
import { useTasks } from './useTasks';

type StatusMessage = { type: 'success' | 'error'; text: string };

export const useTaskManagement = () => {
  const authData = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCategoryManagement, setShowCategoryManagement] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [participantNames, setParticipantNames] = useState<ParticipantNames>({});
  const [contactPeople, setContactPeople] = useState<TaskContactPersonOption[]>([]);

  const user = authData?.user ?? null;
  const authLoading = authData?.loading || false;

  const taskList = useTasks(tasks, categories, user?.id || '', participantNames, 10);

  const canCreateTasks = canManageTasks(user?.role);
  const canManageTaskCategories = canManageCategories(user?.role);
  const canDeleteTasks = canManageTasks(user?.role);

  const showSuccessMessage = useCallback((nextMessage: string): void => {
    setError(null);
    setMessage({ type: 'success', text: nextMessage });
  }, []);

  const showErrorMessage = useCallback((nextMessage: string): void => {
    console.error('Error:', nextMessage);
    setMessage({ type: 'error', text: nextMessage });
  }, []);

  useEffect(() => {
    if (!message) return undefined;

    const timeout = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

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

  const handleCreateTask = async (taskData: TaskCreationData): Promise<void> => {
    try {
      await addTask(taskData);
      await loadData();
      setIsCreateModalOpen(false);
      showSuccessMessage('Oppgave opprettet!');
    } catch (err) {
      console.error('Error creating task:', err);
      const message = err instanceof Error ? err.message : 'Kunne ikke opprette oppgave';
      showErrorMessage(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: TaskCreationData): Promise<void> => {
    try {
      await updateTask(taskId, taskData);
      await loadData();
      setEditingTask(null);
      setSelectedTask(null);
      showSuccessMessage('Oppgave oppdatert!');
    } catch (err) {
      console.error('Error updating task:', err);
      const message = err instanceof Error ? err.message : 'Kunne ikke oppdatere oppgave';
      showErrorMessage(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const handleJoinTask = async (taskId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await joinTask(taskId, user.id);
      await loadData();
      setSelectedTask(null);
      showSuccessMessage('Du er nå påmeldt oppgaven!');
    } catch (err) {
      console.error('Error joining task:', err);
      showErrorMessage(err instanceof Error ? err.message : 'Kunne ikke melde deg på oppgaven');
    }
  };

  const handleLeaveTask = async (taskId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await leaveTask(taskId, user.id);
      await loadData();
      setSelectedTask(null);
      showSuccessMessage('Du er nå avmeldt oppgaven');
    } catch (err) {
      console.error('Error leaving task:', err);
      showErrorMessage(err instanceof Error ? err.message : 'Kunne ikke melde deg av oppgaven');
    }
  };

  const handleCompleteTask = async (taskId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await submitTaskCompletion(taskId, user.id);
      await loadData();
      setSelectedTask(null);
      showSuccessMessage('Oppgaven er sendt inn til godkjenning!');
    } catch (err) {
      console.error('Error completing task:', err);
      showErrorMessage(err instanceof Error ? err.message : 'Kunne ikke sende inn oppgaven');
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    if (!canDeleteTasks) {
      showErrorMessage('Du har ikke tillatelse til å slette oppgaver');
      return;
    }

    try {
      await deleteTask(taskId);
      await loadData();
      setSelectedTask(null);
      showSuccessMessage('Oppgave slettet!');
    } catch (err) {
      console.error('Error deleting task:', err);
      showErrorMessage(err instanceof Error ? err.message : 'Kunne ikke slette oppgave');
    }
  };

  const handleOpenCreateTask = (): void => {
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditTask = (task: Task): void => {
    setSelectedTask(null);
    setIsCreateModalOpen(false);
    setEditingTask(task);
  };

  const handleCloseTaskEditor = (): void => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleAddCategory = async (categoryData: CategoryCreationData): Promise<void> => {
    try {
      await addCategory(categoryData);
      await loadData();
      showSuccessMessage('Kategori opprettet!');
    } catch (err) {
      console.error('Error adding category:', err);
      showErrorMessage('Kunne ikke opprette kategori');
    }
  };

  const handleUpdateCategory = async (
    categoryId: string,
    categoryData: Partial<Category>
  ): Promise<void> => {
    try {
      await updateCategory(categoryId, categoryData);
      await loadData();
      showSuccessMessage('Kategori oppdatert!');
    } catch (err) {
      console.error('Error updating category:', err);
      showErrorMessage('Kunne ikke oppdatere kategori');
    }
  };

  const handleDeleteCategory = async (categoryId: string): Promise<void> => {
    try {
      await deleteCategory(categoryId);
      await loadData();
      showSuccessMessage('Kategori slettet!');
    } catch (err) {
      console.error('Error deleting category:', err);
      showErrorMessage('Kunne ikke slette kategori');
    }
  };

  const toggleCategoryManagement = (): void => {
    setShowCategoryManagement((current) => !current);
  };

  return {
    user,
    authLoading,
    loading,
    error,
    message,
    categories,
    selectedTask,
    setSelectedTask,
    isCreateModalOpen,
    editingTask,
    showCategoryManagement,
    participantNames,
    contactPeople,
    canCreateTasks,
    canManageTaskCategories,
    canDeleteTasks,
    getCategoryUsageCount,
    taskList,
    handleCreateTask,
    handleUpdateTask,
    handleJoinTask,
    handleLeaveTask,
    handleCompleteTask,
    handleDeleteTask,
    handleOpenCreateTask,
    handleOpenEditTask,
    handleCloseTaskEditor,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    toggleCategoryManagement,
  };
};
