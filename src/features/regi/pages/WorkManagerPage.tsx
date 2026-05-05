import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import WorkApprovalList from '../approvals/components/WorkApprovalList';
import Registatus from '../status/components/Registatus';
import GrantRegiForm from '../granting/components/GrantRegiForm';
import { REGI_PATHS } from '../paths';
import { PageLayout } from '../../../shared/layouts';

const WorkManagerPage: React.FC = () => {
  return (
    <PageLayout
      title="Arbeidsflyt og regioversikt"
      description="Godkjenn innsendte timer, gi regi til beboere og følg status for hele huset."
    >
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col min-h-[52vh]">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <GrantRegiForm />
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
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

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">Full regilogger</h3>
              <p className="text-sm text-gray-600">
                Se alle registrerte timer og status for hele huset.
              </p>
            </div>
            <Link
              to={REGI_PATHS.REGILOGS}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Åpne logg
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default WorkManagerPage;
