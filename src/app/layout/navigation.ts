import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/userRoles';
import { regiNavigation } from '../../features/regi/navigation';
import { residentNavigation } from '../../features/residents/navigation';
import { taskNavigation } from '../../features/tasks/navigation';
import { userNavigation } from '../../features/users/navigation';
import type { FeatureNavItem } from '../../shared/types/feature';

export const appNavigation: FeatureNavItem[] = [
  ...taskNavigation,
  ...residentNavigation,
  ...regiNavigation,
  ...userNavigation,
  {
    key: 'admin',
    label: 'Admin',
    to: ROUTES.ADMIN,
    canAccess: ({ user }) => user?.role === USER_ROLES.DATA,
  },
];
