import { Task, TaskParticipant } from './task.types';

export const getCurrentUserTaskParticipant = (
  task: Task,
  userId?: string
): TaskParticipant | undefined => {
  if (!userId) return undefined;
  return task.participants.find((participant) => participant.userId === userId);
};

export const getTaskParticipantCount = (task: Task): number => {
  return task.participants.length;
};

export const isTaskFull = (task: Task): boolean => {
  return getTaskParticipantCount(task) >= task.maxParticipants;
};

export const canUserJoinTask = (task: Task, userId?: string): boolean => {
  if (task.isArchived || !userId) return false;
  return !isTaskFull(task) && !getCurrentUserTaskParticipant(task, userId);
};

export const canUserLeaveTask = (task: Task, userId?: string): boolean => {
  const participant = getCurrentUserTaskParticipant(task, userId);
  return participant?.status === 'joined' || participant?.status === 'rejected';
};

export const canUserSubmitTaskCompletion = (task: Task, userId?: string): boolean => {
  const participant = getCurrentUserTaskParticipant(task, userId);
  return (
    !!task.hourEstimate && (participant?.status === 'joined' || participant?.status === 'rejected')
  );
};
