import { isUserRole, USER_ROLES, type UserRole } from '../../shared/types/roles';

const taskManagerRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER];

export const canManageTasks = (role?: string) =>
  isUserRole(role) && taskManagerRoles.includes(role);

export const canManageCategories = canManageTasks;

export const canViewAllParticipants = canManageTasks;
