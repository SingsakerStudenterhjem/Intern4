export const USER_ROLES = {
  DATA: 'Data',
  WORKMANAGER: 'Regisjef',
  ROOMMANAGER: 'Romsjef',
  FULL_WORK: 'Full Regi',
  FULL_RECEPTION: 'Full Vakt',
  HALF_HALF: 'Halv/Halv',
  COMMITTEE_MEMBER: 'Utvalgsmedlem',
  GENERAL_MANAGER: 'Daglig leder',
  ADMIN: 'Admin',
  USER: 'user', // Fallback for basic users
};

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Helper functions for role checking
export const canManageTasks = (role?: UserRole) => {
  if (!role) return false;
  return [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};

export const canManageCategories = (role?: UserRole) => {
  if (!role) return false;
  return [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};

export const canViewAllParticipants = (role?: UserRole) => {
  if (!role) return false;
  return [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};

export const canAccessAdmin = (role?: UserRole) => {
  if (!role) return false;
  return [USER_ROLES.ADMIN, USER_ROLES.DATA].includes(role);
};

export const canApproveWork = (role?: UserRole) => {
  if (!role) return false;
  return [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};
