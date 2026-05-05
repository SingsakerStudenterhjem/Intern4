import { ROUTES } from '../../app/constants/routes';
import type { FeatureNavItem, PermissionCheck } from '../../shared/types/feature';
import { canAccessRoomManagement } from './permissions';

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
        to: ROUTES.LEGG_TIL_BEBOER,
        canAccess: canAccessRoomManagementItem,
      },
    ],
  },
];
