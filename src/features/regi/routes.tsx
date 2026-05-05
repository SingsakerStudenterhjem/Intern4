import WorkPage from './my-regi/pages/WorkPage';
import WorkManagerPage from './pages/WorkManagerPage';
import WorkApprovalsPage from './approvals/pages/WorkApprovalsPage';
import RegiLogsPage from './logs/pages/RegiLogsPage';
import type { FeatureRoute } from '../../shared/types/feature';
import { regiManagerRoles } from './permissions';
import { REGI_PATHS } from './paths';

export const regiRoutes: FeatureRoute[] = [
  {
    path: REGI_PATHS.REGI,
    element: <WorkPage />,
  },
  {
    path: REGI_PATHS.REGISJEF,
    element: <WorkManagerPage />,
    allowedRoles: regiManagerRoles,
  },
  {
    path: REGI_PATHS.REGIGODKJENNING,
    element: <WorkApprovalsPage />,
    allowedRoles: regiManagerRoles,
  },
  {
    path: REGI_PATHS.REGILOGS,
    element: <RegiLogsPage />,
    allowedRoles: regiManagerRoles,
  },
];
