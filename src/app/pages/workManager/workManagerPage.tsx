import React, { useState } from 'react';
import WorkApprovalList from '../../components/regi/WorkManager/WorkApprovalList';
import RegiTransferApprovalList from '../../components/regi/WorkManager/RegiTransferApprovalList';
import Registatus from '../../components/regi/WorkManager/Registatus';
import GrantRegiForm from '../../components/regi/WorkManager/GrantRegiForm';
import GrantPenaltyForm from '../../components/regi/WorkManager/GrantPenaltyForm';
import RegiCategoryManagement from '../../components/regi/WorkManager/RegiCategoryManagement';
import RegiLogs from '../../components/regi/WorkManager/RegiLogs';

type TabKey = 'godkjenning' | 'oversikt' | 'gi-timer' | 'gi-straff' | 'kategorier' | 'regilogger';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'godkjenning', label: 'Godkjenningsliste' },
  { key: 'oversikt', label: 'Oversikt' },
  { key: 'gi-timer', label: 'Gi timer' },
  { key: 'gi-straff', label: 'Gi strafferegi' },
  { key: 'kategorier', label: 'Kategorier' },
  { key: 'regilogger', label: 'Regilogger' },
];

const WorkManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('godkjenning');
  // To-be implemented
  // const [totalHours, setTotalHours] = useState<number>(0);
  // const [approvedHours, setApprovedHours] = useState<number>(0);
  // const [remainingHours, setRemainingHours] = useState<number>(0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-navy-600 uppercase">Regisjef</p>
            <h1 className="font-bold text-3xl text-gray-900">Arbeidsflyt og regioversikt</h1>
            <p className="text-gray-600 mt-1">
              Godkjenn innsendte timer, gi regi til beboere og følg status for hele huset.
            </p>
            {/*<p className="text-gray-600 mt-1">*/}
            {/*  Periodens totale antall regitimer: x, Godkjente timer: y, Resterende timer: z*/}
            {/*</p>*/}
          </div>
        </header>

        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-navy-600 text-navy-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          {activeTab === 'godkjenning' && (
            <div className="space-y-8">
              <WorkApprovalList />
              <RegiTransferApprovalList />
            </div>
          )}
          {activeTab === 'oversikt' && <Registatus />}
          {activeTab === 'gi-timer' && <GrantRegiForm />}
          {activeTab === 'gi-straff' && <GrantPenaltyForm />}
          {activeTab === 'kategorier' && <RegiCategoryManagement />}
          {activeTab === 'regilogger' && <RegiLogs />}
        </section>
      </div>
    </div>
  );
};

export default WorkManagerPage;
