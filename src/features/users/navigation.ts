import { ROUTES } from '../../app/constants/routes';
import { USER_ROLES } from '../../app/constants/userRoles';
import type { FeatureNavItem, PermissionCheck } from '../../shared/types/feature';

const canAccessRoomManagement: PermissionCheck = ({ user }) =>
  Boolean(
    user?.role && [USER_ROLES.ADMIN, USER_ROLES.ROOMMANAGER, USER_ROLES.DATA].includes(user.role)
  );

export const userNavigation: FeatureNavItem[] = [
  {
    key: 'rom',
    label: 'Rom',
    canAccess: canAccessRoomManagement,
    children: [
      {
        key: 'manage-users',
        label: 'Administrer brukere',
        to: ROUTES.LEGG_TIL_BEBOER,
        canAccess: canAccessRoomManagement,
      },
    ],
  },
];
