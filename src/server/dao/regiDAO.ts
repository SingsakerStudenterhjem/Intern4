import { supabase } from '../supabaseClient';
import { RegiLog, RegiLogWithId } from '../../shared/types/regi';
import { getUser } from './userDAO';

const DEFAULT_REGI_CATEGORY = 'Regi';

export function isCountableRegiAssignment(row: any): boolean {
  const workType = row.work_items?.type;

  if (workType === 'misc') {
    return true;
  }

  if (workType === 'task') {
    return row.hours_used != null;
  }

  return false;
}

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

export async function addRegiLog(
  data: Omit<RegiLog, 'id' | 'createdAt' | 'status'>,
  options?: { autoApprove?: boolean }
) {
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
      approved_state: options?.autoApprove ? 1 : 0,
    })
    .select('id')
    .single();

  if (e2) throw new Error(e2.message);
  return String(assignment.id);
}

export async function getRegiLogsByUser(userId: string): Promise<RegiLogWithId[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select(
      'id, hours_used, created_at, approved_state, work_items(title, type, work_categories(name))'
    )
    .eq('user_uuid', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const statusMap: Record<number, 'pending' | 'approved' | 'rejected'> = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
  };

  return (data ?? [])
    .filter(isCountableRegiAssignment)
    .map((d: any) => ({
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
  sourceType: 'misc' | 'task';
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

  const pendingAssignments = (data ?? []).filter(isCountableRegiAssignment);

  const uniqueUserIds = Array.from(new Set(pendingAssignments.map((r: any) => String(r.user_uuid))));
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

  const userMap = userRows.reduce(
    (acc, u) => {
      acc[u.uid] = u;
      return acc;
    },
    {} as Record<string, { uid: string; name: string; email: string }>
  );

  return pendingAssignments.map((row: any) => {
    const uid = String(row.user_uuid);
    const u = userMap[uid];

    return {
      id: String(row.id),
      userId: uid,
      userName: u?.name ?? 'Ukjent',
      userEmail: u?.email ?? '',
      sourceType: row.work_items?.type === 'task' ? 'task' : 'misc',
      title: row.work_items?.title ?? '',
      description: row.work_items?.description ?? '',
      category: row.work_items?.work_categories?.name ?? 'Regi',
      hours: row.hours_used ?? 0,
      createdAt: row.created_at,
    };
  });
}

export type RegiLogWithUser = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sourceType: 'misc' | 'task';
  title: string;
  description: string;
  category: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  approvedByName?: string;
  approvalComment?: string | null;
};

export async function getAllRegiLogs(): Promise<RegiLogWithUser[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select(
      'id, user_uuid, hours_used, created_at, approved_state, approval_comment, approved_by_uuid, work_items(title, description, type, work_categories(name))'
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []).filter(isCountableRegiAssignment);
  const uniqueUserIds = Array.from(
    new Set(
      rows.flatMap((r: any) =>
        [r.user_uuid, r.approved_by_uuid].filter(Boolean).map((id: any) => String(id))
      )
    )
  );

  const userMap: Record<string, { name: string; email: string }> = {};
  await Promise.all(
    uniqueUserIds.map(async (uid) => {
      try {
        const u = await getUser(uid);
        if (u) {
          userMap[uid] = { name: u.name ?? 'Ukjent', email: u.email ?? '' };
        }
      } catch {
        // ignore missing users
      }
    })
  );

  const statusMap: Record<number, 'pending' | 'approved' | 'rejected'> = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
  };

  return rows.map((row: any) => {
    const uid = row.user_uuid ? String(row.user_uuid) : '';
    const owner = uid ? userMap[uid] : undefined;
    const approverId = row.approved_by_uuid ? String(row.approved_by_uuid) : '';
    const approver = approverId ? userMap[approverId] : undefined;

    return {
      id: String(row.id),
      userId: uid,
      userName: owner?.name ?? 'Ukjent',
      userEmail: owner?.email ?? '',
      sourceType: row.work_items?.type === 'task' ? 'task' : 'misc',
      title: row.work_items?.title ?? '',
      description: row.work_items?.description ?? '',
      category: row.work_items?.work_categories?.name ?? 'Regi',
      hours: Number(row.hours_used ?? 0),
      status: statusMap[row.approved_state] ?? 'pending',
      createdAt: row.created_at,
      approvedByName: approver?.name,
      approvalComment: row.approval_comment ?? null,
    };
  });
}

export async function getApprovedRegiHoursByUserSince(
  startDate?: Date
): Promise<Record<string, number>> {
  let query = supabase
    .from('work_assignments')
    .select('user_uuid, hours_used, created_at, approved_state')
    .eq('approved_state', 1);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).reduce(
    (acc, row) => {
      const uid = row.user_uuid ? String(row.user_uuid) : '';
      if (!uid) return acc;

      const hours = Number(row.hours_used) || 0;
      acc[uid] = (acc[uid] ?? 0) + hours;
      return acc;
    },
    {} as Record<string, number>
  );
}

async function setApprovalState(assignmentId: string, approvedState: 1 | 2): Promise<void> {
  const { error } = await supabase
    .from('work_assignments')
    .update({ approved_state: approvedState })
    .eq('id', Number(assignmentId));

  if (error) throw new Error(error.message);
}

export async function approveRegiLog(
  assignmentId: string,
  approvedByUuid: string,
  approvalComment?: string
): Promise<void> {
  const { error } = await supabase
    .from('work_assignments')
    .update({
      approved_state: 1,
      approved_by_uuid: approvedByUuid,
      approval_comment: approvalComment?.trim() ? approvalComment.trim() : null,
    })
    .eq('id', assignmentId);

  if (error) throw error;
}

export async function rejectRegiLog(assignmentId: string): Promise<void> {
  await setApprovalState(assignmentId, 2);
}
