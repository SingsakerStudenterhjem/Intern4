export const USER_ROLES = {
  DATA: 'Data Åpmand',
  REGISJEF: 'Regisjef',
  FULL_REGI: 'Full Regi',
  FULL_VAKT: 'Full Vakt',
  HALV_HALV: 'Halv/Halv',
  UTVALGSMEDLEM: 'Utvalgsmedlem',
  DAGLIG_LEDER: 'Daglig leder',
  USER: 'user', // Fallback for basic users
};

// Helper functions for role checking
export const canManageTasks = (role) => {
  return [USER_ROLES.DATA, USER_ROLES.REGISJEF].includes(role);
};

export const canManageCategories = (role) => {
  return [USER_ROLES.DATA, USER_ROLES.REGISJEF].includes(role);
};

export const canViewAllParticipants = (role) => {
  return [USER_ROLES.DATA, USER_ROLES.REGISJEF].includes(role);
};

export const canAccessAdmin = (role) => {
  return role === USER_ROLES.DATA;
};

export const canApproveWork = (role) => {
  return [USER_ROLES.DATA, USER_ROLES.REGISJEF].includes(role);
};
