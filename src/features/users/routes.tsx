import ProfilePage from './pages/ProfilePage';
import AddUserPage from './pages/AddUserPage';
import { ROUTES } from '../../app/constants/routes';
import type { FeatureRoute } from '../../shared/types/feature';

export const userRoutes: FeatureRoute[] = [
  {
    path: ROUTES.PROFILE,
    element: <ProfilePage />,
  },
  {
    path: ROUTES.LEGG_TIL_BEBOER,
    element: <AddUserPage />,
  },
];
