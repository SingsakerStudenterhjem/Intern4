import ProfilePage from './pages/ProfilePage';
import AddUserPage from './pages/AddUserPage';
import type { FeatureRoute } from '../../shared/types/feature';
import { USER_PATHS } from './paths';

export const userRoutes: FeatureRoute[] = [
  {
    path: USER_PATHS.PROFILE,
    element: <ProfilePage />,
  },
  {
    path: USER_PATHS.LEGG_TIL_BEBOER,
    element: <AddUserPage />,
  },
];
