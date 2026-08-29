import { USER_ROLES } from './userRoles';

export const DEFAULT_REGI_HOURS = 36;

const ROLE_REGI_REQUIREMENTS: Record<string, number> = {
  [USER_ROLES.FULL_WORK]: 36,
  [USER_ROLES.HALF_HALF]: 18,
  [USER_ROLES.FULL_RECEPTION]: 0,
  [USER_ROLES.WORKMANAGER]: 36,
  [USER_ROLES.DATA]: 36,
  [USER_ROLES.GENERAL_MANAGER]: 0,
  [USER_ROLES.ADMIN]: 0,
  [USER_ROLES.ROOMMANAGER]: 36,
  [USER_ROLES.COMMITTEE_MEMBER]: 18,
};

export const getRequiredRegiHoursForRole = (role?: string): number => {
  if (!role) return DEFAULT_REGI_HOURS;
  return ROLE_REGI_REQUIREMENTS[role] ?? DEFAULT_REGI_HOURS;
};

// A user's assigned regi category (set by a Regisjef) overrides the
// role-based requirement above. Users without a category keep falling
// back to the role table, so existing users are unaffected until a
// Regisjef assigns them one.
export const getRequiredRegiHours = (user?: {
  role?: string;
  regiCategoryHours?: number | null;
}): number => {
  if (user?.regiCategoryHours != null) return user.regiCategoryHours;
  return getRequiredRegiHoursForRole(user?.role);
};
