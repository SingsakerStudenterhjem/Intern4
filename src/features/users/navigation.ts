import type { FeatureNavItem, PermissionCheck } from '../../shared/types/feature';
import { canAccessRoomManagement } from './permissions';
import { USER_PATHS } from './paths';

const canAccessRoomManagementItem: PermissionCheck = ({ user }) =>
  canAccessRoomManagement(user?.role);

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
