import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthContext';
import AppRouter from './app/routes/AppRouter';
import Navbar from './app/layout/Navbar';
import { ROUTES } from './app/constants/routes';

const HIDE_NAVBAR_ROUTES = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];

const AppContent = () => {
  const { pathname } = useLocation();
  const hideNavbar = HIDE_NAVBAR_ROUTES.includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AppRouter />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
