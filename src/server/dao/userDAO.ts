import { supabase } from '../supabaseClient';
import { User } from '../../shared/types/user';

function toAppUser(row: any): User {
  return {
    name: row.name ?? '',
    email: row.email ?? '',
    birthDate: row.birth_date ?? null,
    phone: row.phone ?? '',
    address: { street: row.street ?? '', postalCode: row.postal_code ?? '', city: row.city ?? '', country: row.country },
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
    coutry: data.address?.country,
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from('users').update(payload).eq('id', uid);
  if (error) throw new Error('kunne ikke oppdatere beboer');
}