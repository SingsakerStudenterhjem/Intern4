import { beforeEach, describe, expect, it, vi } from 'vitest';
import { joinTask, leaveTask, submitTaskCompletion } from './tasksDAO';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function createMaybeSingleBuilder(data: any) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
  };

  return builder;
}

function createInsertBuilder() {
  return {
    insert: vi.fn(async () => ({ error: null })),
  };
}

function createDeleteBuilder() {
  const builder: any = {
    delete: vi.fn(() => builder),
    eq: vi.fn(async () => ({ error: null })),
  };

  return builder;
}

function createUpdateBuilder() {
  const builder: any = {
    update: vi.fn(() => builder),
    eq: vi.fn(async () => ({ error: null })),
  };

  return builder;
}

function createTaskRow(overrides: Partial<any> = {}) {
  return {
    id: 1,
    created_at: '2026-04-10T10:00:00.000Z',
    deadline: null,
    time_estimate: 2,
    contact_person_uuid: null,
    max_participants: 2,
    work_items: {
      title: 'Testoppgave',
      description: 'Beskrivelse',
      work_categories: { name: 'Generelt' },
      participants: [],
    },
    ...overrides,
  };
}

describe('tasksDAO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects duplicate joins before inserting an assignment', async () => {
    const fromMock = vi.mocked(supabase.from);
    fromMock
      .mockImplementationOnce(() => createMaybeSingleBuilder(createTaskRow()))
      .mockImplementationOnce(() =>
        createMaybeSingleBuilder({
          id: 5,
          user_uuid: '11111111-1111-1111-1111-111111111111',
          approved_state: 0,
          hours_used: null,
        })
      );

    await expect(joinTask('1', '11111111-1111-1111-1111-111111111111')).rejects.toThrow(
      'Du er allerede meldt på denne oppgaven'
    );
  });

  it('rejects leaving after the task has been submitted for approval', async () => {
    const fromMock = vi.mocked(supabase.from);
    fromMock.mockImplementationOnce(() =>
      createMaybeSingleBuilder({
        id: 7,
        user_uuid: '11111111-1111-1111-1111-111111111111',
        approved_state: 0,
        hours_used: 2,
      })
    );

    await expect(leaveTask('1', '11111111-1111-1111-1111-111111111111')).rejects.toThrow(
      'Du kan ikke melde deg av etter at oppgaven er sendt inn eller godkjent'
    );
  });

  it('submits task completion as a pending regi approval using the task hour estimate', async () => {
    const taskBuilder = createMaybeSingleBuilder(createTaskRow());
    const assignmentBuilder = createMaybeSingleBuilder({
      id: 9,
      user_uuid: '11111111-1111-1111-1111-111111111111',
      approved_state: 0,
      hours_used: null,
    });
    const updateBuilder = createUpdateBuilder();
    const fromMock = vi.mocked(supabase.from);

    fromMock
      .mockImplementationOnce(() => taskBuilder)
      .mockImplementationOnce(() => assignmentBuilder)
      .mockImplementationOnce(() => updateBuilder);

    await submitTaskCompletion('1', '11111111-1111-1111-1111-111111111111');

    expect(updateBuilder.update).toHaveBeenCalledWith({
      hours_used: 2,
      approved_state: 0,
      approved_by_uuid: null,
      approval_comment: null,
    });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 9);
  });
});
