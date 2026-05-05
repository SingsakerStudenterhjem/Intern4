import type { FeatureDefinition } from '../../shared/types/feature';
import { userNavigation } from './navigation';
import { userRoutes } from './routes';

export const userFeature: FeatureDefinition = {
  key: 'users',
  routes: userRoutes,
  navigation: userNavigation,
};
