import WorkTasksPage from './pages/WorkTasksPage';
import { ROUTES } from '../../app/constants/routes';
import type { FeatureRoute } from '../../shared/types/feature';

export const taskRoutes: FeatureRoute[] = [
  {
    path: ROUTES.DASHBOARD,
    element: <WorkTasksPage />,
  },
  {
    path: ROUTES.TASKS,
    element: <WorkTasksPage />,
  },
];
