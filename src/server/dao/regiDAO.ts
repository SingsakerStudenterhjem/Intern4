import { supabase } from '../supabaseClient';
import {
  PendingRegiApproval,
  RegiLog,
  RegiLogWithId,
  RegiLogWithUser,
} from '../../shared/types/regi';
import { deleteImages } from '../storage';
import { getUser } from './userDAO';
import { formatDateColumnValue } from '../../shared/utils/date';
import {
  getImagePaths,
  getWorkItemType,
  isCountableRegiAssignment,
  RegiAssignmentRow,
  RegiUserLookup,
  RegiWorkItemRelation,
  toPendingRegiApproval,
  toRegiLogWithId,
  toRegiLogWithUser,
  WorkItemTypeRelation,
} from '../mappers/regiAssignmentMapper';
import { Role } from '../../shared/types/user';
import { RegiPunishment } from '../../features/regi-boss/hooks/useWorkApprovals';

const DEFAULT_REGI_CATEGORY = 'Regi';

export { isCountableRegiAssignment };

type AddRegiLogOptions =
  | { autoApprove?: false; approvedByUuid?: never }
  | { autoApprove: true; approvedByUuid: string };

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

async function getRegiUserMap(
  userIds: Array<string | null | undefined>
): Promise<Record<string, RegiUserLookup>> {
  const uniqueUserIds = Array.from(
    new Set(userIds.filter((id): id is string => Boolean(id)).map((id) => String(id)))
  );

  const userRows = await Promise.all(
    uniqueUserIds.map(async (uid) => {
      try {
        const user = await getUser(uid);
        return {
          uid,
          name: user?.name ?? 'Ukjent',
          email: user?.email ?? '',
        };
      } catch {
        return { uid, name: 'Ukjent', email: '' };
      }
    })
  );

  return userRows.reduce(
    (acc, user) => {
      acc[user.uid] = { name: user.name, email: user.email };
      return acc;
    },
    {} as Record<string, RegiUserLookup>
  );
}

export async function addRegiLog(
  data: Omit<RegiLog, 'id' | 'createdAt' | 'status'>,
  options?: AddRegiLogOptions
) {
  if (options?.autoApprove && !options.approvedByUuid) {
    throw new Error('approvedByUuid is required when auto-approving regi work');
  }

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
      performed_at: formatDateColumnValue(data.date),
      approved_state: options?.autoApprove ? 1 : 0,
      approved_by_uuid: options?.autoApprove ? options.approvedByUuid : null,
    })
    .select('id')
    .single();

  if (e2) throw new Error(e2.message);

  const imagePaths = data.imagePaths ?? [];
  if (imagePaths.length > 0) {
    const { error: e3 } = await supabase.from('work_misc').insert({
      id: item.id,
      image_paths: imagePaths,
    });

    if (e3) {
      await supabase.from('work_assignments').delete().eq('id', assignment.id);
      await supabase.from('work_items').delete().eq('id', item.id);
      throw new Error(e3.message);
    }
  }

  return String(assignment.id);
}

export async function getRegiLogsByUser(userId: string): Promise<RegiLogWithId[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select(
      'id, work_id, hours_used, created_at, performed_at, approved_state, comment, work_items(title, description, type, work_categories(name), work_misc(image_paths))'
    )
    .eq('user_uuid', userId)
    .order('performed_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as RegiAssignmentRow[])
    .filter(isCountableRegiAssignment)
    .map((row) => toRegiLogWithId(row, userId));
}

export async function deletePendingRegiLog(assignmentId: string, userId: string): Promise<void> {
  const { data: assignment, error: fetchError } = await supabase
    .from('work_assignments')
    .select('id, user_uuid, approved_state, work_id, work_items(type, work_misc(image_paths))')
    .eq('id', Number(assignmentId))
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!assignment) throw new Error('Registreringen ble ikke funnet');
  if (String(assignment.user_uuid) !== userId) {
    throw new Error('Du har ikke tilgang til å slette denne registreringen');
  }
  if (assignment.approved_state !== 0) {
    throw new Error('Kun ventende registreringer kan slettes');
  }
  if (getWorkItemType(assignment.work_items as WorkItemTypeRelation) !== 'misc') {
    throw new Error('Oppgavebaserte registreringer må håndteres fra oppgaver');
  }

  const workId = assignment.work_id ? Number(assignment.work_id) : null;
  const imagePaths = getImagePaths(assignment.work_items as RegiWorkItemRelation);

  if (workId) {
    await deleteImages(imagePaths);

    const { error: deleteWorkMiscError } = await supabase
      .from('work_misc')
      .delete()
      .eq('id', workId);

    if (deleteWorkMiscError) throw new Error(deleteWorkMiscError.message);
  }

  const { error: deleteAssignmentError } = await supabase
    .from('work_assignments')
    .delete()
    .eq('id', Number(assignmentId));

  if (deleteAssignmentError) throw new Error(deleteAssignmentError.message);

  if (!workId) return;

  const { data: remainingAssignments, error: remainingError } = await supabase
    .from('work_assignments')
    .select('id')
    .eq('work_id', workId);

  if (remainingError) throw new Error(remainingError.message);

  if ((remainingAssignments ?? []).length > 0) {
    return;
  }

  const { error: deleteWorkItemError } = await supabase
    .from('work_items')
    .delete()
    .eq('id', workId);

  if (deleteWorkItemError) throw new Error(deleteWorkItemError.message);
}

export async function getPendingRegiApprovals(): Promise<PendingRegiApproval[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select(
      'id, user_uuid, hours_used, created_at, performed_at, approved_state, work_items(title, description, type, work_categories(name), work_misc(image_paths))'
    )
    .eq('approved_state', 0)
    .order('performed_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const pendingAssignments = ((data ?? []) as RegiAssignmentRow[]).filter(
    isCountableRegiAssignment
  );
  const userMap = await getRegiUserMap(pendingAssignments.map((row) => row.user_uuid));

  return pendingAssignments.map((row) => {
    const uid = String(row.user_uuid);
    return toPendingRegiApproval(row, userMap[uid]);
  });
}

export async function getAllRegiLogs(): Promise<RegiLogWithUser[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select(
      'id, user_uuid, hours_used, created_at, performed_at, approved_state, comment, approved_by_uuid, work_items(title, description, type, work_categories(name), work_misc(image_paths))'
    )
    .order('performed_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as RegiAssignmentRow[]).filter(isCountableRegiAssignment);
  const userMap = await getRegiUserMap(
    rows.flatMap((row) => [row.user_uuid, row.approved_by_uuid])
  );

  return rows.map((row) => {
    const uid = row.user_uuid ? String(row.user_uuid) : '';
    const owner = uid ? userMap[uid] : undefined;
    const approverId = row.approved_by_uuid ? String(row.approved_by_uuid) : '';
    const approver = approverId ? userMap[approverId] : undefined;

    return toRegiLogWithUser(row, owner, approver);
  });
}

export async function getApprovedRegiHoursByUserSince(
  startDate?: Date
): Promise<Record<string, number>> {
  let query = supabase
    .from('work_assignments')
    .select('user_uuid, hours_used, performed_at, approved_state')
    .eq('approved_state', 1);

  if (startDate) {
    query = query.gte('performed_at', formatDateColumnValue(startDate));
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

export async function approveRegiLog(assignmentId: string, approvedByUuid: string): Promise<void> {
  const { error } = await supabase
    .from('work_assignments')
    .update({
      approved_state: 1,
      approved_by_uuid: approvedByUuid,
    })
    .eq('id', assignmentId);

  if (error) throw error;
}

export async function rejectRegiLog(assignmentId: string): Promise<void> {
  await setApprovalState(assignmentId, 2);
}

export async function getTotalPenaltyHoursByUser(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('regi_penalties').select('user_uuid, hours');
  if (error) throw new Error(error.message);

  return (data ?? []).reduce(
    (acc, row) => {
      const uid = row.user_uuid ? String(row.user_uuid) : '';
      if (!uid) return acc;
      acc[uid] = (acc[uid] ?? 0) + (Number(row.hours) || 0);
      return acc;
    },
    {} as Record<string, number>
  );
}

export async function getPenaltiesOfUser(id: string): Promise<RegiPunishment | null> {
  const { data, error } = await supabase
    .from('regi_penalties')
    .select('id, user_uuid, hours, reason, assigned_by_uuid, created_at')
    .eq('user_uuid', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRegiPenalty(id: string): Promise<void> {
  const { error } = await supabase.from('regi_penalties').delete().eq('user_uuid', id);
  if (error) throw new Error(error.message);
}

export async function editRegiPenalty(data: Partial<RegiPunishment>): Promise<void> {
  (Object.keys(data) as (keyof RegiPunishment)[]).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  const { error } = await supabase
    .from('regi_penalties')
    .update(data)
    .eq('user_uuid', data.user_uuid);

  if (error) throw new Error(error.message);
}

export async function getAllRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from('roles').select('*');
  if (error) throw new Error(error.message);

  return data;
}

export async function getPendingApproval(id: string, u_id: string): Promise<PendingRegiApproval> {
  const { data, error } = await supabase.from('work_assignments').select('*').eq('id', id);
  if (error) throw new Error(error.message);
  const user = await getUser(u_id);

  return toPendingRegiApproval(data as RegiAssignmentRow, {
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
}
