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
  USER: 'user',
};

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
