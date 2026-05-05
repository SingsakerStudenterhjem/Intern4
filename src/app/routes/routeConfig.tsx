import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/LoginPage';
import AddUserPage from '../../features/users/pages/AddUserPage';
import WorkTasksPage from '../../features/tasks/pages/WorkTasksPage';
import WorkPage from '../../features/regi/pages/WorkPage';
import WorkManagerPage from '../../features/regi/pages/WorkManagerPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/userRoles';
import ProfilePage from '../../features/users/pages/ProfilePage';
import WorkApprovalsPage from '../../features/regi/pages/WorkApprovalsPage';
import RegiLogsPage from '../../features/regi/pages/RegiLogsPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';
import ResidentDirectoryPage from '../../features/residents/pages/ResidentDirectoryPage';

// Public routes (no authentication required)
export const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
];

// Protected routes (authentication required)
export const protectedRoutes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <WorkTasksPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.BEBOERE,
    element: (
      <ProtectedRoute>
        <ResidentDirectoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.BEBOER_STATISTIKK,
    element: (
      <ProtectedRoute>
        <ResidentDirectoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.GAMLE_BEBOERE,
    element: (
      <ProtectedRoute>
        <ResidentDirectoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REGI,
    element: (
      <ProtectedRoute>
        <WorkPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REGISJEF,
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}>
        <WorkManagerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REGIGODKJENNING,
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}>
        <WorkApprovalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REGILOGS,
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}>
        <RegiLogsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LEGG_TIL_BEBOER,
    element: (
      <ProtectedRoute>
        <AddUserPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TASKS,
    element: (
      <ProtectedRoute>
        <WorkTasksPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
];

// Admin-only routes
export const adminRoutes: RouteObject[] = [
  {
    path: ROUTES.ADMIN,
    element: <ProtectedRoute />,
  },
];

// Regisjef routes
export const regisjefRoutes: RouteObject[] = [];

// Default redirects
export const redirectRoutes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// All routes combined
export const allRoutes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...adminRoutes,
  ...regisjefRoutes,
  ...redirectRoutes,
];
