import { USER_ROLES, type UserRole } from '../../shared/types/roles';

const taskManagerRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER];

export const canManageTasks = (role?: string) =>
  Boolean(role && taskManagerRoles.includes(role as UserRole));

export const canManageCategories = canManageTasks;

export const canViewAllParticipants = canManageTasks;
