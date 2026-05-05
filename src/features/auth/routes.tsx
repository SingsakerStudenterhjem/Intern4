import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import type { FeatureRoute } from '../../shared/types/feature';
import { AUTH_PATHS } from './paths';

export const authRoutes: FeatureRoute[] = [
  {
    path: AUTH_PATHS.LOGIN,
    element: <LoginPage />,
    public: true,
  },
  {
    path: AUTH_PATHS.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
    public: true,
  },
  {
    path: AUTH_PATHS.RESET_PASSWORD,
    element: <ResetPasswordPage />,
    public: true,
  },
];
