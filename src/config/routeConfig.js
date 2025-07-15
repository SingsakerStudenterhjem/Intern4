import React from "react";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/loginPage";
import DashboardPage from "../pages/dashboardPage";
import RegiPage from "../pages/regi/regiPage";
import TasksPage from "../pages/regi/tasksPage";
import NotFoundPage from "../pages/notFoundPage";
import ProtectedRoute from "../components/common/protectedRoute";
import { USER_ROLES } from "../constants/userRoles";
import { ROUTES } from "../constants/routes";

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
    path: ROUTES.TASKS,
    element: (
      <ProtectedRoute>
        <TasksPage />
      </ProtectedRoute>
    ),
  },
];

// Admin-only routes
export const adminRoutes = [];

// Regisjef routes
export const regisjefRoutes = [];

// Default redirects
export const redirectRoutes = [
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: "*",
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
