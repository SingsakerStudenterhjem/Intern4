import { Category, Task, TaskCreationData } from '../../../shared/types/regi/tasks';

export type FormErrors = Record<string, string>;

export type ParticipantNames = Record<string, string>;

export type TaskContactPersonOption = {
  id: string;
  name: string;
  email?: string;
};

export type TaskEditorUser = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
};

export type TasksTableProps = {
  tasks: Task[];
  onRowClick?: (task: Task) => void;
  onJoinTask?: (taskId: string) => void;
  currentUserId?: string;
  participantNames?: ParticipantNames;
};

export type TaskModalProps = {
  task: Task | null;
  onClose: () => void;
  currentUserId?: string;
  userRole?: string;
  onJoinTask?: (taskId: string) => void;
  onLeaveTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string, image_paths: string[] | undefined) => void;
  participantNames?: ParticipantNames;
};

export type TaskCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: TaskCreationData, files: File[]) => Promise<void>;
  onUpdateTask?: (taskId: string, taskData: TaskCreationData) => Promise<void>;
  categories: Category[];
  currentUser: TaskEditorUser | null;
  editingTask?: Task | null;
  contactPeople?: TaskContactPersonOption[];
};
