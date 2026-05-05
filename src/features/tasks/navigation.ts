import { ROUTES } from '../../app/constants/routes';
import type { FeatureNavItem } from '../../shared/types/feature';

export const taskNavigation: FeatureNavItem[] = [
  {
    key: 'dash',
    label: 'Dashboard',
    to: ROUTES.DASHBOARD,
  },
];
