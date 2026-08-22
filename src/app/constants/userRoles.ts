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

// Helper functions for role checking
export const canManageTasks = (role: string | undefined) => {
  return !!role && [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};

export const canManageCategories = (role: string | undefined) => {
  return !!role && [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};

export const canViewAllParticipants = (role: string | undefined) => {
  return !!role && [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};

export const canAccessAdmin = (role: string | undefined) => {
  return !!role && [USER_ROLES.ADMIN, USER_ROLES.DATA].includes(role);
};

export const canApproveWork = (role: string | undefined) => {
  return !!role && [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER].includes(role);
};
