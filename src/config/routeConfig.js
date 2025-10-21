import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/loginPage';
import DashboardPage from '../pages/dashboardPage';
import RegiPage from '../pages/regi/regiPage';
import AddUserPage from '../pages/rom/addUserPage';
import TasksPage from '../pages/regi/tasksPage';
import NotFoundPage from '../pages/notFoundPage';
import ProtectedRoute from '../components/common/protectedRoute';
import { ROUTES } from '../constants/routes';
import AdminPage from '../pages/adminPage';

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
        <RegiPage />
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
        <TasksPage />
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
