import type { FeatureDefinition } from '../../shared/types/feature';
import { alcoholNavigation } from './navigation';
import { alcoholRoutes } from './routes';

export const alcoholFeature: FeatureDefinition = {
  key: 'alcohol',
  routes: alcoholRoutes,
  navigation: alcoholNavigation,
};
