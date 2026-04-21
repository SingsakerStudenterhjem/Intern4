import { Task, TaskCreationData } from './task.types';
import { Category, CategoryCreationData } from './category.types';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ParticipantNames {
  [userId: string]: string;
}

export interface TaskContactPersonOption {
  id: string;
  name: string;
  email?: string;
}

// Task Component Props
export interface TasksTableProps {
  tasks: Task[];
  onRowClick?: (task: Task) => void;
  onJoinTask?: (taskId: string) => void;
  currentUserId?: string;
  participantNames?: ParticipantNames;
}

export interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  currentUserId?: string;
  userRole?: string;
  onJoinTask?: (taskId: string) => void;
  onLeaveTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  participantNames?: ParticipantNames;
}

export interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: TaskCreationData) => Promise<void>;
  onUpdateTask?: (taskId: string, taskData: TaskCreationData) => Promise<void>;
  categories: Category[];
  currentUser: AuthUser | null;
  editingTask?: Task | null;
  contactPeople?: TaskContactPersonOption[];
}

export interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (categoryData: CategoryCreationData) => Promise<void>;
  onUpdateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  getCategoryUsage: (categoryName: string) => Promise<number>;
}

export interface TaskFilterState {
  query: string;
  filter: 'all' | 'available' | 'myTasks';
  category: string;
  currentPage: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

export const isAuthUser = (user: unknown): user is AuthUser => {
  const userObj = user as any;

  return (
    typeof user === 'object' &&
    user !== null &&
    typeof userObj.id === 'string' &&
    (typeof userObj.name === 'string' || typeof userObj.name === 'undefined') &&
    (typeof userObj.role === 'string' || typeof userObj.role === 'undefined') &&
    (typeof userObj.email === 'string' || typeof userObj.email === 'undefined')
  );
};
