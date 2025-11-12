import { supabase } from '../supabaseClient';
import { RegiLog, RegiLogWithId } from '../../shared/types/regi';

const DEFAULT_REGI_CATEGORY = 'Regi';

async function getOrCreateDefaultCategoryId(): Promise<number> {
  const { data: cat } = await supabase
    .from('work_categories').select('id').eq('name', DEFAULT_REGI_CATEGORY).maybeSingle();
  if (cat) return cat.id;

  // requires staff rights by policy; otherwise move to Edge Function
  const { data: created, error } = await supabase
    .from('work_categories')
    .insert({ name: DEFAULT_REGI_CATEGORY, description: 'Generell regi-kategori', color: 'gray', is_active: true })
    .select('id').single();
  if (error) throw new Error(error.message);
  return created.id;
}

export async function addRegiLog(data: Omit<RegiLog, 'id' | 'createdAt' | 'status'>) {
  const catId = await getOrCreateDefaultCategoryId();

  // find or create misc item with the title
  const { data: existing } = await supabase
    .from('work_items')
    .select('id')
    .eq('title', data.title)
    .eq('work_category_id', catId)
    .eq('type', 'misc')
    .maybeSingle();

  let workId = existing?.id;
  if (!workId) {
    const { data: item, error } = await supabase
      .from('work_items')
      .insert({ title: data.title, type: 'misc', work_category_id: catId })
      .select('id').single();
    if (error) throw new Error(error.message);
    workId = item.id;
  }

  const { data: a, error: e2 } = await supabase
    .from('work_assignments')
    .insert({ user_uuid: data.userId, work_id: workId, hours_used: data.hours, approved_state: 0 })
    .select('id').single();
  if (e2) throw new Error(e2.message);
  return String(a.id);
}

export async function getRegiLogsByUser(userId: string): Promise<RegiLogWithId[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select('id, hours_used, created_at, approved_state, work_items(title, type)')
    .eq('user_uuid', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const statusMap: Record<number, 'pending'|'approved'|'rejected'> = { 0:'pending', 1:'approved', 2:'rejected' };
  return (data ?? []).map((d: any) => ({
    id: String(d.id),
    title: d.work_items?.title ?? '',
    hours: d.hours_used ?? 0,
    date: d.created_at,
    status: statusMap[d.approved_state] ?? 'pending',
    type: d.work_items?.type ?? 'misc',
    userId,
    createdAt: d.created_at,
  }));
}