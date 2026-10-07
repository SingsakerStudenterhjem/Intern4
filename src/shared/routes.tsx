import type { FeatureRoute } from './types/feature';
import { AUTH_PATHS, REGI_PATHS, RESIDENT_PATHS, TASK_PATHS, USER_PATHS } from './paths';
import ProfilePage from '../features/users/pages/ProfilePage';
import AddUserPage from '../features/users/pages/AddUserPage';
import WorkTasksPage from '../features/tasks/pages/WorkTasksPage';
import ResidentDirectoryPage from '../features/residents/pages/ResidentDirectoryPage';
import { regiManagerRoles } from './permissions';
import WorkManagerPage from '../features/regi-boss/pages/WorkManagerPage';
import WorkPage from '../features/regi/my-regi/pages/WorkPage';
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';

export const wineCellarRoutes: FeatureRoute[] = [];
export const vervRoutes: FeatureRoute[] = [];
export const shiftRoutes: FeatureRoute[] = [];
export const receptionRoutes: FeatureRoute[] = [];
export const helgaRoutes: FeatureRoute[] = [];
export const alcoholRoutes: FeatureRoute[] = [];

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

export const taskRoutes: FeatureRoute[] = [
  {
    path: TASK_PATHS.DASHBOARD,
    element: <WorkTasksPage />,
  },
  {
    path: TASK_PATHS.TASKS,
    element: <WorkTasksPage />,
  },
];

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
];

export const regiBossRoutes: FeatureRoute[] = [
  {
    path: REGI_PATHS.REGISJEF,
    element: <WorkManagerPage />,
    allowedRoles: regiManagerRoles,
  },
];

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

export const regiRoutes: FeatureRoute[] = [
  {
    path: REGI_PATHS.REGI,
    element: <WorkPage />,
  },
];
