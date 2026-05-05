import type { FeatureNavItem } from '../../shared/types/feature';
import { RESIDENT_PATHS } from './paths';

export const residentNavigation: FeatureNavItem[] = [
  {
    key: 'beboere',
    label: 'Beboere',
    to: RESIDENT_PATHS.BEBOERE,
  },
];
