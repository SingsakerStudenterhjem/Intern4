import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createUser,
  getResidentDirectoryUsers,
  getSchools,
  getStudies,
  getUser,
  updateUser,
} from './userDAO';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
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
        study_id: 'study-biotek',
        school_id: 'school-ntnu',
        studies: { name: 'Bioteknologi' },
        schools: { name: 'NTNU' },
        seniority: 4,
        room_number: 101,
        created_at: '2024-08-15T00:00:00.000Z',
        is_active: true,
        on_leave: false,
        roles: { name: 'Halv/Halv' },
      },
    ]);

    vi.mocked(supabase.from).mockImplementationOnce(() => builder);

    const result = await getResidentDirectoryUsers(true);

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(builder.select).toHaveBeenCalledWith(
      [
        'id',
        'name',
        'email',
        'phone',
        'birth_date',
        'study_id',
        'school_id',
        'studies(name)',
        'schools(name)',
        'seniority',
        'room_number',
        'created_at',
        'is_active',
        'on_leave',
        'roles(name)',
      ].join(', ')
    );
    expect(builder.eq).toHaveBeenCalledWith('is_active', true);
    expect(builder.order).toHaveBeenCalledWith('name', { ascending: true });
    expect(result).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Test Beboer En',
        email: 'test.beboer.en@example.test',
        phone: '40000001',
        birthDate: '2000-01-01',
        study: 'Bioteknologi',
        studyPlace: 'NTNU',
        seniority: 4,
        roomNumber: 101,
        createdAt: '2024-08-15T00:00:00.000Z',
        role: 'Halv/Halv',
        onLeave: false,
        isActive: true,
        address: {
          street: '',
          postalCode: '',
          city: '',
          country: undefined,
        },
      },
    ]);
  });

  it('loads inactive old residents and defaults missing optional fields', async () => {
    const builder = createResidentDirectoryBuilder([
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: null,
        street: null,
        postal_code: '7016',
        city: null,
        country: null,
        is_active: false,
      },
    ]);

    vi.mocked(supabase.from).mockImplementationOnce(() => builder);

    const result = await getResidentDirectoryUsers(false);

    expect(builder.select).toHaveBeenCalledWith(
      ['id', 'name', 'street', 'postal_code', 'city', 'country', 'is_active'].join(', ')
    );
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

describe('userDAO profile and lookup writes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a user with joined school and study names', async () => {
    const builder: any = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => ({
        data: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Test Beboer',
          email: 'test@example.test',
          phone: '40000001',
          birth_date: '2000-01-01',
          school_id: 'school-ntnu',
          study_id: 'study-data',
          schools: { name: 'NTNU' },
          studies: { name: 'Datateknologi' },
          seniority: 1,
          room_number: 101,
          on_leave: false,
          is_active: true,
          created_at: '2024-01-01T00:00:00.000Z',
        },
        error: null,
      })),
    };

    vi.mocked(supabase.from).mockImplementationOnce(() => builder);

    const result = await getUser('11111111-1111-1111-1111-111111111111');

    expect(builder.select).toHaveBeenCalledWith('*, schools(name), studies(name)');
    expect(result).toMatchObject({
      schoolId: 'school-ntnu',
      studyId: 'study-data',
      studyPlace: 'NTNU',
      study: 'Datateknologi',
    });
  });

  it('updates school_id and study_id when saving a user', async () => {
    const builder: any = {
      update: vi.fn(() => builder),
      eq: vi.fn(async () => ({ error: null })),
    };

    vi.mocked(supabase.from).mockImplementationOnce(() => builder);

    await updateUser('11111111-1111-1111-1111-111111111111', {
      name: 'Test Beboer',
      schoolId: 'school-bi',
      studyId: 'study-okad',
    });

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(builder.update).toHaveBeenCalledWith({
      name: 'Test Beboer',
      school_id: 'school-bi',
      study_id: 'study-okad',
    });
    expect(builder.eq).toHaveBeenCalledWith('id', '11111111-1111-1111-1111-111111111111');
  });

  it('passes lookup ids to the create-user function', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: {
        user: { id: '11111111-1111-1111-1111-111111111111' },
        initialPassword: 'abc123',
      },
      error: null,
    });

    const result = await createUser({
      name: 'Test Beboer',
      email: 'test@example.test',
      address: {},
      role: 'Halv/Halv',
      schoolId: 'school-ntnu',
      studyId: 'study-data',
      seniority: 0,
      roomNumber: 0,
      onLeave: false,
      isActive: true,
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('create-user', {
      body: expect.objectContaining({
        schoolId: 'school-ntnu',
        studyId: 'study-data',
      }),
    });
    expect(result).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      initialPassword: 'abc123',
    });
  });

  it('loads school and study lookup options', async () => {
    const schoolsBuilder: any = {
      select: vi.fn(() => schoolsBuilder),
      order: vi.fn(async () => ({ data: [{ id: 'school-ntnu', name: 'NTNU' }], error: null })),
    };
    const studiesBuilder: any = {
      select: vi.fn(() => studiesBuilder),
      order: vi.fn(async () => ({
        data: [{ id: 'study-data', name: 'Datateknologi' }],
        error: null,
      })),
    };

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => schoolsBuilder)
      .mockImplementationOnce(() => studiesBuilder);

    await expect(getSchools()).resolves.toEqual([{ id: 'school-ntnu', name: 'NTNU' }]);
    await expect(getStudies()).resolves.toEqual([{ id: 'study-data', name: 'Datateknologi' }]);
    expect(supabase.from).toHaveBeenNthCalledWith(1, 'schools');
    expect(supabase.from).toHaveBeenNthCalledWith(2, 'studies');
  });
});
