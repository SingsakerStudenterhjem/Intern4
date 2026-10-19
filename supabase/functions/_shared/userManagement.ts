// Role rules for the create-user and delete-user functions.
// Keep USER_MANAGER_ROLES in sync with roomManagementRoles in src/features/users/permissions.ts.

export const USER_MANAGER_ROLES = ['Admin', 'Data', 'Romsjef'];

// Roles that grant management access; only Admin and Data may hand these out or remove them.
const PRIVILEGED_ROLES = ['Admin', 'Data', 'Regisjef', 'Romsjef', 'Daglig leder'];

export const canManageUsers = (callerRole?: string): callerRole is string =>
  Boolean(callerRole && USER_MANAGER_ROLES.includes(callerRole));

// Whether the caller may create or deactivate a user holding targetRole.
export const canManageRole = (callerRole: string, targetRole: string): boolean => {
  if (callerRole === 'Admin') return true;
  if (targetRole === 'Admin') return false;
  if (callerRole === 'Data') return true;
  return !PRIVILEGED_ROLES.includes(targetRole);
};
