import React from 'react';
import WorkApprovalList from '../../components/regi/WorkManager/WorkApprovalList.tsx';
import Registatus from '../../components/regi/WorkManager/Registatus';
import GrantRegiForm from '../../components/regi/WorkManager/GrantRegiForm';

const WorkManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Regisjef</p>
            <h1 className="font-bold text-3xl text-gray-900">Arbeidsflyt og regioversikt</h1>
            <p className="text-gray-600 mt-1">
              Godkjenn innsendte timer, gi regi til beboere og følg status for hele huset.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="lg:col-span-1 bg-white border rounded-xl shadow-sm p-5 flex flex-col min-h-[60vh]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Godkjenningsliste</h2>
              <p className="text-sm text-gray-600">
                Se innsendte regitimer og godkjenn eller avvis direkte.
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <WorkApprovalList />
            </div>
          </section>

          <div className="space-y-6">
            <section className="bg-white border rounded-xl shadow-sm p-5">
              <GrantRegiForm />
            </section>

            <section className="bg-white border rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Registatus</h2>
                <p className="text-sm text-gray-600">
                  Aktive brukere, godkjente timer og gjenstående krav for semesteret.
                </p>
              </div>
              <div className="min-h-0">
                <Registatus />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkManagerPage;
