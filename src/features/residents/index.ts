import type { FeatureDefinition } from '../../shared/types/feature';
import { residentNavigation } from './navigation';
import { residentRoutes } from './routes';

export const residentFeature: FeatureDefinition = {
  key: 'residents',
  routes: residentRoutes,
  navigation: residentNavigation,
};
