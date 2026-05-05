import { PageLayout } from '../../shared/layouts';

const DashboardPage = () => {
  return (
    <PageLayout title="Dashboard" description="Oversikt over internsystemet.">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">Velg en seksjon i navigasjonen for å komme i gang.</p>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
