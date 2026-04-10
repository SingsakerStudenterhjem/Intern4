import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WorkLogForm from '../../components/regi/MyRegi/WorkLogForm';
import WorkLogList from '../../components/regi/MyRegi/WorkLogList';
import { useAuth } from '../../../contexts/authContext';
import { ROUTES } from '../../constants/routes';

const WorkPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <header className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">Min regi</h1>
              <p className="text-gray-600">
                Registrer egne regitimer og følg med på innsendte registreringer.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.TASKS}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Se oppgaver
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            id="regi-form"
            className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-5"
          >
            <WorkLogForm onCreated={() => setRefreshKey((k) => k + 1)} />
          </section>

          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Mine registreringer</h2>
            <p className="text-sm text-gray-600 mb-3">
              Nyeste først. Godkjenning skjer av regisjef.
            </p>
            <WorkLogList userId={user.id} refreshKey={refreshKey} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default WorkPage;
