import React from 'react';
import WorkApprovalList from '../../components/regi/WorkManager/WorkApprovalList.tsx';
import Registatus from '../../components/regi/WorkManager/Registatus';

const WorkManagerPage: React.FC = () => {
  return (
    <div className="flex justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-4 max-w-[80rem] min-w-0">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">Regisjef</h1>
          <p className="text-gray-600 text-sm">Admin relatert til regisjef.</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="font-bold text-xl">Godkjenningsliste</h2>
            <p>Liste over ubehandlet regi</p>
            <WorkApprovalList/>
          </div>
          <div className="md:col-span-1">
            <h2 className="font-bold text-xl">Registatus</h2>
            <p className="text-sm text-gray-600 mb-2">Liste over aktive beboere og gjenstående timer.</p>
            <Registatus />
          </div>
          <div className="md:col-span-1">
            <h2 className="font-bold text-xl">Annet</h2>
            <p>Liste over ting som er mindre vanlig å bruke</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkManagerPage;
