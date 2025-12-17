import { supabase } from '../supabaseClient';
import { RegiLog, RegiLogWithId } from '../../shared/types/regi';
import { getUser } from './userDAO';

const DEFAULT_REGI_CATEGORY = 'Regi';

async function getOrCreateDefaultCategoryId(): Promise<number> {
  const { data: cat } = await supabase
    .from('work_categories')
    .select('id')
    .eq('name', DEFAULT_REGI_CATEGORY)
    .maybeSingle();
  if (cat) return cat.id;

  const { data: created, error } = await supabase
    .from('work_categories')
    .insert({
      name: DEFAULT_REGI_CATEGORY,
      description: 'Generell regi-kategori',
      color: 'gray',
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return created.id;
}

async function getCategoryIdByNameOrDefault(categoryName?: string): Promise<number> {
  if (!categoryName) return getOrCreateDefaultCategoryId();

  const { data, error } = await supabase
    .from('work_categories')
    .select('id')
    .eq('name', categoryName)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data?.id) return data.id;

  return getOrCreateDefaultCategoryId();
}

export async function addRegiLog(data: Omit<RegiLog, 'id' | 'createdAt' | 'status'>) {
  const catId = await getCategoryIdByNameOrDefault(data.type);

  const { data: item, error: e1 } = await supabase
    .from('work_items')
    .insert({
      title: data.title,
      description: data.description ?? null,
      type: 'misc',
      work_category_id: catId,
    })
    .select('id')
    .single();
  if (e1) throw new Error(e1.message);

  const { data: assignment, error: e2 } = await supabase
    .from('work_assignments')
    .insert({
      user_uuid: data.userId,
      work_id: item.id,
      hours_used: data.hours,
      approved_state: 0,
    })
    .select('id')
    .single();

  if (e2) throw new Error(e2.message);
  return String(assignment.id);
}

export async function getRegiLogsByUser(userId: string): Promise<RegiLogWithId[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select('id, hours_used, created_at, approved_state, work_items(title, type, work_categories(name))')
    .eq('user_uuid', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const statusMap: Record<number, 'pending' | 'approved' | 'rejected'> = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
  };

  return (data ?? []).map((d: any) => ({
    id: String(d.id),
    title: d.work_items?.title ?? '',
    hours: d.hours_used ?? 0,
    date: d.created_at,
    status: statusMap[d.approved_state] ?? 'pending',
    type: d.work_items?.work_categories?.name ?? d.work_items?.type ?? 'misc',
    userId,
    createdAt: d.created_at,
  }));
}

export type PendingRegiApproval = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  createdAt: any;
};

export async function getPendingRegiApprovals(): Promise<PendingRegiApproval[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select(
      'id, user_uuid, hours_used, created_at, approved_state, work_items(title, description, type, work_categories(name))'
    )
    .eq('approved_state', 0)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const pendingMisc = (data ?? []).filter((row: any) => row.work_items?.type === 'misc');

  const uniqueUserIds = Array.from(new Set(pendingMisc.map((r: any) => String(r.user_uuid))));
  const userRows = await Promise.all(
    uniqueUserIds.map(async (uid) => {
      try {
        const u = await getUser(uid);
        return { uid, name: u?.name ?? 'Ukjent', email: u?.email ?? '' };
      } catch {
        return { uid, name: 'Ukjent', email: '' };
      }
    })
  );

  const userMap = userRows.reduce((acc, u) => {
    acc[u.uid] = u;
    return acc;
  }, {} as Record<string, { uid: string; name: string; email: string }>);

  return pendingMisc.map((row: any) => {
    const uid = String(row.user_uuid);
    const u = userMap[uid];

    return {
      id: String(row.id),
      userId: uid,
      userName: u?.name ?? 'Ukjent',
      userEmail: u?.email ?? '',
      title: row.work_items?.title ?? '',
      description: row.work_items?.description ?? '',
      category: row.work_items?.work_categories?.name ?? 'Regi',
      hours: row.hours_used ?? 0,
      createdAt: row.created_at,
    };
  });
}

async function setApprovalState(assignmentId: string, approvedState: 1 | 2): Promise<void> {
  const { error } = await supabase
    .from('work_assignments')
    .update({ approved_state: approvedState })
    .eq('id', Number(assignmentId));

  if (error) throw new Error(error.message);
}

export async function approveRegiLog(assignmentId: string): Promise<void> {
  await setApprovalState(assignmentId, 1);
}

export async function rejectRegiLog(assignmentId: string): Promise<void> {
  await setApprovalState(assignmentId, 2);
}
