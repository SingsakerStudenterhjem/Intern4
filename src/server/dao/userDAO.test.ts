import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getResidentDirectoryUsers } from './userDAO';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function createResidentDirectoryBuilder(data: any[]) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(async () => ({ data, error: null })),
  };

  return builder;
}

describe('userDAO resident directory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads active resident directory rows with full contact and study fields', async () => {
    const builder = createResidentDirectoryBuilder([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Test Beboer En',
        email: 'test.beboer.en@example.test',
        phone: '40000001',
        birth_date: '2000-01-01',
        study_program: 'BioTek',
        place_of_education: 'NTNU',
        seniority: 4,
        room_number: 101,
        created_at: '2024-08-15T00:00:00.000Z',
        street: 'Testgata 1',
        postal_code: '7000',
        city: 'Testby',
        country: 'Testland',
        is_active: true,
        on_leave: false,
        roles: { name: 'Halv/Halv' },
      },
    ]);

    vi.mocked(supabase.from).mockImplementationOnce(() => builder);

    const result = await getResidentDirectoryUsers(true);

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(builder.eq).toHaveBeenCalledWith('is_active', true);
    expect(builder.order).toHaveBeenCalledWith('name', { ascending: true });
    expect(result).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Test Beboer En',
        email: 'test.beboer.en@example.test',
        phone: '40000001',
        birthDate: '2000-01-01',
        study: 'BioTek',
        studyPlace: 'NTNU',
        seniority: 4,
        roomNumber: 101,
        createdAt: '2024-08-15T00:00:00.000Z',
        role: 'Halv/Halv',
        onLeave: false,
        isActive: true,
        address: {
          street: 'Testgata 1',
          postalCode: '7000',
          city: 'Testby',
          country: 'Testland',
        },
      },
    ]);
  });

  it('loads inactive old residents and defaults missing optional fields', async () => {
    const builder = createResidentDirectoryBuilder([
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: null,
        email: null,
        phone: null,
        birth_date: null,
        study_program: null,
        place_of_education: null,
        seniority: null,
        room_number: null,
        created_at: null,
        street: null,
        postal_code: '7016',
        city: null,
        country: null,
        is_active: false,
        on_leave: null,
        roles: null,
      },
    ]);

    vi.mocked(supabase.from).mockImplementationOnce(() => builder);

    const result = await getResidentDirectoryUsers(false);

    expect(builder.eq).toHaveBeenCalledWith('is_active', false);
    expect(result[0]).toMatchObject({
      name: 'Ukjent',
      email: '',
      phone: '',
      birthDate: null,
      study: '',
      studyPlace: '',
      seniority: 0,
      roomNumber: null,
      createdAt: null,
      role: undefined,
      onLeave: false,
      isActive: false,
      address: {
        street: '',
        postalCode: '7016',
        city: '',
        country: undefined,
      },
    });
  });
});
