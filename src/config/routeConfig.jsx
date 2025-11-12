import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPage from '../app/pages/loginPage';
import DashboardPage from '../app/pages/dashboardPage';
import WorkPage from '../app/pages/work/workPage';
import AddUserPage from '../app/pages/roomManager/addUserPage';
import WorkTasksPage from '../app/pages/work/workTasksPage';
import NotFoundPage from '../app/pages/notFoundPage';
import ProtectedRoute from '../app/components/common/protectedRoute';
import { ROUTES } from '../app/constants/routes';
import AdminPage from '../app/pages/adminPage';

// Public routes (no authentication required)
export const publicRoutes = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
];

// Protected routes (authentication required)
export const protectedRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardPage />
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
];

// Admin-only routes
export const adminRoutes = [
  {
    path: ROUTES.ADMIN,
    element: (
      <ProtectedRoute>
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
