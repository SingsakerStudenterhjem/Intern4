import type { FeatureDefinition } from '../../shared/types/feature';
import { taskNavigation } from './navigation';
import { taskRoutes } from './routes';

export const taskFeature: FeatureDefinition = {
  key: 'tasks',
  routes: taskRoutes,
  navigation: taskNavigation,
};
