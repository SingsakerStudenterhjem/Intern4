import { Link } from 'react-router-dom';
import { TASK_PATHS } from '../../features/tasks/paths';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">Siden ble ikke funnet</h2>
        <p className="text-gray-600 mb-6">Beklager, siden du leter etter eksisterer ikke.</p>
        <Link to={TASK_PATHS.DASHBOARD} className="text-blue-600 hover:underline">
          Tilbake til Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
