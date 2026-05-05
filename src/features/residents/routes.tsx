import ResidentDirectoryPage from './pages/ResidentDirectoryPage';
import { ROUTES } from '../../app/constants/routes';
import type { FeatureRoute } from '../../shared/types/feature';

export const residentRoutes: FeatureRoute[] = [
  {
    path: ROUTES.BEBOERE,
    element: <ResidentDirectoryPage />,
  },
  {
    path: ROUTES.BEBOER_STATISTIKK,
    element: <ResidentDirectoryPage />,
  },
  {
    path: ROUTES.GAMLE_BEBOERE,
    element: <ResidentDirectoryPage />,
  },
];
