import React from 'react';
import WorkApprovalList from '../../components/regi/WorkManager/WorkApprovalList';

const WorkApprovalsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Regisjef</p>
          <h1 className="text-3xl font-bold text-gray-900">Godkjenning</h1>
          <p className="text-gray-600">Godkjenn eller avvis innsendte regitimer.</p>
        </header>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <WorkApprovalList />
        </section>
      </div>
    </div>
  );
};

export default WorkApprovalsPage;
