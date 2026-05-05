import type { FeatureDefinition } from '../shared/types/feature';
import { alcoholFeature } from './alcohol';
import { authFeature } from './auth';
import { helgaFeature } from './helga';
import { receptionFeature } from './reception';
import { regiFeature } from './regi';
import { residentFeature } from './residents';
import { shiftFeature } from './shifts';
import { taskFeature } from './tasks';
import { userFeature } from './users';
import { vervFeature } from './verv';
import { wineCellarFeature } from './wine-cellar';

export const features: FeatureDefinition[] = [
  authFeature,
  taskFeature,
  residentFeature,
  shiftFeature,
  regiFeature,
  vervFeature,
  alcoholFeature,
  wineCellarFeature,
  helgaFeature,
  userFeature,
  receptionFeature,
];
