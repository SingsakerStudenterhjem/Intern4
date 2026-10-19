import WorkPage from './my-regi/pages/WorkPage';
import WorkManagerPage from './pages/WorkManagerPage';
import type { FeatureRoute } from '../../shared/types/feature';
import { regiManagerRoles } from './permissions';
import { REGI_PATHS } from './paths';

// Every Regisjef tab has its own URL so tabs can be linked to and the back button works.
const managerPaths = [
  REGI_PATHS.REGISJEF,
  REGI_PATHS.REGIGODKJENNING,
  REGI_PATHS.REGISTATUS,
  REGI_PATHS.GI_REGI,
  REGI_PATHS.REGILOGS,
];

export const regiRoutes: FeatureRoute[] = [
  {
    path: REGI_PATHS.REGI,
    element: <WorkPage />,
  },
  ...managerPaths.map((path) => ({
    path,
    element: <WorkManagerPage />,
    allowedRoles: regiManagerRoles,
  })),
];
