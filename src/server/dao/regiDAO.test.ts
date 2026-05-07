import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addRegiLog,
  approveRegiLog,
  deletePendingRegiLog,
  getRegiLogsByUser,
  isCountableRegiAssignment,
} from './regiDAO';
import { supabase } from '../supabaseClient';
import { deleteImages } from '../storage';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./userDAO', () => ({
  getUser: vi.fn(),
}));

vi.mock('../storage', () => ({
  deleteImages: vi.fn(),
}));

type SupabaseFromResult = ReturnType<typeof supabase.from>;
type MockFn = ReturnType<typeof vi.fn>;

const mockFn = (implementation: (...args: unknown[]) => unknown): MockFn =>
  vi.fn(implementation) as unknown as MockFn;

const asSupabaseBuilder = <T extends object>(builder: T): T & SupabaseFromResult =>
  builder as T & SupabaseFromResult;

function createOrderedBuilder(data: unknown[]) {
  const builder: {
    select: MockFn;
    eq: MockFn;
    order: MockFn;
  } = {
    select: mockFn(() => builder),
    eq: mockFn(() => builder),
    order: mockFn(async () => ({ data, error: null })),
  };

  return asSupabaseBuilder(builder);
}

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

function createDeleteBuilder() {
  const builder: {
    delete: MockFn;
    eq: MockFn;
  } = {
    delete: mockFn(() => builder),
    eq: mockFn(async () => ({ error: null })),
  };

  return asSupabaseBuilder(builder);
}

function createSelectEqBuilder(data: unknown[]) {
  const builder: {
    select: MockFn;
    eq: MockFn;
  } = {
    select: mockFn(() => builder),
    eq: mockFn(async () => ({ data, error: null })),
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

function createInsertSingleBuilder(data: unknown) {
  const builder: {
    insert: MockFn;
    select: MockFn;
    single: MockFn;
  } = {
    insert: mockFn(() => builder),
    select: mockFn(() => builder),
    single: mockFn(async () => ({ data, error: null })),
  };

  return asSupabaseBuilder(builder);
}

function createInsertErrorBuilder(message: string) {
  const builder: {
    insert: MockFn;
  } = {
    insert: mockFn(async () => ({ error: new Error(message) })),
  };

  return asSupabaseBuilder(builder);
}

describe('regiDAO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteImages).mockResolvedValue(undefined);
  });

  it('counts only manual logs and submitted task assignments as regi work', () => {
    expect(
      isCountableRegiAssignment({
        hours_used: null,
        work_items: { type: 'task' },
      })
    ).toBe(false);

    expect(
      isCountableRegiAssignment({
        hours_used: 3,
        work_items: { type: 'task' },
      })
    ).toBe(true);

    expect(
      isCountableRegiAssignment({
        hours_used: 1,
        work_items: { type: 'misc' },
      })
    ).toBe(true);
  });

  it('excludes joined-but-unsubmitted task assignments from user regi logs', async () => {
    const rows = [
      {
        id: 1,
        hours_used: null,
        created_at: '2026-04-10T10:00:00.000Z',
        approved_state: 0,
        work_items: {
          title: 'Ikke sendt inn',
          type: 'task',
          work_categories: { name: 'Generelt' },
        },
      },
      {
        id: 2,
        work_id: 22,
        hours_used: 2,
        created_at: '2026-04-10T10:00:00.000Z',
        approved_state: 0,
        approval_comment: 'Ser bra ut',
        work_items: {
          title: 'Sendt inn',
          description: 'Detaljer',
          type: 'task',
          work_categories: { name: 'Generelt' },
        },
      },
    ];

    vi.mocked(supabase.from).mockImplementationOnce(() => createOrderedBuilder(rows));

    const result = await getRegiLogsByUser('11111111-1111-1111-1111-111111111111');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Sendt inn');
    expect(result[0].hours).toBe(2);
    expect(result[0].workId).toBe('22');
    expect(result[0].sourceType).toBe('task');
    expect(result[0].description).toBe('Detaljer');
    expect(result[0].reviewerComment).toBe('Ser bra ut');
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  it('deduplicates stored image paths', async () => {
    const rows = [
      {
        id: 1,
        work_id: 44,
        hours_used: 1,
        created_at: '2026-04-10T10:00:00.000Z',
        approved_state: 0,
        work_items: {
          title: 'Med bilde',
          description: 'Detaljer',
          type: 'misc',
          work_categories: { name: 'Regi' },
          work_misc: {
            image_paths: ['user/regi/one.png', 'user/regi/one.png'],
          },
        },
      },
    ];

    vi.mocked(supabase.from).mockImplementationOnce(() => createOrderedBuilder(rows));

    const result = await getRegiLogsByUser('11111111-1111-1111-1111-111111111111');

    expect(result[0].imagePaths).toEqual(['user/regi/one.png']);
  });

  it('stores approver metadata when approving regi work', async () => {
    const updateBuilder = createUpdateBuilder();
    vi.mocked(supabase.from).mockImplementationOnce(() => updateBuilder);

    await approveRegiLog('12', '22222222-2222-2222-2222-222222222222', 'Ser bra ut');

    expect(updateBuilder.update).toHaveBeenCalledWith({
      approved_state: 1,
      approved_by_uuid: '22222222-2222-2222-2222-222222222222',
      approval_comment: 'Ser bra ut',
    });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', '12');
  });

  it('creates granted regi logs as pending by default', async () => {
    const categoryBuilder = createMaybeSingleBuilder({ id: 7 });
    const workItemBuilder = createInsertSingleBuilder({ id: 44 });
    const assignmentBuilder = createInsertSingleBuilder({ id: 12 });

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => workItemBuilder)
      .mockImplementationOnce(() => assignmentBuilder);

    await addRegiLog({
      userId: '11111111-1111-1111-1111-111111111111',
      title: 'Innført av regisjef',
      description: 'Test',
      date: new Date('2026-04-21T00:00:00.000Z'),
      hours: 2,
      type: 'Regi',
    });

    expect(assignmentBuilder.insert).toHaveBeenCalledWith({
      user_uuid: '11111111-1111-1111-1111-111111111111',
      work_id: 44,
      hours_used: 2,
      approved_state: 0,
      approved_by_uuid: null,
    });
  });

  it('auto-approves granted regi logs with approver metadata', async () => {
    const categoryBuilder = createMaybeSingleBuilder({ id: 7 });
    const workItemBuilder = createInsertSingleBuilder({ id: 44 });
    const assignmentBuilder = createInsertSingleBuilder({ id: 12 });

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => workItemBuilder)
      .mockImplementationOnce(() => assignmentBuilder);

    await addRegiLog(
      {
        userId: '11111111-1111-1111-1111-111111111111',
        title: 'Innført av regisjef',
        description: 'Test',
        date: new Date('2026-04-21T00:00:00.000Z'),
        hours: 2,
        type: 'Regi',
      },
      {
        autoApprove: true,
        approvedByUuid: '22222222-2222-2222-2222-222222222222',
      }
    );

    expect(assignmentBuilder.insert).toHaveBeenCalledWith({
      user_uuid: '11111111-1111-1111-1111-111111111111',
      work_id: 44,
      hours_used: 2,
      approved_state: 1,
      approved_by_uuid: '22222222-2222-2222-2222-222222222222',
    });
  });

  it('stores image paths for manual regi logs', async () => {
    const categoryBuilder = createMaybeSingleBuilder({ id: 7 });
    const workItemBuilder = createInsertSingleBuilder({ id: 44 });
    const assignmentBuilder = createInsertSingleBuilder({ id: 12 });
    const workMiscBuilder = createInsertErrorBuilder('');
    workMiscBuilder.insert.mockResolvedValueOnce({ error: null });

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => workItemBuilder)
      .mockImplementationOnce(() => assignmentBuilder)
      .mockImplementationOnce(() => workMiscBuilder);

    await addRegiLog({
      userId: '11111111-1111-1111-1111-111111111111',
      title: 'Med bilder',
      description: 'Test',
      date: new Date('2026-04-21T00:00:00.000Z'),
      hours: 2,
      type: 'Regi',
      imagePaths: ['user/regi/one.png', 'user/regi/two.png'],
    });

    expect(supabase.from).toHaveBeenLastCalledWith('work_misc');
    expect(workMiscBuilder.insert).toHaveBeenCalledWith({
      id: 44,
      image_paths: ['user/regi/one.png', 'user/regi/two.png'],
    });
  });

  it('rolls back work rows when storing regi image metadata fails', async () => {
    const categoryBuilder = createMaybeSingleBuilder({ id: 7 });
    const workItemBuilder = createInsertSingleBuilder({ id: 44 });
    const assignmentBuilder = createInsertSingleBuilder({ id: 12 });
    const workMiscBuilder = createInsertErrorBuilder('image metadata failed');
    const deleteAssignmentBuilder = createDeleteBuilder();
    const deleteWorkItemBuilder = createDeleteBuilder();

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => categoryBuilder)
      .mockImplementationOnce(() => workItemBuilder)
      .mockImplementationOnce(() => assignmentBuilder)
      .mockImplementationOnce(() => workMiscBuilder)
      .mockImplementationOnce(() => deleteAssignmentBuilder)
      .mockImplementationOnce(() => deleteWorkItemBuilder);

    await expect(
      addRegiLog({
        userId: '11111111-1111-1111-1111-111111111111',
        title: 'Med bilder',
        description: 'Test',
        date: new Date('2026-04-21T00:00:00.000Z'),
        hours: 2,
        type: 'Regi',
        imagePaths: ['user/regi/one.png'],
      })
    ).rejects.toThrow('image metadata failed');

    expect(deleteAssignmentBuilder.eq).toHaveBeenCalledWith('id', 12);
    expect(deleteWorkItemBuilder.eq).toHaveBeenCalledWith('id', 44);
  });

  it('deletes only the current users pending manual regi log and removes its work item when orphaned', async () => {
    const assignmentBuilder = createMaybeSingleBuilder({
      id: 12,
      user_uuid: '11111111-1111-1111-1111-111111111111',
      approved_state: 0,
      work_id: 44,
      work_items: {
        type: 'misc',
        work_misc: {
          image_paths: ['user/regi/one.png', 'user/regi/two.png'],
        },
      },
    });
    const deleteAssignmentBuilder = createDeleteBuilder();
    const deleteWorkMiscBuilder = createDeleteBuilder();
    const remainingAssignmentsBuilder = createSelectEqBuilder([]);
    const deleteWorkItemBuilder = createDeleteBuilder();

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => assignmentBuilder)
      .mockImplementationOnce(() => deleteWorkMiscBuilder)
      .mockImplementationOnce(() => deleteAssignmentBuilder)
      .mockImplementationOnce(() => remainingAssignmentsBuilder)
      .mockImplementationOnce(() => deleteWorkItemBuilder);

    await deletePendingRegiLog('12', '11111111-1111-1111-1111-111111111111');

    expect(deleteImages).toHaveBeenCalledWith(['user/regi/one.png', 'user/regi/two.png']);
    expect(deleteAssignmentBuilder.delete).toHaveBeenCalled();
    expect(deleteWorkMiscBuilder.eq).toHaveBeenCalledWith('id', 44);
    expect(deleteAssignmentBuilder.eq).toHaveBeenCalledWith('id', 12);
    expect(remainingAssignmentsBuilder.eq).toHaveBeenCalledWith('work_id', 44);
    expect(deleteWorkItemBuilder.eq).toHaveBeenCalledWith('id', 44);
  });

  it('rejects deleting approved or task-backed regi logs', async () => {
    const approvedBuilder = createMaybeSingleBuilder({
      id: 12,
      user_uuid: '11111111-1111-1111-1111-111111111111',
      approved_state: 1,
      work_id: 44,
      work_items: { type: 'misc' },
    });

    vi.mocked(supabase.from).mockImplementationOnce(() => approvedBuilder);

    await expect(
      deletePendingRegiLog('12', '11111111-1111-1111-1111-111111111111')
    ).rejects.toThrow('Kun ventende registreringer kan slettes');

    vi.clearAllMocks();

    const taskBuilder = createMaybeSingleBuilder({
      id: 12,
      user_uuid: '11111111-1111-1111-1111-111111111111',
      approved_state: 0,
      work_id: 44,
      work_items: { type: 'task' },
    });

    vi.mocked(supabase.from).mockImplementationOnce(() => taskBuilder);

    await expect(
      deletePendingRegiLog('12', '11111111-1111-1111-1111-111111111111')
    ).rejects.toThrow('Oppgavebaserte registreringer må håndteres fra oppgaver');
  });
});
