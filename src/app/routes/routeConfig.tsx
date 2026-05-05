import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../constants/routes';
import { authRoutes } from '../../features/auth/routes';
import { alcoholRoutes } from '../../features/alcohol/routes';
import { announcementRoutes } from '../../features/announcements/routes';
import { helgaRoutes } from '../../features/helga/routes';
import { regiRoutes } from '../../features/regi/routes';
import { receptionRoutes } from '../../features/reception/routes';
import { residentRoutes } from '../../features/residents/routes';
import { roomRentalRoutes } from '../../features/room-rental/routes';
import { shiftRoutes } from '../../features/shifts/routes';
import { taskRoutes } from '../../features/tasks/routes';
import { userRoutes } from '../../features/users/routes';
import { vervRoutes } from '../../features/verv/routes';
import { wineCellarRoutes } from '../../features/wine-cellar/routes';
import type { FeatureRoute } from '../../shared/types/feature';

const featureRoutes: FeatureRoute[] = [
  ...authRoutes,
  ...alcoholRoutes,
  ...announcementRoutes,
  ...helgaRoutes,
  ...residentRoutes,
  ...regiRoutes,
  ...receptionRoutes,
  ...roomRentalRoutes,
  ...shiftRoutes,
  ...taskRoutes,
  ...userRoutes,
  ...vervRoutes,
  ...wineCellarRoutes,
];

const toRouteObject = (route: FeatureRoute): RouteObject => ({
  path: route.path,
  element: route.public ? (
    route.element
  ) : (
    <ProtectedRoute allowedRoles={route.allowedRoles}>{route.element}</ProtectedRoute>
  ),
});

// Public routes (no authentication required)
export const publicRoutes: RouteObject[] = featureRoutes
  .filter((route) => route.public)
  .map(toRouteObject);

// Protected routes (authentication required)
export const protectedRoutes: RouteObject[] = featureRoutes
  .filter((route) => !route.public)
  .map(toRouteObject);

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
