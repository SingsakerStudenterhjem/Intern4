import { supabase } from '../supabaseClient';
import { School } from '../../shared/types/school';
import { Study } from '../../shared/types/study';

export async function getSchools(): Promise<School[]> {
  const { data, error } = await supabase.from('schools').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function getSchoolById(id: string | undefined): Promise<School> {
  const { data, error } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getStudies(): Promise<Study[]> {
  const { data, error } = await supabase.from('studies').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function getStudyById(id: string | undefined): Promise<Study> {
  const { data, error } = await supabase.from('studies').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
