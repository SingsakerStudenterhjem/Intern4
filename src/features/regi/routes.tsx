import WorkPage from './pages/WorkPage';
import WorkManagerPage from './pages/WorkManagerPage';
import WorkApprovalsPage from './pages/WorkApprovalsPage';
import RegiLogsPage from './pages/RegiLogsPage';
import { ROUTES } from '../../app/constants/routes';
import { USER_ROLES } from '../../app/constants/userRoles';
import type { FeatureRoute } from '../../shared/types/feature';

const regiManagerRoles = [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER];

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
