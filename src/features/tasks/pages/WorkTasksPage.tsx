import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import TasksTable from '../components/TasksTable';
import TaskModal from '../components/TaskModal';
import TaskCreationModal from '../components/TaskCreationModal';
import CategoryManagement from '../components/CategoryManagement';
import { useTaskManagement } from '../hooks/useTaskManagement';
import { PageLayout } from '../../../shared/layouts';
import {
  Button,
  ConfirmDialog,
  SearchInput,
  SegmentedControl,
  Skeleton,
  Spinner,
  StatusMessage,
} from '../../../shared/components';
import { Task } from '../../../shared/types/regi/tasks';
import { cn } from '../../../shared/utils/cn';

const FILTER_OPTIONS = [
  { value: 'available', label: 'Ledige' },
  { value: 'myTasks', label: 'Mine' },
  { value: 'all', label: 'Alle' },
];

const chipClasses = (active: boolean) =>
  cn(
    'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors pointer-coarse:min-h-10',
    active
      ? 'border-primary bg-primary-subtle text-primary-subtle-fg'
      : 'border-border bg-surface text-muted hover:border-border-strong hover:text-fg'
  );

const WorkTasksPage: React.FC = () => {
  const {
    user,
    authLoading,
    loading,
    refreshing,
    error,
    message,
    clearMessage,
    categories,
    selectedTask,
    setSelectedTask,
    isCreateModalOpen,
    editingTask,
    showCategoryManagement,
    participantNames,
    contactPeople,
    canCreateTasks,
    canManageTaskCategories,
    canDeleteTasks,
    getCategoryUsageCount,
    taskList,
    handleCreateTask,
    handleUpdateTask,
    handleJoinTask,
    handleLeaveTask,
    handleCompleteTask,
    handleDeleteTask,
    handleOpenCreateTask,
    handleOpenEditTask,
    handleCloseTaskEditor,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    toggleCategoryManagement,
  } = useTaskManagement();

  const {
    query,
    setQuery,
    filter,
    setFilter,
    category,
    setCategory,
    currentPage,
    paginatedTasks,
    totalPages,
    nextPage,
    prevPage,
    filteredTasks,
  } = taskList;

  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [submitCandidate, setSubmitCandidate] = useState<Task | null>(null);

  const categoryColors = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.name, item.color])),
    [categories]
  );

  const joinFromList = async (taskId: string) => {
    setBusyTaskId(taskId);
    try {
      await handleJoinTask(taskId);
    } finally {
      setBusyTaskId(null);
    }
  };

  const confirmSubmit = async () => {
    if (!submitCandidate) return;
    const taskId = submitCandidate.id;
    setSubmitCandidate(null);
    setBusyTaskId(taskId);
    try {
      await handleCompleteTask(taskId);
    } finally {
      setBusyTaskId(null);
    }
  };

  const isInitialLoad = loading || authLoading;

  return (
    <PageLayout
      title="Oppgaver"
      description="Finn en oppgave, meld deg på og send den inn når den er gjort."
      actions={
        <>
          {refreshing && !isInitialLoad && (
            <Spinner label="Oppdaterer..." className="text-subtle" />
          )}
          {canManageTaskCategories && (
            <Button
              variant="secondary"
              icon={<Settings aria-hidden="true" className="h-4 w-4" />}
              onClick={toggleCategoryManagement}
            >
              Kategorier
            </Button>
          )}
          {canCreateTasks && (
            <Button
              icon={<Plus aria-hidden="true" className="h-4 w-4" />}
              onClick={handleOpenCreateTask}
            >
              Ny oppgave
            </Button>
          )}
        </>
      }
    >
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {message && (
        <StatusMessage
          tone={message.type === 'success' ? 'success' : 'error'}
          onDismiss={clearMessage}
        >
          {message.text}
        </StatusMessage>
      )}

      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Søk etter oppgaver, kategorier eller kontaktperson..."
            label="Søk etter oppgaver"
            className="flex-1"
          />
          <SegmentedControl
            label="Vis oppgaver"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
            className="w-full md:w-auto"
          />
        </div>

        <div
          role="group"
          aria-label="Filtrer på kategori"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            type="button"
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
            className={chipClasses(category === 'all')}
          >
            Alle kategorier
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.name}
              onClick={() => setCategory(category === item.name ? 'all' : item.name)}
              className={chipClasses(category === item.name)}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {isInitialLoad ? (
        <div aria-busy="true" className="grid grid-cols-1 gap-3 md:grid-cols-1">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl md:h-14" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <TasksTable
            tasks={paginatedTasks}
            categories={categories}
            onRowClick={setSelectedTask}
            onJoinTask={(taskId) => void joinFromList(taskId)}
            onSubmitTask={setSubmitCandidate}
            busyTaskId={busyTaskId}
            currentUserId={user?.id}
            participantNames={participantNames}
          />

          {totalPages > 1 && (
            <nav
              aria-label="Sider"
              className="flex flex-col items-center justify-between gap-3 sm:flex-row"
            >
              <p className="text-sm text-muted">
                Viser {paginatedTasks.length} av {filteredTasks.length} oppgaver
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ChevronLeft aria-hidden="true" className="h-4 w-4" />}
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  Forrige
                </Button>
                <span className="px-2 text-sm tabular-nums text-muted">
                  Side {currentPage} av {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Neste
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}

      {showCategoryManagement && canManageTaskCategories && (
        <CategoryManagement
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          getCategoryUsage={getCategoryUsageCount}
          onClose={toggleCategoryManagement}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUserId={user?.id}
          userRole={user?.role}
          categoryColor={categoryColors[selectedTask.category]}
          onJoinTask={handleJoinTask}
          onLeaveTask={handleLeaveTask}
          onCompleteTask={handleCompleteTask}
          onEditTask={canCreateTasks ? handleOpenEditTask : undefined}
          onDeleteTask={canDeleteTasks ? handleDeleteTask : undefined}
          participantNames={participantNames}
        />
      )}

      {(isCreateModalOpen || !!editingTask) && (
        <TaskCreationModal
          isOpen={isCreateModalOpen || !!editingTask}
          onClose={handleCloseTaskEditor}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          categories={categories}
          currentUser={user}
          editingTask={editingTask}
          contactPeople={contactPeople}
        />
      )}

      <ConfirmDialog
        open={!!submitCandidate}
        title="Send inn til godkjenning?"
        confirmLabel="Send inn"
        onCancel={() => setSubmitCandidate(null)}
        onConfirm={() => void confirmSubmit()}
      >
        «{submitCandidate?.title}» ({submitCandidate?.hourEstimate} timer) sendes til regisjefen for
        godkjenning.
      </ConfirmDialog>
    </PageLayout>
  );
};

export default WorkTasksPage;
