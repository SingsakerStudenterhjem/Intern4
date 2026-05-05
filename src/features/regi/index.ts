import type { FeatureDefinition } from '../../shared/types/feature';
import { regiNavigation } from './navigation';
import { regiRoutes } from './routes';

export const regiFeature: FeatureDefinition = {
  key: 'regi',
  routes: regiRoutes,
  navigation: regiNavigation,
};
