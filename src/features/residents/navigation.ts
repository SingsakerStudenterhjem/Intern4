import { ROUTES } from '../../app/constants/routes';
import type { FeatureNavItem } from '../../shared/types/feature';

export const residentNavigation: FeatureNavItem[] = [
  {
    key: 'beboere',
    label: 'Beboere',
    to: ROUTES.BEBOERE,
  },
];
