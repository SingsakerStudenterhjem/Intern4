export * from './task.types';
export * from './category.types';
export * from './component.types';

export {
  TaskSchema,
  TaskFormDataSchema,
  TaskCreationDataSchema,
  validateTask,
  validateTaskFormData,
  safeParseTask,
  safeParseTaskFormData,
} from './task.types';

export {
  CategorySchema,
  CategoryFormDataSchema,
  CategoryCreationDataSchema,
  validateCategory,
  validateCategoryFormData,
  safeParsCategory,
  safeParseCategoryFormData,
  isValidHexColor,
  validateCategoryName,
} from './category.types';

export type {
  AuthUser,
  FormErrors,
  ParticipantNames,
  TaskContactPersonOption,
  TasksTableProps,
  TaskModalProps,
  TaskCreationModalProps,
  CategoryManagementProps,
  TaskFilterState,
  PaginationState,
  LoadingState,
  ModalState,
} from './component.types';

export { isAuthUser } from './component.types';
export {
  canUserJoinTask,
  canUserLeaveTask,
  canUserSubmitTaskCompletion,
  getCurrentUserTaskParticipant,
  getTaskParticipantCount,
  isTaskFull,
} from './task.utils';
