import { features } from '.';
import type { FeatureNavItem } from '../shared/types/feature';

export const featureNavigation: FeatureNavItem[] = features.flatMap(
  (feature) => feature.navigation ?? []
);
