import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/userRoles';
import { alcoholNavigation } from '../../features/alcohol/navigation';
import { helgaNavigation } from '../../features/helga/navigation';
import { regiNavigation } from '../../features/regi/navigation';
import { receptionNavigation } from '../../features/reception/navigation';
import { residentNavigation } from '../../features/residents/navigation';
import { shiftNavigation } from '../../features/shifts/navigation';
import { taskNavigation } from '../../features/tasks/navigation';
import { userNavigation } from '../../features/users/navigation';
import { vervNavigation } from '../../features/verv/navigation';
import { wineCellarNavigation } from '../../features/wine-cellar/navigation';
import type { FeatureNavItem } from '../../shared/types/feature';

export const appNavigation: FeatureNavItem[] = [
  ...taskNavigation,
  ...residentNavigation,
  ...shiftNavigation,
  ...regiNavigation,
  ...vervNavigation,
  ...alcoholNavigation,
  ...wineCellarNavigation,
  ...helgaNavigation,
  ...userNavigation,
  ...receptionNavigation,
  {
    key: 'admin',
    label: 'Admin',
    to: ROUTES.ADMIN,
    canAccess: ({ user }) => user?.role === USER_ROLES.DATA,
  },
];
