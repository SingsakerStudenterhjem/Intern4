import { USER_ROLES, type UserRole } from '../../shared/types/roles';

export const regiManagerRoles: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.DATA,
  USER_ROLES.WORKMANAGER,
];

export const canApproveWork = (role?: string) =>
  Boolean(role && regiManagerRoles.includes(role as UserRole));
