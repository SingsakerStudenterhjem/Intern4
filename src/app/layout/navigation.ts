import { APP_ROUTES } from '../constants/appRoutes';
import { USER_ROLES } from '../constants/userRoles';
import { features } from '../../features';
import type { FeatureNavItem } from '../../shared/types/feature';

export const appNavigation: FeatureNavItem[] = [
  ...features.flatMap((feature) => feature.navigation ?? []),
  {
    key: 'admin',
    label: 'Admin',
    to: APP_ROUTES.ADMIN,
    canAccess: ({ user }) => user?.role === USER_ROLES.DATA,
  },
];
