// Export all types from regi/tasks module
export * from './task.types';
export * from './category.types';
export * from './component.types';

// Re-export commonly used schemas for convenience
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

// Re-export the simplified TypeScript interfaces (no Zod schemas for components)
export type {
  AuthUser,
  FormErrors,
  ParticipantNames,
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
