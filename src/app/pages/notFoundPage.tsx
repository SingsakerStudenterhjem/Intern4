import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-navy-900">
      <div className="bg-white p-8 border-t-4 border-navy-500 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-navy-900">404</h1>
        <h2 className="text-xl font-semibold mb-2 text-navy-900">Siden ble ikke funnet</h2>
        <p className="text-gray-600 mb-6">Beklager, siden du leter etter eksisterer ikke.</p>
        <Link to={ROUTES.DASHBOARD} className="text-navy-600 hover:underline">
          Tilbake til Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
