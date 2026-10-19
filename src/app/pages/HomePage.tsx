import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, Hourglass, Target } from 'lucide-react';
import { useAuth } from '../providers/AuthContext';
import {
  getMyActiveTasks,
  getSuggestedTasks,
  summarizeSemesterRegi,
  useHomeData,
} from './useHomeData';
import { PageLayout } from '../../shared/layouts';
import {
  ConfirmDialog,
  EmptyState,
  Skeleton,
  StatTile,
  StatusMessage,
  buttonClasses,
} from '../../shared/components';
import { TaskCard } from '../../features/tasks/components/TaskCard';
import TaskModal from '../../features/tasks/components/TaskModal';
import { joinTask, leaveTask, submitTaskCompletion } from '../../server/dao/tasksDAO';
import { canApproveWork } from '../../features/regi/permissions';
import { TASK_PATHS } from '../../features/tasks/paths';
import { REGI_PATHS } from '../../features/regi/paths';
import { Task } from '../../shared/types/regi/tasks';
import { getSemesterName } from '../../shared/utils/semester';

const formatHours = (hours: number) =>
  `${hours.toLocaleString('no-NO', { maximumFractionDigits: 1 })} t`;

const SectionHeading = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h2 className="text-lg font-semibold">{title}</h2>
    {action}
  </div>
);

const HomePage = () => {
  const { user } = useAuth();
  const { logs, tasks, categories, names, pendingApprovals, loading, error, reload } =
    useHomeData(user);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [submitCandidate, setSubmitCandidate] = useState<Task | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const userId = user?.id ?? '';
  const summary = useMemo(() => summarizeSemesterRegi(logs, user?.role), [logs, user?.role]);
  const myTasks = useMemo(() => getMyActiveTasks(tasks, userId), [tasks, userId]);
  const suggestedTasks = useMemo(() => getSuggestedTasks(tasks, userId), [tasks, userId]);
  const categoryColors = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.name, category.color])),
    [categories]
  );
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const firstName = user?.name?.split(' ')[0];

  const runTaskAction = async (
    taskId: string,
    action: () => Promise<unknown>,
    successText: string
  ) => {
    setBusyTaskId(taskId);
    setMessage(null);
    try {
      await action();
      await reload();
      setSelectedTaskId(null);
      setMessage({ tone: 'success', text: successText });
    } catch (actionError) {
      setMessage({
        tone: 'error',
        text: actionError instanceof Error ? actionError.message : 'Noe gikk galt. Prøv igjen.',
      });
    } finally {
      setBusyTaskId(null);
    }
  };

  const join = (taskId: string) =>
    void runTaskAction(taskId, () => joinTask(taskId, userId), 'Du er påmeldt oppgaven!');
  const leave = (taskId: string) =>
    void runTaskAction(taskId, () => leaveTask(taskId, userId), 'Du er meldt av oppgaven.');
  const submit = (taskId: string) =>
    void runTaskAction(
      taskId,
      () => submitTaskCompletion(taskId, userId),
      'Oppgaven er sendt inn til godkjenning!'
    );

  const cardProps = (task: Task) => ({
    task,
    currentUserId: userId,
    categoryColor: categoryColors[task.category],
    contactName: task.contactPersonId ? names[task.contactPersonId] : undefined,
    onOpen: (openTask: Task) => setSelectedTaskId(openTask.id),
    onJoin: (joinTarget: Task) => join(joinTarget.id),
    onSubmit: setSubmitCandidate,
    busy: busyTaskId === task.id,
  });

  return (
    <PageLayout
      title={firstName ? `Hei, ${firstName}!` : 'Hei!'}
      description={`${getSemesterName()} · Her er det viktigste for deg akkurat nå.`}
    >
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {message && (
        <StatusMessage tone={message.tone} onDismiss={() => setMessage(null)}>
          {message.text}
        </StatusMessage>
      )}

      <section>
        <SectionHeading
          title="Regi dette semesteret"
          action={
            <Link to={REGI_PATHS.REGI} className="text-sm font-medium text-primary hover:underline">
              Min regi
            </Link>
          }
        />
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
              hint={
                summary.required > 0 && summary.remaining === 0 ? 'Kravet er oppfylt' : undefined
              }
            />
          </div>
        )}
      </section>

      {canApproveWork(user?.role) && pendingApprovals !== null && (
        <Link
          to={REGI_PATHS.REGIGODKJENNING}
          className="flex items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-primary-subtle p-4 text-primary-subtle-fg transition-colors hover:border-primary/50"
        >
          <span className="flex items-center gap-3">
            <ClipboardCheck aria-hidden="true" className="h-6 w-6 shrink-0" />
            <span>
              <span className="block font-semibold">
                {pendingApprovals === 0
                  ? 'Ingenting venter på godkjenning'
                  : `${pendingApprovals} venter på godkjenning`}
              </span>
              <span className="block text-sm opacity-80">Gå til godkjenningslisten</span>
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <SectionHeading title="Mine oppgaver" />
          {loading ? (
            <Skeleton className="h-36 rounded-2xl" />
          ) : myTasks.length === 0 ? (
            <EmptyState title="Du har ingen aktive oppgaver">
              Meld deg på en ledig oppgave for å samle regitimer.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {myTasks.map((task) => (
                <li key={task.id}>
                  <TaskCard {...cardProps(task)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeading
            title="Ledige oppgaver"
            action={
              <Link
                to={TASK_PATHS.TASKS}
                className={buttonClasses({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'text-primary',
                })}
              >
                Se alle
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            }
          />
          {loading ? (
            <Skeleton className="h-36 rounded-2xl" />
          ) : suggestedTasks.length === 0 ? (
            <EmptyState title="Ingen ledige oppgaver akkurat nå">
              Sjekk igjen senere, eller spør regisjefen.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {suggestedTasks.map((task) => (
                <li key={task.id}>
                  <TaskCard {...cardProps(task)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          currentUserId={userId}
          userRole={user?.role}
          categoryColor={categoryColors[selectedTask.category]}
          participantNames={names}
          onJoinTask={join}
          onLeaveTask={leave}
          onCompleteTask={submit}
        />
      )}

      <ConfirmDialog
        open={!!submitCandidate}
        title="Send inn til godkjenning?"
        confirmLabel="Send inn"
        onCancel={() => setSubmitCandidate(null)}
        onConfirm={() => {
          if (submitCandidate) submit(submitCandidate.id);
          setSubmitCandidate(null);
        }}
      >
        «{submitCandidate?.title}» ({submitCandidate?.hourEstimate} timer) sendes til regisjefen for
        godkjenning.
      </ConfirmDialog>
    </PageLayout>
  );
};

export default HomePage;
