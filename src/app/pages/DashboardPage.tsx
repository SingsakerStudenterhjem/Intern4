import { PageLayout } from '../../shared/layouts';

const DashboardPage = () => {
  return (
    <PageLayout title="Dashboard" description="Oversikt over internsystemet.">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted">Velg en seksjon i navigasjonen for å komme i gang.</p>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
