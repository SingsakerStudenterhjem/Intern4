import type { FeatureDefinition } from '../../shared/types/feature';
import { shiftNavigation } from './navigation';
import { shiftRoutes } from './routes';

export const shiftFeature: FeatureDefinition = {
  key: 'shifts',
  routes: shiftRoutes,
  navigation: shiftNavigation,
};
