import type { FeatureDefinition } from '../../shared/types/feature';
import { receptionNavigation } from './navigation';
import { receptionRoutes } from './routes';

export const receptionFeature: FeatureDefinition = {
  key: 'reception',
  routes: receptionRoutes,
  navigation: receptionNavigation,
};
