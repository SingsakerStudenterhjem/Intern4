import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
import { AUTH_PATHS } from '../../features/auth/paths';

type ProtectedRouteProps = {
  children?: ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div>
        <div>Laster...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={AUTH_PATHS.LOGIN} replace />;
  }

  if (allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
    return (
      <div>
        <div>
          <h2>Ingen tilgang</h2>
          <p>Du har ikke tilgang til denne siden.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
