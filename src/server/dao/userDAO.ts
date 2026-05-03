import { supabase } from '../supabaseClient';
import { User, NewUserInput } from '../../shared/types/user';

function toAppUser(row: any): User {
  return {
    name: row.name ?? '',
    email: row.email ?? '',
    birthDate: row.birth_date ?? null,
    phone: row.phone ?? '',
    address: {
      street: row.street ?? '',
      postalCode: row.postal_code ?? '',
      city: row.city ?? '',
      country: row.country,
    },
    profilePicture: row.profile_picture ?? '',
    studyPlace: row.place_of_education ?? '',
    study: row.study_program ?? 'annet',
    seniority: row.seniority ?? 0,
    roomNumber: row.room_number ?? 0,
    onLeave: row.on_leave ?? false,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    role: 'Halv/Halv',
  };
}

export async function getUser(uid: string): Promise<User | undefined> {
  const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toAppUser(data) : undefined;
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  const payload: any = {
    name: data.name,
    email: data.email,
    birth_date: data.birthDate ?? undefined,
    phone: data.phone,
    place_of_education: data.studyPlace,
    profile_picture: data.profilePicture,
    study_program: data.study,
    seniority: data.seniority,
    room_number: data.roomNumber,
    on_leave: data.onLeave,
    is_active: data.isActive,
    street: data.address?.street,
    postal_code: data.address?.postalCode,
    city: data.address?.city,
    country: data.address?.country,
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from('users').update(payload).eq('id', uid);
  if (error) throw new Error('kunne ikke oppdatere beboer');
}

export async function createUser(
  data: NewUserInput
): Promise<{ id: string; initialPassword?: string }> {
  const payload = {
    email: data.email,
    name: data.name,
    phone: data.phone,
    birthDate: data.birthDate ? data.birthDate.toISOString().slice(0, 10) : undefined,
    address: {
      street: data.address?.street,
      postalCode: data.address?.postalCode,
      city: data.address?.city,
      country: data.address?.country,
    },
    study: data.study,
    studyPlace: data.studyPlace,
    profilePicture: data.profilePicture,
    seniority: data.seniority,
    roomNumber: data.roomNumber,
    onLeave: data.onLeave,
    isActive: data.isActive,
    role: data.role,
  };

  const { data: result, error } = await supabase.functions.invoke('create-user', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message ?? 'Kunne ikke opprette beboer');
  }

  const anyResult = result as any;
  return {
    id: anyResult.user.id as string,
    initialPassword: anyResult.initialPassword as string | undefined,
  };
}

export type BasicUserWithRole = {
  id: string;
  name: string;
  email: string;
  role?: string;
  onLeave: boolean;
  isActive: boolean;
};

export type ResidentDirectoryUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string | null;
  study: string;
  studyPlace: string;
  seniority: number;
  roomNumber: number | null;
  createdAt: string | null;
  role?: string;
  onLeave: boolean;
  isActive: boolean;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country?: string;
  };
};

function toResidentDirectoryUser(row: any): ResidentDirectoryUser {
  return {
    id: row.id,
    name: row.name ?? 'Ukjent',
    email: row.email ?? '',
    phone: row.phone ?? '',
    birthDate: row.birth_date ?? null,
    study: row.study_program ?? '',
    studyPlace: row.place_of_education ?? '',
    seniority: row.seniority ?? 0,
    roomNumber: row.room_number ?? null,
    createdAt: row.created_at ?? null,
    role: row.roles?.name ?? undefined,
    onLeave: row.on_leave ?? false,
    isActive: row.is_active ?? false,
    address: {
      street: row.street ?? '',
      postalCode: row.postal_code ?? '',
      city: row.city ?? '',
      country: row.country ?? undefined,
    },
  };
}

export async function getResidentDirectoryUsers(
  isActive: boolean
): Promise<ResidentDirectoryUser[]> {
  const activeResidentColumns = [
    'id',
    'name',
    'email',
    'phone',
    'birth_date',
    'study_program',
    'place_of_education',
    'seniority',
    'room_number',
    'created_at',
    'is_active',
    'on_leave',
    'roles(name)',
  ];
  const oldResidentColumns = [
    'id',
    'name',
    'street',
    'postal_code',
    'city',
    'country',
    'is_active',
  ];

  const { data, error } = await supabase
    .from('users')
    .select((isActive ? activeResidentColumns : oldResidentColumns).join(', '))
    .eq('is_active', isActive)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map(toResidentDirectoryUser);
}

export async function getActiveUsersWithRole(): Promise<BasicUserWithRole[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, is_active, on_leave, roles(name)')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name ?? 'Ukjent',
    email: row.email ?? '',
    role: row.roles?.name ?? undefined,
    onLeave: row.on_leave ?? false,
    isActive: row.is_active ?? false,
  }));
}

export async function getAllUsersWithRole(): Promise<BasicUserWithRole[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, is_active, on_leave, roles(name)')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name ?? 'Ukjent',
    email: row.email ?? '',
    role: row.roles?.name ?? undefined,
    onLeave: row.on_leave ?? false,
    isActive: row.is_active ?? false,
  }));
}

export type Role = {
  id: string;
  name: string;
};

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { userId },
  });

  if (error) {
    throw new Error(error.message ?? 'Kunne ikke slette bruker');
  }
}

export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
