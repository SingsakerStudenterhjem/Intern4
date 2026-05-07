import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getTasksByUser, joinTask, leaveTask, submitTaskCompletion } from './tasksDAO';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

type SupabaseFromResult = ReturnType<typeof supabase.from>;
type MockFn = ReturnType<typeof vi.fn>;

const mockFn = (implementation: (...args: unknown[]) => unknown): MockFn =>
  vi.fn(implementation) as unknown as MockFn;

const asSupabaseBuilder = <T extends object>(builder: T): T & SupabaseFromResult =>
  builder as T & SupabaseFromResult;

function createMaybeSingleBuilder(data: unknown) {
  const builder: {
    select: MockFn;
    eq: MockFn;
    maybeSingle: MockFn;
  } = {
    select: mockFn(() => builder),
    eq: mockFn(() => builder),
    maybeSingle: mockFn(async () => ({ data, error: null })),
  };

  return asSupabaseBuilder(builder);
}

function createUpdateBuilder() {
  const builder: {
    update: MockFn;
    eq: MockFn;
  } = {
    update: mockFn(() => builder),
    eq: mockFn(async () => ({ error: null })),
  };

  return asSupabaseBuilder(builder);
}

function createEqSelectBuilder(data: unknown[]) {
  const builder: {
    select: MockFn;
    eq: MockFn;
  } = {
    select: mockFn(() => builder),
    eq: mockFn(async () => ({ data, error: null })),
  };

  return asSupabaseBuilder(builder);
}

function createInOrderBuilder(data: unknown[]) {
  const builder: {
    select: MockFn;
    in: MockFn;
    order: MockFn;
  } = {
    select: mockFn(() => builder),
    in: mockFn(() => builder),
    order: mockFn(async () => ({ data, error: null })),
  };

  return asSupabaseBuilder(builder);
}

function createTaskRow(overrides: Record<string, unknown> = {}) {
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

  afterEach(() => {
    vi.useRealTimers();
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T22:30:00.000Z'));

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
      performed_at: '2026-04-21',
      approved_state: 0,
      approved_by_uuid: null,
      approval_comment: null,
    });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 9);
  });

  it('queries only the current user assignment task ids in getTasksByUser', async () => {
    const assignmentsBuilder = createEqSelectBuilder([
      { work_id: 1 },
      { work_id: 2 },
      { work_id: 1 },
    ]);
    const tasksBuilder = createInOrderBuilder([
      createTaskRow({
        id: 1,
        work_items: {
          title: 'Oppgave 1',
          description: 'Beskrivelse',
          work_categories: { name: 'Generelt' },
          participants: [
            {
              id: 10,
              user_uuid: '11111111-1111-1111-1111-111111111111',
              hours_used: null,
              approved_state: 0,
              approval_comment: null,
              approved_by_uuid: null,
              created_at: '2026-04-10T10:00:00.000Z',
            },
          ],
        },
      }),
      createTaskRow({
        id: 2,
        work_items: {
          title: 'Oppgave 2',
          description: 'Beskrivelse',
          work_categories: { name: 'Generelt' },
          participants: [
            {
              id: 11,
              user_uuid: '11111111-1111-1111-1111-111111111111',
              hours_used: 2,
              approved_state: 0,
              approval_comment: null,
              approved_by_uuid: null,
              created_at: '2026-04-10T10:00:00.000Z',
            },
          ],
        },
      }),
    ]);
    const fromMock = vi.mocked(supabase.from);

    fromMock
      .mockImplementationOnce(() => assignmentsBuilder)
      .mockImplementationOnce(() => tasksBuilder);

    const result = await getTasksByUser('11111111-1111-1111-1111-111111111111');

    expect(assignmentsBuilder.eq).toHaveBeenCalledWith(
      'user_uuid',
      '11111111-1111-1111-1111-111111111111'
    );
    expect(tasksBuilder.in).toHaveBeenCalledWith('id', [1, 2]);
    expect(result.map((task) => task.id)).toEqual(['1', '2']);
  });
});
