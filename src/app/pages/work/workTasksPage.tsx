import React from 'react';
import { Plus, Search, Settings } from 'lucide-react';
import TasksTable from '../../components/regi/Tasks/TasksTable';
import TaskModal from '../../components/regi/Tasks/TaskModal';
import TaskCreationModal from '../../components/regi/Tasks/TaskCreationModal';
import CategoryManagement from '../../components/admin/CategoryManagement';
import { useTaskManagement } from '../../hooks/useTaskManagement';

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Oppgaver</h1>
              <p className="text-gray-600 mt-1">
                Se tilgjengelige oppgaver og meld deg på dem du ønsker å utføre.
              </p>
            </div>
            <div className="flex space-x-3">
              {canManageTaskCategories && (
                <button
                  onClick={toggleCategoryManagement}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administrer kategorier
                </button>
              )}
              {canCreateTasks && (
                <button
                  onClick={handleOpenCreateTask}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ny oppgave
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 border rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {showCategoryManagement && canManageTaskCategories && (
          <div className="mb-8">
            <CategoryManagement
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              getCategoryUsage={getCategoryUsageCount}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Søk etter oppgaver..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="myTasks" className="ml-2 text-sm text-gray-700">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="all" className="ml-2 text-sm text-gray-700">
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
                  <p className="text-sm text-gray-700">
                    Viser {paginatedTasks.length} av {filteredTasks.length} oppgaver
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forrige
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Side {currentPage} av {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Neste
                  </button>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
};

export default WorkTasksPage;
