import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPage from '../app/pages/loginPage';
import AddUserPage from '../app/pages/roomManager/addUserPage';
import ImportUsersPage from '../app/pages/roomManager/importUsersPage';
import WorkTasksPage from '../app/pages/work/workTasksPage';
import WorkPage from '../app/pages/work/workPage';
import WorkManagerPage from '../app/pages/workManager/workManagerPage';
import NotFoundPage from '../app/pages/notFoundPage';
import ProtectedRoute from '../app/components/common/protectedRoute';
import { ROUTES } from '../app/constants/routes';
import { USER_ROLES } from '../app/constants/userRoles';
import AboutMePage from '../app/pages/tmpAboutMe';
import WorkApprovalReviewPage from '../app/pages/workManager/workApprovalReviewPage';
import ForgotPasswordPage from '../app/pages/forgotPasswordPage';
import ResetPasswordPage from '../app/pages/resetPasswordPage';
import AdminPage from '../app/pages/admin/adminPage';

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
    element: <Navigate to={ROUTES.TASKS} replace />,
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
    path: ROUTES.REGIGODKJENNING_REVIEW,
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}>
        <WorkApprovalReviewPage />
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
    path: ROUTES.IMPORTER_BRUKERE,
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.ROOMMANAGER]}>
        <ImportUsersPage />
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
    path: ROUTES.MY_REGI,
    element: (
      <ProtectedRoute>
        <WorkPage />
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
      <ProtectedRoute allowedRoles={[USER_ROLES.DATA]}>
        <AdminPage />
      </ProtectedRoute>
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
