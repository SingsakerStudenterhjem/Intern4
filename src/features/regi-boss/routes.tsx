import { FeatureRoute } from '../../shared/types/feature';
import WorkManagerPage from '../regi-boss/pages/WorkManagerPage';
import WorkApprovalsPage from '../regi-boss/approvals/pages/WorkApprovalsPage';
import RegiLogsPage from '../regi-boss/logs/pages/RegiLogsPage';
import { regiManagerRoles } from './permissions';
import { REGI_PATHS } from '../../shared/paths';

export const regiBossRoutes: FeatureRoute[] = [
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