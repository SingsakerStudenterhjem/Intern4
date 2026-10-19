import React from 'react';
import { Users, Clock, Calendar, User } from 'lucide-react';
import { Task, getTaskWorkflowState } from '../../../shared/types/regi/tasks';
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
    const workflow = getTaskWorkflowState(task, currentUserId);
    const max = task.maxParticipants;
    return {
      text: `${workflow.participantCount}/${max}`,
      isFull: workflow.isFull,
      currentParticipant: workflow.currentParticipant,
      canJoin: workflow.canJoin,
    };
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Generelt: 'bg-primary-subtle text-primary-subtle-fg',
      Dataarbeid: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
      Kjøkken: 'bg-success-subtle text-success-subtle-fg',
      Vedlikehold: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
      Arrangement: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200',
    };
    return colors[category] || 'bg-surface-muted text-fg';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-surface rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-surface-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              Oppgave
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Kontakt</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Frist</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Timer</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Deltakere</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
              Handling
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {tasks.map((task) => {
            const participantStatus = getParticipantStatus(task);

            return (
              <tr
                key={task.id}
                onClick={() => onRowClick && onRowClick(task)}
                className="cursor-pointer hover:bg-surface-muted transition-colors duration-150"
              >
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <div className="font-medium text-fg">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-subtle truncate max-w-xs">
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
                <td className="px-4 py-4 text-sm text-fg">
                  {task.contactPersonId
                    ? (participantNames[task.contactPersonId] ?? 'Ukjent bruker')
                    : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-fg">{formatDeadline(task.deadline)}</td>
                <td className="px-4 py-4 text-sm text-fg">
                  {task.hourEstimate ? `${task.hourEstimate}t` : '-'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        participantStatus.isFull ? 'text-danger' : 'text-fg'
                      }`}
                    >
                      {participantStatus.text}
                    </span>
                    {participantStatus.currentParticipant?.status === 'joined' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-subtle text-success-subtle-fg">
                        Påmeldt
                      </span>
                    )}
                    {participantStatus.currentParticipant?.status === 'submitted' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-subtle text-warning-subtle-fg">
                        Sendt inn
                      </span>
                    )}
                    {participantStatus.currentParticipant?.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-subtle text-primary-subtle-fg">
                        Godkjent
                      </span>
                    )}
                    {participantStatus.currentParticipant?.status === 'rejected' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-subtle text-danger-subtle-fg">
                        Avvist
                      </span>
                    )}
                    {participantStatus.isFull && !participantStatus.currentParticipant && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-subtle text-danger-subtle-fg">
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
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-fg bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors duration-150"
                    >
                      Meld deg på
                    </button>
                  )}
                  {participantStatus.currentParticipant?.status === 'joined' && (
                    <span className="text-xs text-success font-medium">Du er påmeldt</span>
                  )}
                  {participantStatus.currentParticipant?.status === 'submitted' && (
                    <span className="text-xs text-warning-subtle-fg font-medium">Sendt inn</span>
                  )}
                  {participantStatus.currentParticipant?.status === 'approved' && (
                    <span className="text-xs text-primary font-medium">Godkjent</span>
                  )}
                  {participantStatus.currentParticipant?.status === 'rejected' && (
                    <span className="text-xs text-danger font-medium">Avvist</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-subtle" />
          <h3 className="mt-2 text-sm font-medium text-fg">Ingen oppgaver</h3>
          <p className="mt-1 text-sm text-subtle">Ingen oppgaver matcher dine søkekriterier.</p>
        </div>
      )}
    </div>
  );
};

export default TasksTable;
