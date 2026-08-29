import { supabase } from '../supabaseClient';
import { RegiCategoryWithId } from '../../shared/types/regiCategory';

function toAppCategory(row: any): RegiCategoryWithId {
  return {
    id: String(row.id),
    name: row.name ?? '',
    requiredHours: Number(row.required_hours) || 0,
    createdAt: row.created_at,
  };
}

export async function addRegiCategory(data: {
  name: string;
  requiredHours: number;
}): Promise<string> {
  const { data: inserted, error } = await supabase
    .from('regi_categories')
    .insert({ name: data.name, required_hours: data.requiredHours })
    .select('id')
    .single();
  if (error) throw new Error(`Kunne ikke opprette kategori: ${error.message}`);
  return String(inserted.id);
}

export async function getRegiCategories(): Promise<RegiCategoryWithId[]> {
  const { data, error } = await supabase
    .from('regi_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toAppCategory);
}

export async function updateRegiCategory(
  id: string,
  data: Partial<{ name: string; requiredHours: number }>
): Promise<void> {
  const payload: any = { name: data.name, required_hours: data.requiredHours };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from('regi_categories').update(payload).eq('id', Number(id));
  if (error) throw new Error(`Kunne ikke oppdatere kategori: ${error.message}`);
}

export async function deleteRegiCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('regi_categories')
    .update({ is_active: false })
    .eq('id', Number(id));
  if (error) throw new Error(`Kunne ikke slette kategori: ${error.message}`);
}

export async function getRegiCategoryUsageCount(id: string): Promise<number> {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('regi_category_id', Number(id));
  if (error) throw new Error(error.message);
  return count ?? 0;
}
