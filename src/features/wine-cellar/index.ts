import type { FeatureDefinition } from '../../shared/types/feature';
import { wineCellarNavigation } from './navigation';
import { wineCellarRoutes } from './routes';

export const wineCellarFeature: FeatureDefinition = {
  key: 'wine-cellar',
  routes: wineCellarRoutes,
  navigation: wineCellarNavigation,
};
