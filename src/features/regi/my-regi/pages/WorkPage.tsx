import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WorkLogForm from '../components/WorkLogForm';
import WorkLogList from '../components/WorkLogList';
import { useAuth } from '../../../../app/providers/AuthContext';
import { TASK_PATHS } from '../../../tasks/paths';
import { PageLayout } from '../../../../shared/layouts';

const WorkPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <PageLayout
      title="Min regi"
      description="Registrer egne regitimer og følg med på innsendte registreringer."
      actions={
        <Link
          to={TASK_PATHS.TASKS}
          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Se oppgaver
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section
          id="regi-form"
          className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-5"
        >
          <WorkLogForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </section>

        <section>
          <WorkLogList userId={user.id} userRole={user.role} refreshKey={refreshKey} />
        </section>
      </div>
    </PageLayout>
  );
};

export default WorkPage;
