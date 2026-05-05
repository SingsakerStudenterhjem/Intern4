import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import { APP_ROUTES } from '../constants/appRoutes';
import { features } from '../../features';
import type { FeatureRoute } from '../../shared/types/feature';
import { TASK_PATHS } from '../../features/tasks/paths';

const featureRoutes: FeatureRoute[] = features.flatMap((feature) => feature.routes ?? []);

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
    path: APP_ROUTES.ADMIN,
    element: <ProtectedRoute />,
  },
];

// Regisjef routes
export const regisjefRoutes: RouteObject[] = [];

// Default redirects
export const redirectRoutes: RouteObject[] = [
  {
    path: APP_ROUTES.HOME,
    element: <Navigate to={TASK_PATHS.DASHBOARD} replace />,
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
