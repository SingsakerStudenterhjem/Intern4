export const USER_ROLES = {
  DATA: "data",
  REGISJEF: "regisjef",
  USER: "user",
};

export const PERMISSIONS = {
  [USER_ROLES.DATA]: [
    "read_all",
    "write_all",
    "manage_users",
    "manage_system_settings",
    "view_audit_logs",
  ],
  [USER_ROLES.REGISJEF]: [
    "read_work_entries",
    "write_work_entries",
    "approve_work_entries",
    "read_tasks",
    "write_tasks",
    "manage_tasks",
    "read_users",
  ],
  [USER_ROLES.USER]: [
    "read_own_work_entries",
    "write_own_work_entries",
    "read_tasks",
    "reserve_tasks",
  ],
};

export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.includes(permission) || false;
};
