import type { FeatureNavItem } from '../../shared/types/feature';
import { TASK_PATHS } from './paths';

export const taskNavigation: FeatureNavItem[] = [
  {
    key: 'dash',
    label: 'Dashboard',
    to: TASK_PATHS.DASHBOARD,
  },
];
