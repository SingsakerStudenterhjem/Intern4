import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div>
        <div>Laster...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div>
        <div>
          <h2>Ingen tilgang</h2>
          <p>Du har ikke tilgang til denne siden.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
