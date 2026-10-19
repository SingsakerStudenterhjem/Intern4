import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Hourglass, Target } from 'lucide-react';
import WorkLogForm from '../components/WorkLogForm';
import WorkLogList from '../components/WorkLogList';
import { useWorkLogList } from '../hooks/useWorkLogList';
import { useWorkLogFormWorkflow } from '../hooks/useWorkLogFormWorkflow';
import { useAuth } from '../../../../app/providers/AuthContext';
import { TASK_PATHS } from '../../../tasks/paths';
import { PageLayout } from '../../../../shared/layouts';
import { Card, Skeleton, StatTile, buttonClasses } from '../../../../shared/components';
import { summarizeSemesterRegi } from '../../regiSummary';
import { formatHours } from '../../../../shared/utils/date';
import { getSemesterName } from '../../../../shared/utils/semester';
import type { AuthUser } from '../../../auth/hooks/useAuth';

const WorkPageContent = ({ user }: { user: NonNullable<AuthUser> }) => {
  const { logs, loading, error, deletingId, deleteLog, reload } = useWorkLogList(user.id);
  const workflow = useWorkLogFormWorkflow();
  const summary = useMemo(() => summarizeSemesterRegi(logs, user.role), [logs, user.role]);
  const categoryColors = useMemo(
    () =>
      Object.fromEntries(workflow.categories.map((category) => [category.name, category.color])),
    [workflow.categories]
  );

  return (
    <PageLayout
      title="Min regi"
      description={`${getSemesterName()} · Registrer timer og følg med på godkjenningen.`}
      actions={
        <Link to={TASK_PATHS.TASKS} className={buttonClasses({ variant: 'secondary' })}>
          <ClipboardList aria-hidden="true" className="h-4 w-4" />
          Finn oppgaver
        </Link>
      }
    >
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 rounded-2xl sm:h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatTile
            label="Godkjent"
            value={formatHours(summary.approved)}
            tone="success"
            icon={<CheckCircle2 className="h-5 w-5" />}
            progress={summary.required > 0 ? summary.approved / summary.required : undefined}
            hint={summary.required > 0 ? `av ${formatHours(summary.required)}` : undefined}
          />
          <StatTile
            label="Venter"
            value={formatHours(summary.pending)}
            tone="warning"
            icon={<Hourglass className="h-5 w-5" />}
          />
          <StatTile
            label="Gjenstår"
            value={summary.required > 0 ? formatHours(summary.remaining) : 'Ingen krav'}
            tone={summary.remaining === 0 ? 'success' : 'primary'}
            icon={<Target className="h-5 w-5" />}
            hint={summary.required > 0 && summary.remaining === 0 ? 'Kravet er oppfylt' : undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="lg:sticky lg:top-20">
          <WorkLogForm {...workflow} onCreated={() => void reload()} />
        </Card>

        <WorkLogList
          logs={logs}
          loading={loading}
          error={error}
          deletingId={deletingId}
          onDelete={deleteLog}
          categoryColors={categoryColors}
        />
      </div>
    </PageLayout>
  );
};

const WorkPage = () => {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return <WorkPageContent user={user} />;
};

export default WorkPage;
