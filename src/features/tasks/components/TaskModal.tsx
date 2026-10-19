import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Pencil, Trash2, User, Users, X } from 'lucide-react';
import { getTaskWorkflowState } from '../../../shared/types/regi/tasks';
import { canManageTasks, canViewAllParticipants } from '../permissions';
import { TaskModalProps } from './types';
import { formatDateTime } from '../../../shared/utils/date';

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  onClose,
  currentUserId,
  userRole,
  onJoinTask,
  onLeaveTask,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
  participantNames = {},
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!task) return null;

  const formatDeadline = (deadline: NonNullable<TaskModalProps['task']>['deadline']) =>
    formatDateTime(deadline, deadline ? 'Ugyldig dato' : 'Ingen frist');

  const {
    currentParticipant,
    participantCount,
    isFull: taskIsFull,
    canJoin,
    canLeave,
    canSubmitCompletion,
  } = getTaskWorkflowState(task, currentUserId);

  const handleJoin = () => {
    if (onJoinTask && task.id) {
      onJoinTask(task.id);
    }
  };

  const handleLeave = () => {
    if (canLeave && onLeaveTask && task.id) {
      onLeaveTask(task.id);
    }
  };

  const startComplete = () => {
    setIsCompleting(true);
  };

  const cancelComplete = () => {
    setIsCompleting(false);
  };

  const confirmComplete = () => {
    if (canSubmitCompletion && onCompleteTask && task.id) {
      onCompleteTask(task.id);
    }
    setIsCompleting(false);
  };

  const startDelete = () => {
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  const confirmDelete = () => {
    if (onDeleteTask && task.id) {
      onDeleteTask(task.id);
    }
    setIsDeleting(false);
  };

  const getCategoryColor = (category: string) => {
    // FIXME: remove hardcoded
    const colors: { [key: string]: string } = {
      Generelt: 'bg-primary-subtle text-primary-subtle-fg border-primary/25',
      Dataarbeid:
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-900',
      Kjøkken: 'bg-success-subtle text-success-subtle-fg border-success-border',
      Vedlikehold:
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-900',
      Arrangement:
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-200 dark:border-pink-900',
    };
    return colors[category] || 'bg-surface-muted text-fg border-border';
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-fg">{task.title}</h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}
            >
              {task.category}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {canManageTasks(userRole) && onEditTask && (
              <button
                onClick={() => onEditTask(task)}
                className="text-subtle hover:text-muted transition-colors"
                title="Rediger oppgave"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            {canManageTasks(userRole) && (
              <button
                onClick={startDelete}
                className="text-danger hover:text-danger transition-colors"
                title="Slett oppgave"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="text-subtle hover:text-muted transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-fg mb-2">Beskrivelse</h3>
                <p className="text-muted leading-relaxed">
                  {task.description || 'Ingen beskrivelse tilgjengelig.'}
                </p>
              </div>

              {/* Participants section */}
              <div>
                <h3 className="text-sm font-medium text-fg mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Deltakere ({participantCount}/{task.maxParticipants})
                </h3>

                {canViewAllParticipants(userRole) ? (
                  <div className="space-y-2">
                    {participantCount > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {task.participants.map((participant) => (
                          <div
                            key={participant.assignmentId}
                            className="flex items-center space-x-2 p-2 bg-surface-muted rounded-md"
                          >
                            <div className="w-8 h-8 bg-primary-subtle rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-fg">
                              {participantNames[participant.userId] || 'Ukjent bruker'}
                            </span>
                            {participant.userId === currentUserId && (
                              <span className="text-xs text-primary">(deg)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-subtle italic">Ingen deltakere </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-surface-muted rounded-md">
                    <p className="text-sm text-muted">
                      {participantCount} person{participantCount !== 1 ? 'er' : ''} påmeldt av{' '}
                      {task.maxParticipants} plasser
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-surface-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-subtle" />
                  <span className="font-medium text-muted">Kontaktperson:</span>
                </div>
                <p className="text-sm text-fg ml-6">
                  {task.contactPersonId
                    ? (participantNames[task.contactPersonId] ?? 'Ukjent bruker')
                    : '-'}
                </p>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-subtle" />
                  <span className="font-medium text-muted">Frist:</span>
                </div>
                <p className="text-sm text-fg ml-6">{formatDeadline(task.deadline)}</p>

                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-subtle" />
                  <span className="font-medium text-muted">Estimert tid:</span>
                </div>
                <p className="text-sm text-fg ml-6">
                  {task.hourEstimate ? `${task.hourEstimate} timer` : 'Ikke spesifisert'}
                </p>

                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-subtle" />
                  <span className="font-medium text-muted">Kapasitet:</span>
                </div>
                <p className="text-sm text-fg ml-6">Maks {task.maxParticipants} personer</p>
              </div>

              {/* Status indicators */}
              <div className="space-y-2">
                {currentParticipant?.status === 'approved' && (
                  <div className="flex items-center space-x-2 p-2 bg-success-subtle border border-success-border rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success-subtle-fg">
                      Godkjent som regi
                    </span>
                  </div>
                )}

                {taskIsFull && !currentParticipant && (
                  <div className="flex items-center space-x-2 p-2 bg-danger-subtle border border-danger-border rounded-md">
                    <div className="w-2 h-2 bg-danger rounded-full"></div>
                    <span className="text-sm font-medium text-danger-subtle-fg">Full</span>
                  </div>
                )}

                {currentParticipant?.status === 'joined' && (
                  <div className="flex items-center space-x-2 p-2 bg-primary-subtle border border-primary/25 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium text-primary-subtle-fg">
                      Du er påmeldt
                    </span>
                  </div>
                )}

                {currentParticipant?.status === 'submitted' && (
                  <div className="flex items-center space-x-2 p-2 bg-warning-subtle border border-warning-border rounded-md">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-sm font-medium text-warning-subtle-fg">
                      Sendt inn til godkjenning
                    </span>
                  </div>
                )}

                {currentParticipant?.status === 'rejected' && (
                  <div className="flex items-center space-x-2 p-2 bg-danger-subtle border border-danger-border rounded-md">
                    <div className="w-2 h-2 bg-danger rounded-full"></div>
                    <span className="text-sm font-medium text-danger-subtle-fg">
                      Avvist, send inn på nytt
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-surface-muted border-t border-border rounded-b-lg">
          {isCompleting ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted">
                  Er du sikker på at du vil sende denne oppgaven inn til godkjenning?
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelComplete}
                  className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmComplete}
                  className="px-4 py-2 text-sm font-medium text-success-fg bg-success border border-transparent rounded-md hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors"
                >
                  Send inn til godkjenning
                </button>
              </div>
            </div>
          ) : isDeleting ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-subtle mb-3">
                  <Trash2 className="h-6 w-6 text-danger" />
                </div>
                <p className="text-sm font-medium text-fg">Slett oppgave</p>
                <p className="text-sm text-subtle mt-1">
                  Er du sikker på at du vil slette oppgaven? Denne handlingen kan ikke angres.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-danger-fg bg-danger border border-transparent rounded-md hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger transition-colors"
                >
                  Slett oppgave
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
              >
                Lukk
              </button>

              <div className="flex space-x-3">
                {canJoin && onJoinTask && (
                  <button
                    onClick={handleJoin}
                    className="px-4 py-2 text-sm font-medium text-primary-fg bg-primary border border-transparent rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                  >
                    Meld deg på
                  </button>
                )}

                {canSubmitCompletion && onCompleteTask && (
                  <button
                    onClick={startComplete}
                    className="px-4 py-2 text-sm font-medium text-success-fg bg-success border border-transparent rounded-md hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors"
                  >
                    Send inn til godkjenning
                  </button>
                )}
                {canLeave && onLeaveTask && (
                  <button
                    onClick={handleLeave}
                    className="px-4 py-2 text-sm font-medium text-danger-fg bg-danger border border-transparent rounded-md hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger transition-colors"
                  >
                    Meld deg av
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
