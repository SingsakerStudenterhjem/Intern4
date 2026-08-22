import { supabase } from '../supabaseClient';
import { User, NewUserInput } from '../../shared/types/user';
import { ImportRowResult } from '../../shared/types/csvImport';

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
    regiPreapproved: row.regi_preapproved ?? false,
    createdAt: row.created_at,
    role: row.roles?.name ?? 'Halv/Halv',
  };
}

export async function getUser(uid: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('id', uid)
    .maybeSingle();
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
    regi_preapproved: data.regiPreapproved,
    street: data.address?.street,
    postal_code: data.address?.postalCode,
    city: data.address?.city,
    country: data.address?.country,
  };

  if (data.role !== undefined) {
    const { data: roleRow, error: roleErr } = await supabase
      .from('roles')
      .select('id')
      .eq('name', data.role)
      .maybeSingle();
    if (roleErr || !roleRow) throw new Error('Ugyldig rolle');
    payload.role_id = roleRow.id;
  }

  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from('users').update(payload).eq('id', uid);
  if (error) throw new Error('kunne ikke oppdatere beboer');
}

export async function setRegiPreapproved(userId: string, value: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ regi_preapproved: value })
    .eq('id', userId);
  if (error) throw new Error('Kunne ikke oppdatere forhåndsgodkjenning');
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

// Sequential (not parallel) by design: create-user does an auth-admin create +
// role lookup + profile insert per call, so running these concurrently risks
// rate-limiting the Supabase Auth admin API and makes per-row error
// attribution to the UI harder to stream incrementally.
export async function createUsersBulk(
  rows: NewUserInput[],
  onProgress?: (result: ImportRowResult) => void
): Promise<ImportRowResult[]> {
  const results: ImportRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const { id, initialPassword } = await createUser(rows[i]);
      const result: ImportRowResult = {
        row: i,
        status: 'success',
        userId: id,
        email: rows[i].email,
        initialPassword,
      };
      results.push(result);
      onProgress?.(result);
    } catch (err: any) {
      const result: ImportRowResult = {
        row: i,
        status: 'error',
        message: err?.message ?? 'Ukjent feil',
        email: rows[i].email,
      };
      results.push(result);
      onProgress?.(result);
    }
  }

  return results;
}

export type BasicUserWithRole = {
  id: string;
  name: string;
  email: string;
  role?: string;
  onLeave: boolean;
  isActive: boolean;
  regiPreapproved: boolean;
};

export async function getActiveUsersWithRole(): Promise<BasicUserWithRole[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, is_active, on_leave, regi_preapproved, roles(name)')
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
    regiPreapproved: row.regi_preapproved ?? false,
  }));
}

export async function getAllUsersWithRole(): Promise<BasicUserWithRole[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, is_active, on_leave, regi_preapproved, roles(name)')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name ?? 'Ukjent',
    email: row.email ?? '',
    role: row.roles?.name ?? undefined,
    onLeave: row.on_leave ?? false,
    isActive: row.is_active ?? false,
    regiPreapproved: row.regi_preapproved ?? false,
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
