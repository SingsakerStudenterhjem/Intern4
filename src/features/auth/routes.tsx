import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ROUTES } from '../../app/constants/routes';
import type { FeatureRoute } from '../../shared/types/feature';

export const authRoutes: FeatureRoute[] = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
    public: true,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
    public: true,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
    public: true,
  },
];
