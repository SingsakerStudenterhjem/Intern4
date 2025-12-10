import { supabase } from '../supabaseClient';
import { Task, TaskCreationData } from '../../shared/types/regi/tasks';

function toAppTask(row: any): Task {
  return {
    id: String(row.id),
    title: row.work_items?.title ?? '',
    description: row.work_items?.description ?? '',
    category: row.work_items?.work_categories?.name ?? '',
    deadline: row.deadline ?? null,
    participants: (row.participants ?? []).map((p: any) => p.user_uuid),
    createdAt: row.created_at,
  };
}

export async function addTask(data: TaskCreationData): Promise<string> {
  // find category
  const { data: cat, error: e1 } = await supabase
    .from('work_categories').select('id').eq('name', data.category).maybeSingle();
  if (e1) throw new Error(`Could not add task: ${e1.message}`);
  if (!cat) throw new Error(`Category '${data.category}' not found`);

  // create item then task in a single RPC or two calls:
  const { data: item, error: e2 } = await supabase
    .from('work_items').insert({
      title: data.title,
      description: data.description,
      type: 'task',
      work_category_id: cat.id,
    }).select('id').single();
  if (e2) throw new Error(`Could not add task: ${e2.message}`);

  const { error: e3 } = await supabase.from('work_tasks').insert({
    id: item.id,
    deadline: data.deadline ?? null,
    time_estimate: data.hourEstimate ?? null,
  });
  if (e3) throw new Error(`Could not add task: ${e3.message}`);

  return String(item.id);
}

export async function getTask(taskId: string): Promise<Task | undefined> {
  const { data, error } = await supabase
    .from('work_tasks')
    .select(`
    id,
    created_at,
    deadline,
    time_estimate,
    contact_person_uuid,
    max_participants,  
    work_items (
      id,
      title,
      description,
      work_categories (
        id,
        name,
        description,
        color
      ),
      participants:work_assignments (
        user_uuid
      )
    )
  `)
    .order('deadline', { ascending: true });

  if (error) throw new Error(`Could not get task: ${error.message}`);
  return data ? toAppTask(data) : undefined;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('work_tasks')
    .select(`
      id,
      created_at,
      deadline,
      time_estimate,
      contact_person_uuid,
      max_participants, 
      work_items (
        title,
        description,
        work_categories ( name ),
        participants:work_assignments ( user_uuid )
      )
    `)
    .order('deadline', { ascending: true });

  if (error) {
    throw new Error(`Could not get tasks: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    taskName: row.work_items.title,
    description: row.work_items.description ?? '',
    category: row.work_items.work_categories.name,
    contactPerson: '', // evt. hentes via userDAO på contact_person_uuid
    contactPersonId: row.contact_person_uuid ?? null,
    deadline: row.deadline ?? null,
    hourEstimate: row.time_estimate ?? null,
    maxParticipants: row.max_participants ?? null,
    participants: (row.work_items.participants ?? []).map((p: any) => p.user_uuid),
    completed: false,
    isApproved: false,
    createdBy: row.contact_person_uuid ?? null,
    isActive: true,
  }));
}


export async function updateTask(taskId: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
  // update work_items if title/description
  const patchItem: any = { title: data.title, description: data.description };
  Object.keys(patchItem).forEach((k) => patchItem[k] === undefined && delete patchItem[k]);
  if (Object.keys(patchItem).length) {
    const { error } = await supabase.from('work_items').update(patchItem).eq('id', Number(taskId));
    if (error) throw new Error(`Could not update task: ${error.message}`);
  }

  // update work_tasks if deadline or estimate
  const patchTask: any = { deadline: data.deadline ?? undefined };
  Object.keys(patchTask).forEach((k) => patchTask[k] === undefined && delete patchTask[k]);
  if (Object.keys(patchTask).length) {
    const { error } = await supabase.from('work_tasks').update(patchTask).eq('id', Number(taskId));
    if (error) throw new Error(`Could not update task: ${error.message}`);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  // hard delete: remove assignments, then task, then item
  const id = Number(taskId);
  const { error: e1 } = await supabase.from('work_assignments').delete().eq('work_id', id);
  if (e1) throw new Error(`Could not delete task: ${e1.message}`);
  const { error: e2 } = await supabase.from('work_tasks').delete().eq('id', id);
  if (e2) throw new Error(`Could not delete task: ${e2.message}`);
  const { error: e3 } = await supabase.from('work_items').delete().eq('id', id);
  if (e3) throw new Error(`Could not delete task: ${e3.message}`);
}

export async function joinTask(taskId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from('work_assignments').insert({
    work_id: Number(taskId),
    user_uuid: userId,
    approved_state: 0,
  });
  if (error) throw new Error(`Could not join task: ${error.message}`);
  return true;
}

export async function leaveTask(taskId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('work_assignments').delete()
    .eq('work_id', Number(taskId)).eq('user_uuid', userId);
  if (error) throw new Error(`Could not leave task: ${error.message}`);
  return true;
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('work_assignments')
    .select('work_items(*, work_categories(*), work_tasks(*))')
    .eq('user_uuid', userId);
  if (error) throw new Error(`Could not get user tasks: ${error.message}`);

  const rows = (data ?? [])
    .map((a: any) => a.work_items)
    .filter(Boolean)
    .map((wi: any) => ({
      ...wi.work_tasks,
      work_items: { ...wi, work_categories: wi.work_categories },
      participants: [], // fetch separately if needed
    }));

  // enrich with participants
  const ids = rows.map((r: any) => r.id);
  if (ids.length === 0) return [];
  const { data: parts } = await supabase
    .from('work_assignments')
    .select('work_id, user_uuid')
    .in('work_id', ids);
  const grouped = new Map<number, string[]>();
  (parts ?? []).forEach((p: any) => {
    const arr = grouped.get(p.work_id) ?? [];
    arr.push(p.user_uuid);
    grouped.set(p.work_id, arr);
  });

  return rows.map((row: any) => toAppTask({
    ...row,
    participants: (grouped.get(row.id) ?? []).map((u) => ({ user_uuid: u })),
    work_items: row.work_items ?? { title: row.title, description: row.description, work_categories: row.work_categories }
  }));
}