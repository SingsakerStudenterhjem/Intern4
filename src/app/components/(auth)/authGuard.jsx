import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants/userRoles';

const AuthGuard = ({ children, allowedRoles = [], fallback = null, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div>
        <div>Laster...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = redirectTo;
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div>
          <div>
            <h2>Ingen tilgang</h2>
            <p>Du har ikke tilgang til denne siden.</p>
          </div>
        </div>
      )
    );
  }

  return children;
};

export const withAuth = (Component, allowedRoles = []) => {
  const Wrapped = (props) => (
    <AuthGuard allowedRoles={allowedRoles}>
      <Component {...props} />
    </AuthGuard>
  );
  Wrapped.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
};

// Guard for data åpmand role
export const DataGuard = ({ children, fallback }) => (
  <AuthGuard allowedRoles={[USER_ROLES.DATA]} fallback={fallback}>
    {children}
  </AuthGuard>
);

// Guard for regisjef role
export const RegisjefGuard = ({ children, fallback }) => (
  <AuthGuard
    allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]}
    fallback={fallback}
  >
    {children}
  </AuthGuard>
);

// Guard for commonors (aka peasants)
export const UserGuard = ({ children, fallback }) => (
  <AuthGuard
    allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER, USER_ROLES.USER]}
    fallback={fallback}
  >
    {children}
  </AuthGuard>
);

export default AuthGuard;
