import React, { useState } from 'react';
import WorkLogForm from '../../components/regi/MyRegi/WorkLogForm';
import WorkLogList from '../../components/regi/MyRegi/WorkLogList';
import { useAuth } from '../../hooks/useAuth';

const WorkPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-4 max-w-[80rem] min-w-0">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">Min regi</h1>
          <p className="text-gray-600 text-sm">Her kan du registrere arbeid du har utført.</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <WorkLogForm onCreated={() => setRefreshKey((k) => k + 1)} />
          </div>

          <div className="md:col-span-1">
            <WorkLogList userId={user.uid} refreshKey={refreshKey} />{' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkPage;
