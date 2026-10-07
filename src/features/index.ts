import type { FeatureDefinition } from '../shared/types/feature';
import {
  wineCellarFeature,
  vervFeature,
  shiftFeature,
  userFeature,
  taskFeature,
  residentFeature,
  regiFeature,
  receptionFeature,
  helgaFeature,
  authFeature,
  alcoholFeature,
} from '../shared';
import { FEATURE_ORDER, type FeatureKey } from './featureOrder';

const featuresByKey: Record<FeatureKey, FeatureDefinition> = {
  alcohol: alcoholFeature,
  auth: authFeature,
  helga: helgaFeature,
  reception: receptionFeature,
  regi: regiFeature,
  residents: residentFeature,
  shifts: shiftFeature,
  tasks: taskFeature,
  users: userFeature,
  verv: vervFeature,
  'wine-cellar': wineCellarFeature,
};

export const features: FeatureDefinition[] = FEATURE_ORDER.map((key) => featuresByKey[key]);
