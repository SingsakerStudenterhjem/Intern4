import { beforeEach, describe, expect, it, vi } from 'vitest';
import { approveRegiLog, getRegiLogsByUser, isCountableRegiAssignment } from './regiDAO';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./userDAO', () => ({
  getUser: vi.fn(),
}));

function createOrderedBuilder(data: any[]) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(async () => ({ data, error: null })),
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

describe('regiDAO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        hours_used: 2,
        created_at: '2026-04-10T10:00:00.000Z',
        approved_state: 0,
        work_items: {
          title: 'Sendt inn',
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
});
