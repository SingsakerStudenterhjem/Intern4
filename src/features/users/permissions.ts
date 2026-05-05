import { isUserRole, USER_ROLES, type UserRole } from '../../shared/types/roles';

const roomManagementRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.ROOMMANAGER, USER_ROLES.DATA];

export const canAccessRoomManagement = (role?: string) =>
  isUserRole(role) && roomManagementRoles.includes(role);
