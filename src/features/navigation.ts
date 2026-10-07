import type { FeatureNavItem } from '../shared/types/feature';
import { FEATURE_ORDER, type FeatureKey } from './featureOrder';
import {
  wineCellarNavigation,
  vervNavigation,
  userNavigation,
  taskNavigation,
  shiftNavigation,
  residentNavigation,
  regiNavigation,
  receptionNavigation,
  helgaNavigation,
  alcoholNavigation,
} from '../shared/navigation';

const navigationByFeature: Partial<Record<FeatureKey, FeatureNavItem[]>> = {
  alcohol: alcoholNavigation,
  helga: helgaNavigation,
  reception: receptionNavigation,
  regi: regiNavigation,
  residents: residentNavigation,
  shifts: shiftNavigation,
  tasks: taskNavigation,
  users: userNavigation,
  verv: vervNavigation,
  'wine-cellar': wineCellarNavigation,
};

export const featureNavigation: FeatureNavItem[] = FEATURE_ORDER.flatMap(
  (featureKey) => navigationByFeature[featureKey] ?? []
);
