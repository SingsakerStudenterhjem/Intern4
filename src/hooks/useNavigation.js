import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from './useAuth';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const goTo = (route, options = {}) => {
    navigate(route, options);
  };

  const goToDashboard = () => goTo(ROUTES.DASHBOARD);
  const goToLogin = () => goTo(ROUTES.LOGIN);
  const goToRegi = () => goTo(ROUTES.REGI);
  const goToTasks = () => goTo(ROUTES.TASKS);
  const goToAdmin = () => goTo(ROUTES.ADMIN);

  const handleLogout = async () => {
    await logout();
    goToLogin();
  };

  const isCurrentRoute = (route) => location.pathname === route;

  // Get available routes based on user role
  const getAvailableRoutes = () => {
    const baseRoutes = [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'home' },
      { path: ROUTES.REGI, label: 'Regi', icon: 'work' },
      { path: ROUTES.TASKS, label: 'Oppgaver', icon: 'tasks' }
    ];

    if (user?.role === 'regisjef' || user?.role === 'data') {
      baseRoutes.push(
      );
    }

    if (user?.role === 'data') {
      baseRoutes.push(
        { path: ROUTES.ADMIN, label: 'Admin', icon: 'admin' }
      );
    }

    return baseRoutes;
  };

  return {
    goTo,
    goToDashboard,
    goToLogin,
    goToRegi,
    goToTasks,
    goToAdmin,
    handleLogout,
    isCurrentRoute,
    getAvailableRoutes,
    currentPath: location.pathname
  };
};