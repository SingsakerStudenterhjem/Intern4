import React from 'react';
import WorkApprovalList from '../../components/regi/WorkManager/WorkApprovalList.tsx';

const WorkApprovalsPage: React.FC = () => {
  return (
    <div className="flex justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-4 max-w-[80rem] min-w-0">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">Godkjenning</h1>
          <p className="text-gray-600 text-sm">Godkjenn eller avvis innsendt regi.</p>
        </div>

        <WorkApprovalList />
      </div>
    </div>
  );
};

export default WorkApprovalsPage;
