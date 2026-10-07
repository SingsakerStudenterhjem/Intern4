import type { FeatureDefinition } from './types/feature';
import {
  wineCellarNavigation,
  vervNavigation,
  shiftNavigation,
  userNavigation,
  taskNavigation,
  residentNavigation,
  regiNavigation,
  receptionNavigation,
  helgaNavigation,
  alcoholNavigation,
  regiBossNavigation,
} from './navigation';
import {
  alcoholRoutes,
  authRoutes,
  helgaRoutes,
  receptionRoutes,
  regiBossRoutes,
  regiRoutes,
  residentRoutes,
  shiftRoutes,
  taskRoutes,
  userRoutes,
  vervRoutes,
  wineCellarRoutes,
} from './routes';

export const wineCellarFeature: FeatureDefinition = {
  key: 'wine-cellar',
  routes: wineCellarRoutes,
  navigation: wineCellarNavigation,
};

export const vervFeature: FeatureDefinition = {
  key: 'verv',
  routes: vervRoutes,
  navigation: vervNavigation,
};

export const shiftFeature: FeatureDefinition = {
  key: 'shifts',
  routes: shiftRoutes,
  navigation: shiftNavigation,
};

export const userFeature: FeatureDefinition = {
  key: 'users',
  routes: userRoutes,
  navigation: userNavigation,
};

export const taskFeature: FeatureDefinition = {
  key: 'tasks',
  routes: taskRoutes,
  navigation: taskNavigation,
};

export const residentFeature: FeatureDefinition = {
  key: 'residents',
  routes: residentRoutes,
  navigation: residentNavigation,
};

export const regiFeature: FeatureDefinition = {
  key: 'regi',
  routes: regiRoutes,
  navigation: regiNavigation,
};

export const receptionFeature: FeatureDefinition = {
  key: 'reception',
  routes: receptionRoutes,
  navigation: receptionNavigation,
};

export const helgaFeature: FeatureDefinition = {
  key: 'helga',
  routes: helgaRoutes,
  navigation: helgaNavigation,
};

export const regiBossFeature: FeatureDefinition = {
  key: 'regiBoss',
  routes: regiBossRoutes,
  navigation: regiBossNavigation,
};

export const authFeature: FeatureDefinition = {
  key: 'auth',
  routes: authRoutes,
};

export const alcoholFeature: FeatureDefinition = {
  key: 'alcohol',
  routes: alcoholRoutes,
  navigation: alcoholNavigation,
};
