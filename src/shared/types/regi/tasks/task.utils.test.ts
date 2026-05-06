import { describe, expect, it } from 'vitest';
import {
  canLeaveTaskAssignment,
  canSubmitTaskAssignment,
  canUserJoinTask,
  canUserLeaveTask,
  canUserSubmitTaskCompletion,
  getCurrentUserTaskParticipant,
  getTaskWorkflowState,
  isTaskFull,
  type Task,
} from './index';

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Testoppgave',
  category: 'Generelt',
  description: 'Beskrivelse',
  contactPersonId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  deadline: null,
  hourEstimate: 2,
  maxParticipants: 2,
  participants: [],
  createdAt: '2026-04-10T10:00:00.000Z',
  isArchived: false,
  ...overrides,
});

describe('task.utils', () => {
  it('blocks joins when the task is full or the user is already participating', () => {
    const fullTask = baseTask({
      participants: [
        {
          assignmentId: '1',
          userId: '11111111-1111-1111-1111-111111111111',
          status: 'joined',
          joinedAt: '2026-04-10T10:00:00.000Z',
        },
        {
          assignmentId: '2',
          userId: '22222222-2222-2222-2222-222222222222',
          status: 'joined',
          joinedAt: '2026-04-10T10:00:00.000Z',
        },
      ],
    });

    expect(isTaskFull(fullTask)).toBe(true);
    expect(canUserJoinTask(fullTask, '33333333-3333-3333-3333-333333333333')).toBe(false);
    expect(canUserJoinTask(fullTask, '11111111-1111-1111-1111-111111111111')).toBe(false);
  });

  it('allows leaving only while joined or after rejection', () => {
    const task = baseTask({
      participants: [
        {
          assignmentId: '1',
          userId: '11111111-1111-1111-1111-111111111111',
          status: 'rejected',
          joinedAt: '2026-04-10T10:00:00.000Z',
          hoursUsed: 2,
        },
      ],
    });

    expect(canUserLeaveTask(task, '11111111-1111-1111-1111-111111111111')).toBe(true);
    expect(canUserSubmitTaskCompletion(task, '11111111-1111-1111-1111-111111111111')).toBe(true);
    expect(
      getCurrentUserTaskParticipant(task, '11111111-1111-1111-1111-111111111111')?.status
    ).toBe('rejected');
  });

  it('uses assignment status as the shared leave and submit rule', () => {
    expect(canLeaveTaskAssignment('joined')).toBe(true);
    expect(canLeaveTaskAssignment('rejected')).toBe(true);
    expect(canLeaveTaskAssignment('submitted')).toBe(false);
    expect(canSubmitTaskAssignment('approved')).toBe(false);
  });

  it('projects task workflow state for callers that render actions', () => {
    const task = baseTask({
      participants: [
        {
          assignmentId: '1',
          userId: '11111111-1111-1111-1111-111111111111',
          status: 'joined',
          joinedAt: '2026-04-10T10:00:00.000Z',
        },
      ],
    });

    expect(getTaskWorkflowState(task, '11111111-1111-1111-1111-111111111111')).toMatchObject({
      participantCount: 1,
      isFull: false,
      canJoin: false,
      canLeave: true,
      canSubmitCompletion: true,
    });
  });
});
