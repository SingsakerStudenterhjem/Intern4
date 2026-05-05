import WorkPage from './my-regi/pages/WorkPage';
import WorkManagerPage from './pages/WorkManagerPage';
import WorkApprovalsPage from './approvals/pages/WorkApprovalsPage';
import RegiLogsPage from './logs/pages/RegiLogsPage';
import { ROUTES } from '../../app/constants/routes';
import type { FeatureRoute } from '../../shared/types/feature';
import { regiManagerRoles } from './permissions';

export const regiRoutes: FeatureRoute[] = [
  {
    path: ROUTES.REGI,
    element: <WorkPage />,
  },
  {
    path: ROUTES.REGISJEF,
    element: <WorkManagerPage />,
    allowedRoles: regiManagerRoles,
  },
  {
    path: ROUTES.REGIGODKJENNING,
    element: <WorkApprovalsPage />,
    allowedRoles: regiManagerRoles,
  },
  {
    path: ROUTES.REGILOGS,
    element: <RegiLogsPage />,
    allowedRoles: regiManagerRoles,
  },
];
