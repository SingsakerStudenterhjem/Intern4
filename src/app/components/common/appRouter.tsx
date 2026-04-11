import { Routes, Route } from 'react-router-dom';
import { allRoutes } from '../../../config/routeConfig';

const AppRouter = () => {
  return (
    <Routes>
      {allRoutes.map((route, index) => (
        <Route key={route.path ?? index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default AppRouter;
