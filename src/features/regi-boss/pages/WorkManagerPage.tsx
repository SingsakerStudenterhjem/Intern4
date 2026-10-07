import React, { useState } from 'react';
import WorkApprovalList from '../components/WorkApprovalList';
import Registatus from '../status/components/Registatus';
import GrantRegiForm from '../components/GrantRegiForm';
import { PageLayout } from '../../../shared/layouts';
// import RegiLogs from '../components/RegiLogs';
import RegiLogsPage from '../components/RegiLogsPage';

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

  return (
    <PageLayout
      title="Arbeidsflyt og regioversikt"
      description="Godkjenn innsendte timer, gi regi til beboere og følg status for hele huset."
    >
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
            {/*<RegiTransferApprovalList />*/}
          </div>
        )}
        {activeTab === 'oversikt' && <Registatus />}
        {activeTab === 'gi-timer' && <GrantRegiForm />}
        {/*{activeTab === 'gi-straff' && <GrantPenaltyForm />}*/}
        {/*{activeTab === 'kategorier' && <RegiCategoryManagement />}*/}
        {activeTab === 'regilogger' && <RegiLogsPage />}
      </section>
    </PageLayout>
  );
};

export default WorkManagerPage;
