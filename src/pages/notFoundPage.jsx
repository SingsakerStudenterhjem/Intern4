import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const NotFoundPage = () => {
  return (
    <div>
      <div>
        <h1>404</h1>
        <h2>
          Siden ble ikke funnet
        </h2>
        <p>
          Beklager, siden du leter etter eksisterer ikke.
        </p>
        <Link 
          to={ROUTES.DASHBOARD}
        >
          Tilbake til Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;