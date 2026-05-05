import type { FeatureDefinition } from '../../shared/types/feature';
import { authRoutes } from './routes';

export const authFeature: FeatureDefinition = {
  key: 'auth',
  routes: authRoutes,
};
