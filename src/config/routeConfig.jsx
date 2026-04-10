import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPage from '../app/pages/loginPage';
import AddUserPage from '../app/pages/roomManager/addUserPage';
import WorkTasksPage from '../app/pages/work/workTasksPage';
import WorkPage from '../app/pages/work/workPage';
import WorkManagerPage from '../app/pages/workManager/workManagerPage';
import NotFoundPage from '../app/pages/notFoundPage';
import ProtectedRoute from '../app/components/common/protectedRoute';
import { ROUTES } from '../app/constants/routes';
import { USER_ROLES } from '../app/constants/userRoles';
import AboutMePage from '../app/pages/tmpAboutMe';
import WorkApprovalsPage from '../app/pages/workManager/workApprovalsPage';
import RegiLogsPage from '../app/pages/workManager/regiLogsPage';
import ForgotPasswordPage from '../app/pages/forgotPasswordPage';
import ResetPasswordPage from '../app/pages/resetPasswordPage';

// Public routes (no authentication required)
export const publicRoutes = [
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
export const protectedRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <WorkTasksPage />
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
      <ProtectedRoute
        allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}
      >
        <WorkManagerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REGIGODKJENNING,
    element: (
      <ProtectedRoute
        allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}
      >
        <WorkApprovalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REGILOGS,
    element: (
      <ProtectedRoute
        allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}
      >
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
    path: ROUTES.ABOUTME,
    element: (
      <ProtectedRoute>
        <AboutMePage />
      </ProtectedRoute>
    ),
  },
];

// Admin-only routes
export const adminRoutes = [
  {
    path: ROUTES.ADMIN,
    element: (
      <ProtectedRoute></ProtectedRoute>
    ),
  },
];

// Regisjef routes
export const regisjefRoutes = [];

// Default redirects
export const redirectRoutes = [
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
export const allRoutes = [
  ...publicRoutes,
  ...protectedRoutes,
  ...adminRoutes,
  ...regisjefRoutes,
  ...redirectRoutes,
];
