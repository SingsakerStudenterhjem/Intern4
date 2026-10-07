import type { FeatureNavItem, PermissionCheck } from './types/feature';
import { REGI_PATHS, RESIDENT_PATHS, TASK_PATHS, USER_PATHS } from './paths';
import { canAccessRoomManagement, canApproveWork } from './permissions';

export const wineCellarNavigation: FeatureNavItem[] = [];
export const vervNavigation: FeatureNavItem[] = [];
export const shiftNavigation: FeatureNavItem[] = [];
export const receptionNavigation: FeatureNavItem[] = [];
export const helgaNavigation: FeatureNavItem[] = [];
export const alcoholNavigation: FeatureNavItem[] = [];

const canAccessRoomManagementItem: PermissionCheck = ({ user }) =>
  canAccessRoomManagement(user?.role);

const canAccessRegiManager: PermissionCheck = ({ user }) => canApproveWork(user?.role);

export const userNavigation: FeatureNavItem[] = [
  {
    key: 'rom',
    label: 'Rom',
    canAccess: canAccessRoomManagementItem,
    children: [
      {
        key: 'manage-users',
        label: 'Administrer brukere',
        to: USER_PATHS.LEGG_TIL_BEBOER,
        canAccess: canAccessRoomManagementItem,
      },
    ],
  },
];

export const taskNavigation: FeatureNavItem[] = [
  {
    key: 'dash',
    label: 'Dashboard',
    to: TASK_PATHS.DASHBOARD,
  },
];

export const residentNavigation: FeatureNavItem[] = [
  {
    key: 'beboere',
    label: 'Beboere',
    to: RESIDENT_PATHS.BEBOERE,
  },
];

export const regiNavigation: FeatureNavItem[] = [
  {
    key: 'regi',
    label: 'Regi',
    children: [
      {
        key: 'regi-tasks',
        label: 'Oppgaver',
        to: TASK_PATHS.TASKS,
      },
      {
        key: 'my-regi',
        label: 'Min regi',
        to: REGI_PATHS.REGI,
      },
      {
        key: 'regi-manager',
        label: 'Regisjef',
        to: REGI_PATHS.REGISJEF,
        canAccess: canAccessRegiManager,
      },
      {
        key: 'regi-logs',
        label: 'Regilogger',
        to: REGI_PATHS.REGILOGS,
        canAccess: canAccessRegiManager,
      },
    ],
  },
];
