import WorkPage from './my-regi/pages/WorkPage';

import type { FeatureRoute } from '../../shared/types/feature';
import { REGI_PATHS } from '../../shared/paths';

export const regiRoutes: FeatureRoute[] = [
  {
    path: REGI_PATHS.REGI,
    element: <WorkPage />,
  },
];
