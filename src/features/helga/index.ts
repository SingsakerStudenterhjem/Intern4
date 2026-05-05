import type { FeatureDefinition } from '../../shared/types/feature';
import { helgaNavigation } from './navigation';
import { helgaRoutes } from './routes';

export const helgaFeature: FeatureDefinition = {
  key: 'helga',
  routes: helgaRoutes,
  navigation: helgaNavigation,
};
