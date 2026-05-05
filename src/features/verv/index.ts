import type { FeatureDefinition } from '../../shared/types/feature';
import { vervNavigation } from './navigation';
import { vervRoutes } from './routes';

export const vervFeature: FeatureDefinition = {
  key: 'verv',
  routes: vervRoutes,
  navigation: vervNavigation,
};
