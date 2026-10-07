export {};

import { isUserRole, USER_ROLES, type UserRole } from './types/roles';

const roomManagementRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.ROOMMANAGER, USER_ROLES.DATA];

export const canAccessRoomManagement = (role?: string) =>
  isUserRole(role) && roomManagementRoles.includes(role);

const taskManagerRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER];

export const canManageTasks = (role?: string) =>
  isUserRole(role) && taskManagerRoles.includes(role);

export const canManageCategories = canManageTasks;

export const canViewAllParticipants = canManageTasks;

export const regiManagerRoles: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.DATA,
  USER_ROLES.WORKMANAGER,
];

export const canApproveWork = (role?: string) =>
  isUserRole(role) && regiManagerRoles.includes(role);
