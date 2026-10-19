import React from 'react';
import { Plus, Search, Settings } from 'lucide-react';
import TasksTable from '../components/TasksTable';
import TaskModal from '../components/TaskModal';
import TaskCreationModal from '../components/TaskCreationModal';
import CategoryManagement from '../components/CategoryManagement';
import { useTaskManagement } from '../hooks/useTaskManagement';
import { PageLayout } from '../../../shared/layouts';

const WorkTasksPage: React.FC = () => {
  const {
    user,
    authLoading,
    loading,
    error,
    message,
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
    categories: availableCategories,
    filteredTasks,
  } = taskList;

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Oppgaver"
      description="Se tilgjengelige oppgaver og meld deg på dem du ønsker å utføre."
      actions={
        <>
          {canManageTaskCategories && (
            <button
              onClick={toggleCategoryManagement}
              className="inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md text-muted bg-surface hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              <Settings className="w-4 h-4 mr-2" />
              Administrer kategorier
            </button>
          )}
          {canCreateTasks && (
            <button
              onClick={handleOpenCreateTask}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-fg bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ny oppgave
            </button>
          )}
        </>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-danger-subtle border border-danger-border rounded-md">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {message && (
        <div
          className={`mb-6 p-4 border rounded-md ${
            message.type === 'success'
              ? 'bg-success-subtle border-success-border text-success'
              : 'bg-danger-subtle border-danger-border text-danger'
          }`}
        >
          <p className="text-sm">{message.text}</p>
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

      <div className="bg-surface rounded-lg shadow">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
              <input
                type="text"
                placeholder="Søk etter oppgaver..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="all">Alle kategorier</option>
              {availableCategories
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="available"
                  name="filter"
                  value="available"
                  checked={filter === 'available'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-ring border-input"
                />
                <label htmlFor="available" className="ml-2 text-sm text-muted">
                  Ledige
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="myTasks"
                  name="filter"
                  value="myTasks"
                  checked={filter === 'myTasks'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-ring border-input"
                />
                <label htmlFor="myTasks" className="ml-2 text-sm text-muted">
                  Mine
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="all"
                  name="filter"
                  value="all"
                  checked={filter === 'all'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-ring border-input"
                />
                <label htmlFor="all" className="ml-2 text-sm text-muted">
                  Alle
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <TasksTable
            tasks={paginatedTasks}
            onRowClick={setSelectedTask}
            onJoinTask={handleJoinTask}
            currentUserId={user?.id}
            participantNames={participantNames}
          />

          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted">
                  Viser {paginatedTasks.length} av {filteredTasks.length} oppgaver
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-subtle bg-surface border border-input rounded-md hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forrige
                </button>
                <span className="px-3 py-2 text-sm text-muted">
                  Side {currentPage} av {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-subtle bg-surface border border-input rounded-md hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Neste
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUserId={user?.id}
          userRole={user?.role}
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
    </PageLayout>
  );
};

export default WorkTasksPage;
