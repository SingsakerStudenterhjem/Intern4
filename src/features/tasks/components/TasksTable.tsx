import React from 'react';
import { Users, Clock, Calendar, User } from 'lucide-react';
import {
  Task,
  canUserJoinTask,
  getCurrentUserTaskParticipant,
  getTaskParticipantCount,
  isTaskFull,
} from '../../../shared/types/regi/tasks';
import { TasksTableProps } from './types';
import { formatDate } from '../../../shared/utils/date';

const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onRowClick,
  onJoinTask,
  currentUserId,
  participantNames = {},
}) => {
  const formatDeadline = (deadline: Task['deadline']) =>
    formatDate(deadline, deadline ? 'Ugyldig dato' : 'Ingen frist');

  const getParticipantStatus = (task: Task) => {
    const currentParticipant = getCurrentUserTaskParticipant(task, currentUserId);
    const count = getTaskParticipantCount(task);
    const max = task.maxParticipants;
    const full = isTaskFull(task);
    return {
      text: `${count}/${max}`,
      isFull: full,
      currentParticipant,
      canJoin: canUserJoinTask(task, currentUserId),
    };
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Generelt: 'bg-blue-100 text-blue-800',
      Dataarbeid: 'bg-purple-100 text-purple-800',
      Kjøkken: 'bg-green-100 text-green-800',
      Vedlikehold: 'bg-orange-100 text-orange-800',
      Arrangement: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Oppgave
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Kontakt</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Frist</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Timer</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Deltakere</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Handling
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => {
            const participantStatus = getParticipantStatus(task);

            return (
              <tr
                key={task.id}
                onClick={() => onRowClick && onRowClick(task)}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description.length > 50
                          ? `${task.description.substring(0, 50)}...`
                          : task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}
                  >
                    {task.category}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {task.contactPersonId
                    ? (participantNames[task.contactPersonId] ?? 'Ukjent bruker')
                    : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">{formatDeadline(task.deadline)}</td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {task.hourEstimate ? `${task.hourEstimate}t` : '-'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        participantStatus.isFull ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {participantStatus.text}
                    </span>
                    {participantStatus.currentParticipant?.status === 'joined' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Påmeldt
                      </span>
                    )}
                    {participantStatus.currentParticipant?.status === 'submitted' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sendt inn
                      </span>
                    )}
                    {participantStatus.currentParticipant?.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Godkjent
                      </span>
                    )}
                    {participantStatus.currentParticipant?.status === 'rejected' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Avvist
                      </span>
                    )}
                    {participantStatus.isFull && !participantStatus.currentParticipant && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Full
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {participantStatus.canJoin && onJoinTask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoinTask(task.id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                    >
                      Meld deg på
                    </button>
                  )}
                  {participantStatus.currentParticipant?.status === 'joined' && (
                    <span className="text-xs text-green-600 font-medium">Du er påmeldt</span>
                  )}
                  {participantStatus.currentParticipant?.status === 'submitted' && (
                    <span className="text-xs text-yellow-700 font-medium">Sendt inn</span>
                  )}
                  {participantStatus.currentParticipant?.status === 'approved' && (
                    <span className="text-xs text-blue-700 font-medium">Godkjent</span>
                  )}
                  {participantStatus.currentParticipant?.status === 'rejected' && (
                    <span className="text-xs text-red-700 font-medium">Avvist</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen oppgaver</h3>
          <p className="mt-1 text-sm text-gray-500">Ingen oppgaver matcher dine søkekriterier.</p>
        </div>
      )}
    </div>
  );
};

export default TasksTable;
