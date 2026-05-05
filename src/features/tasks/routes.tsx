import WorkTasksPage from './pages/WorkTasksPage';
import type { FeatureRoute } from '../../shared/types/feature';
import { TASK_PATHS } from './paths';

export const taskRoutes: FeatureRoute[] = [
  {
    path: TASK_PATHS.DASHBOARD,
    element: <WorkTasksPage />,
  },
  {
    path: TASK_PATHS.TASKS,
    element: <WorkTasksPage />,
  },
];
