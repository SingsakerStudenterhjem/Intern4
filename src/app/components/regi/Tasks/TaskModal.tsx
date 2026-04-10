import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Pencil, Trash2, User, Users, X } from 'lucide-react';
import {
  TaskModalProps,
  canUserJoinTask,
  canUserLeaveTask,
  canUserSubmitTaskCompletion,
  getCurrentUserTaskParticipant,
  getTaskParticipantCount,
  isTaskFull,
} from '../../../../shared/types/regi/tasks';
import { canManageTasks, canViewAllParticipants } from '../../../constants/userRoles.ts';

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

  const formatDeadline = (deadline: any) => {
    if (!deadline) return 'Ingen frist';

    if (deadline?.seconds) {
      return new Date(deadline.seconds * 1000).toLocaleString('no-NO');
    }

    if (typeof deadline === 'string') {
      return new Date(deadline).toLocaleString('no-NO');
    }

    return 'Ugyldig dato';
  };

  const currentParticipant = getCurrentUserTaskParticipant(task, currentUserId);
  const participantCount = getTaskParticipantCount(task);
  const taskIsFull = isTaskFull(task);
  const canJoin = canUserJoinTask(task, currentUserId);
  const canLeave = canUserLeaveTask(task, currentUserId);
  const canSubmitCompletion = canUserSubmitTaskCompletion(task, currentUserId);

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
    const colors: { [key: string]: string } = {
      Generelt: 'bg-blue-100 text-blue-800 border-blue-200',
      Dataarbeid: 'bg-purple-100 text-purple-800 border-purple-200',
      Kjøkken: 'bg-green-100 text-green-800 border-green-200',
      Vedlikehold: 'bg-orange-100 text-orange-800 border-orange-200',
      Arrangement: 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Rediger oppgave"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            {canManageTasks(userRole) && (
              <button
                onClick={startDelete}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Slett oppgave"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                <h3 className="text-sm font-medium text-gray-900 mb-2">Beskrivelse</h3>
                <p className="text-gray-700 leading-relaxed">
                  {task.description || 'Ingen beskrivelse tilgjengelig.'}
                </p>
              </div>

              {/* Participants section */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
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
                            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {participantNames[participant.userId] || 'Ukjent bruker'}
                            </span>
                            {participant.userId === currentUserId && (
                              <span className="text-xs text-blue-600">(deg)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Ingen deltakere </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      {participantCount} person{participantCount !== 1 ? 'er' : ''}{' '}
                      påmeldt av {task.maxParticipants} plasser
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Kontaktperson:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">
                  {task.contactPersonId ? participantNames[task.contactPersonId] ?? 'Ukjent bruker' : '-'}
                </p>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Frist:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{formatDeadline(task.deadline)}</p>

                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Estimert tid:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">
                  {task.hourEstimate ? `${task.hourEstimate} timer` : 'Ikke spesifisert'}
                </p>

                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Kapasitet:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">Maks {task.maxParticipants} personer</p>
              </div>

              {/* Status indicators */}
              <div className="space-y-2">
                {currentParticipant?.status === 'approved' && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Godkjent som regi</span>
                  </div>
                )}

                {taskIsFull && !currentParticipant && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">Full</span>
                  </div>
                )}

                {currentParticipant?.status === 'joined' && (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Du er påmeldt</span>
                  </div>
                )}

                {currentParticipant?.status === 'submitted' && (
                  <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800">Sendt inn til godkjenning</span>
                  </div>
                )}

                {currentParticipant?.status === 'rejected' && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">Avvist, send inn på nytt</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {isCompleting ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  Er du sikker på at du vil sende denne oppgaven inn til godkjenning?
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelComplete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmComplete}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Send inn til godkjenning
                </button>
              </div>
            </div>
          ) : isDeleting ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Slett oppgave</p>
                <p className="text-sm text-gray-500 mt-1">
                  Er du sikker på at du vil slette oppgaven? Denne handlingen kan ikke angres.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Slett oppgave
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Lukk
              </button>

              <div className="flex space-x-3">
                {canJoin && onJoinTask && (
                  <button
                    onClick={handleJoin}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Meld deg på
                  </button>
                )}

                {canSubmitCompletion && (
                  <button
                    onClick={startComplete}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Send inn til godkjenning
                  </button>
                )}
                {canLeave && (
                  <button
                    onClick={handleLeave}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
