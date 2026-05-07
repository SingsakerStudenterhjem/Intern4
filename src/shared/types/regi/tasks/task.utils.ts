import { Task, TaskAssignmentStatus, TaskParticipant } from './task.types';

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
  return participant ? canLeaveTaskAssignment(participant.status) : false;
};

export const canUserSubmitTaskCompletion = (task: Task, userId?: string): boolean => {
  const participant = getCurrentUserTaskParticipant(task, userId);
  return !!task.hourEstimate && !!participant && canSubmitTaskAssignment(participant.status);
};

const canReworkTaskAssignment = (status: TaskAssignmentStatus): boolean => {
  return status === 'joined' || status === 'rejected';
};

export const canLeaveTaskAssignment = (status: TaskAssignmentStatus): boolean => {
  return canReworkTaskAssignment(status);
};

export const canSubmitTaskAssignment = (status: TaskAssignmentStatus): boolean => {
  return canReworkTaskAssignment(status);
};

export type TaskWorkflowState = {
  currentParticipant?: TaskParticipant;
  participantCount: number;
  isFull: boolean;
  canJoin: boolean;
  canLeave: boolean;
  canSubmitCompletion: boolean;
};

export const getTaskWorkflowState = (task: Task, userId?: string): TaskWorkflowState => {
  const currentParticipant = getCurrentUserTaskParticipant(task, userId);
  const participantCount = getTaskParticipantCount(task);
  const isFull = participantCount >= task.maxParticipants;

  return {
    currentParticipant,
    participantCount,
    isFull,
    canJoin: !task.isArchived && !!userId && !isFull && !currentParticipant,
    canLeave: currentParticipant ? canLeaveTaskAssignment(currentParticipant.status) : false,
    canSubmitCompletion:
      !!task.hourEstimate &&
      !!currentParticipant &&
      canSubmitTaskAssignment(currentParticipant.status),
  };
};
