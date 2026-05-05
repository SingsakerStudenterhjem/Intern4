import { ROUTES } from '../../app/constants/routes';
import { USER_ROLES } from '../../app/constants/userRoles';
import type { FeatureNavItem, PermissionCheck } from '../../shared/types/feature';

const canAccessRegiManager: PermissionCheck = ({ user }) =>
  Boolean(
    user?.role && [USER_ROLES.ADMIN, USER_ROLES.WORKMANAGER, USER_ROLES.DATA].includes(user.role)
  );

export const regiNavigation: FeatureNavItem[] = [
  {
    key: 'regi',
    label: 'Regi',
    children: [
      {
        key: 'regi-tasks',
        label: 'Oppgaver',
        to: ROUTES.TASKS,
      },
      {
        key: 'my-regi',
        label: 'Min regi',
        to: ROUTES.REGI,
      },
      {
        key: 'regi-manager',
        label: 'Regisjef',
        to: ROUTES.REGISJEF,
        canAccess: canAccessRegiManager,
      },
      {
        key: 'regi-logs',
        label: 'Regilogger',
        to: ROUTES.REGILOGS,
        canAccess: canAccessRegiManager,
      },
    ],
  },
];
