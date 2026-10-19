import ResidentDirectoryPage from './pages/ResidentDirectoryPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import type { FeatureRoute } from '../../shared/types/feature';
import { RESIDENT_PATHS } from './paths';

export const residentRoutes: FeatureRoute[] = [
  {
    path: RESIDENT_PATHS.BEBOERE,
    element: <ResidentDirectoryPage />,
  },
  {
    path: RESIDENT_PATHS.BEBOER_STATISTIKK,
    element: <ResidentDirectoryPage />,
  },
  {
    path: RESIDENT_PATHS.GAMLE_BEBOERE,
    element: <ResidentDirectoryPage />,
  },
  {
    path: RESIDENT_PATHS.BEBOER_PROFIL,
    element: <ResidentProfilePage />,
  },
];
