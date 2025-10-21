import React, { useEffect, useState } from 'react';
import { Plus, Search, Settings } from 'lucide-react';
import TasksTable from '../../components/regi/Tasks/TasksTable';
import TaskModal from '../../components/regi/Tasks/TaskModal';
import TaskCreationModal from '../../components/regi/Tasks/TaskCreationModal';
import CategoryManagement from '../../components/admin/CategoryManagement';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import {
  addTask,
  deleteTask,
  getTasks,
  joinTask,
  leaveTask,
  updateTask,
} from '../../backend/src/tasksDAO';
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryUsageCount,
  updateCategory,
} from '../../backend/src/categoriesDAO';
import { getUser } from '../../backend/src/userDAO';
import {
  Category,
  CategoryCreationData,
  ParticipantNames,
  Task,
  TaskCreationData,
} from '../../backend/types/regi/tasks';
import { Timestamp } from 'firebase/firestore';
import { canManageCategories, canManageTasks } from '../../constants/userRoles';

interface LocalUser {
  uid: string;
  name: string;
  email: string;
  role: string;
}

const TasksPage: React.FC = () => {
  const authData = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [participantNames, setParticipantNames] = useState<ParticipantNames>({});

  const user = authData?.user as LocalUser | null;
  const authLoading = authData?.loading || false;

  const {
    query,
    setQuery,
    filter,
    setFilter,
    category,
    setCategory,
    currentPage,
    paginatedTasks,
    totalPages,
    nextPage,
    prevPage,
    categories: availableCategories,
    filteredTasks,
  } = useTasks(tasks, categories, user?.uid || '', 10);

  const canCreateTasksCheck = canManageTasks(user?.role);
  const canManageCategoriesCheck = canManageCategories(user?.role);
  const canDeleteTasksCheck = canManageTasks(user?.role);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [tasksData, categoriesData] = await Promise.all([getTasks(), getCategories()]);

      setTasks(tasksData);
      setCategories(categoriesData);

      if (tasksData.length > 0) {
        await loadParticipantNames(tasksData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Kunne ikke laste data. Prøv å oppdatere siden.');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipantNames = async (tasksData: Task[]): Promise<void> => {
    const allParticipantIds = new Set<string>();
    tasksData.forEach((task) => {
      task.participants.forEach((id) => allParticipantIds.add(id));
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
  };

  const handleCreateTask = async (taskData: TaskCreationData): Promise<void> => {
    try {
      await addTask(taskData);
      await loadData();
      showSuccessMessage('Oppgave opprettet!');
    } catch (err) {
      console.error('Error creating task:', err);
      showErrorMessage('Kunne ikke opprette oppgave');
    }
  };

  const handleJoinTask = async (taskId: string): Promise<void> => {
    if (!user?.uid) return;

    try {
      await joinTask(taskId, user.uid);
      await loadData();
      showSuccessMessage('Du er nå påmeldt oppgaven!');
    } catch (err) {
      console.error('Error joining task:', err);
      showErrorMessage('Kunne ikke melde deg på oppgaven');
    }
  };

  const handleLeaveTask = async (taskId: string): Promise<void> => {
    if (!user?.uid) return;

    try {
      await leaveTask(taskId, user.uid);
      await loadData();
      showSuccessMessage('Du er nå avmeldt oppgaven');
    } catch (err) {
      console.error('Error leaving task:', err);
      showErrorMessage('Kunne ikke melde deg av oppgaven');
    }
  };

  const handleCompleteTask = async (taskId: string): Promise<void> => {
    try {
      await updateTask(taskId, {
        completed: true,
        completedAt: Timestamp.now(),
      });
      await loadData();
      showSuccessMessage('Oppgave markert som fullført!');
    } catch (err) {
      console.error('Error completing task:', err);
      showErrorMessage('Kunne ikke markere oppgave som fullført');
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    if (!canDeleteTasksCheck) {
      showErrorMessage('Du har ikke tillatelse til å slette oppgaver');
      return;
    }

    try {
      await deleteTask(taskId);
      await loadData();
      showSuccessMessage('Oppgave slettet!');
    } catch (err) {
      console.error('Error deleting task:', err);
      showErrorMessage('Kunne ikke slette oppgave');
    }
  };

  const handleAddCategory = async (categoryData: CategoryCreationData): Promise<void> => {
    try {
      await addCategory({
        ...categoryData,
        createdBy: user?.uid || '',
      });
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

  const showSuccessMessage = (message: string): void => {
    // TODO: Implement toast notification system
    console.log('Success:', message);
  };

  const showErrorMessage = (message: string): void => {
    console.error('Error:', message);
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Oppgaver</h1>
              <p className="text-gray-600 mt-1">
                Se tilgjengelige oppgaver og meld deg på dem du ønsker å utføre.
              </p>
            </div>
            <div className="flex space-x-3">
              {canManageCategoriesCheck && (
                <button
                  onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administrer kategorier
                </button>
              )}
              {canCreateTasksCheck && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ny oppgave
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Category Management */}
        {showCategoryManagement && canManageCategoriesCheck && (
          <div className="mb-8">
            <CategoryManagement
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              getCategoryUsage={getCategoryUsageCount}
            />
          </div>
        )}

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Søk etter oppgaver..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Alle kategorier</option>
                {availableCategories
                  .filter((c) => c !== 'all')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>

              {/* Status Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="available"
                    name="filter"
                    value="available"
                    checked={filter === 'available'}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                    Ledige
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="myTasks"
                    name="filter"
                    value="myTasks"
                    checked={filter === 'myTasks'}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="myTasks" className="ml-2 text-sm text-gray-700">
                    Mine
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all"
                    name="filter"
                    value="all"
                    checked={filter === 'all'}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="all" className="ml-2 text-sm text-gray-700">
                    Alle
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="p-6">
            <TasksTable
              tasks={paginatedTasks}
              onRowClick={setSelectedTask}
              onJoinTask={handleJoinTask}
              currentUserId={user?.uid}
              userRole={user?.role}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Viser {paginatedTasks.length} av {filteredTasks.length} oppgaver
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forrige
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Side {currentPage} av {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Neste
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUserId={user?.uid}
          userRole={user?.role}
          onJoinTask={handleJoinTask}
          onLeaveTask={handleLeaveTask}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={canDeleteTasksCheck ? handleDeleteTask : undefined}
          participantNames={participantNames}
        />
      )}

      {isCreateModalOpen && (
        <TaskCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTask={handleCreateTask}
          categories={categories}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default TasksPage;
