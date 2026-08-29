import { supabase } from '../supabaseClient';
import { Task, TaskCreationData } from '../../shared/types/regi/tasks';

type SupabaseJoin<T> = T | T[] | null | undefined;

function getJoinedValue<T>(value: SupabaseJoin<T>): T | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

// Selects the columns/relations needed to build a Task via toAppTask().
const TASK_SELECT = `
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
`;

function toAppTask(row: any): Task {
  const workItem = getJoinedValue(row.work_items);
  const workCategory = getJoinedValue(workItem?.work_categories);

  return {
    id: String(row.id),
    title: workItem?.title ?? '',
    description: workItem?.description ?? undefined,
    category: workCategory?.name ?? '',
    contactPersonId: row.contact_person_uuid ?? undefined,
    deadline: row.deadline ?? undefined,
    hourEstimate: row.time_estimate ?? undefined,
    maxParticipants: row.max_participants ?? undefined,
    participants: (workItem?.participants ?? []).map((p: any) => String(p.user_uuid)),
    createdAt: row.created_at,
  };
}

export async function addTask(data: TaskCreationData): Promise<string> {
  // find category
  const { data: cat, error: e1 } = await supabase
    .from('work_categories')
    .select('id')
    .eq('name', data.category)
    .maybeSingle();
  if (e1) throw new Error(`Could not add task: ${e1.message}`);
  if (!cat) throw new Error(`Category '${data.category}' not found`);

  // create item then task in a single RPC or two calls:
  const { data: item, error: e2 } = await supabase
    .from('work_items')
    .insert({
      title: data.title,
      description: data.description,
      type: 'task',
      work_category_id: cat.id,
    })
    .select('id')
    .single();
  if (e2) throw new Error(`Could not add task: ${e2.message}`);

  const { error: e3 } = await supabase.from('work_tasks').insert({
    id: item.id,
    deadline: data.deadline ?? null,
    time_estimate: data.hourEstimate ?? null,
    contact_person_uuid: data.contactPersonId ?? null,
    max_participants: data.maxParticipants ?? undefined,
  });
  if (e3) throw new Error(`Could not add task: ${e3.message}`);

  return String(item.id);
}

export async function getTask(taskId: string): Promise<Task | undefined> {
  const { data, error } = await supabase
    .from('work_tasks')
    .select(TASK_SELECT)
    .eq('id', Number(taskId))
    .maybeSingle();

  if (error) throw new Error(`Could not get task: ${error.message}`);
  return data ? toAppTask(data) : undefined;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('work_tasks')
    .select(TASK_SELECT)
    .order('deadline', { ascending: true });

  if (error) {
    throw new Error(`Could not get tasks: ${error.message}`);
  }

  return (data ?? []).map((row: any) => toAppTask(row));
}

export async function updateTask(
  taskId: string,
  data: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void> {
  // update work_items if title/description
  const patchItem: any = { title: data.title, description: data.description };
  Object.keys(patchItem).forEach((k) => patchItem[k] === undefined && delete patchItem[k]);
  if (Object.keys(patchItem).length) {
    const { error } = await supabase.from('work_items').update(patchItem).eq('id', Number(taskId));
    if (error) throw new Error(`Could not update task: ${error.message}`);
  }

  // update work_tasks if deadline, estimate, contact person or capacity changed
  const patchTask: any = {
    deadline: data.deadline ?? undefined,
    time_estimate: data.hourEstimate ?? undefined,
    contact_person_uuid: data.contactPersonId ?? undefined,
    max_participants: data.maxParticipants ?? undefined,
  };
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
    .from('work_assignments')
    .delete()
    .eq('work_id', Number(taskId))
    .eq('user_uuid', userId);
  if (error) throw new Error(`Could not leave task: ${error.message}`);
  return true;
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  const { data: assignmentRows, error: assignmentError } = await supabase
    .from('work_assignments')
    .select('work_id')
    .eq('user_uuid', userId);

  if (assignmentError) {
    throw new Error(`Could not get user tasks: ${assignmentError.message}`);
  }

  const taskIds = Array.from(
    new Set((assignmentRows ?? []).map((row: any) => row.work_id).filter((id: any) => id != null))
  );

  if (taskIds.length === 0) return [];

  const { data, error } = await supabase
    .from('work_tasks')
    .select(TASK_SELECT)
    .in('id', taskIds)
    .order('deadline', { ascending: true });

  if (error) {
    throw new Error(`Could not get user tasks: ${error.message}`);
  }

  return (data ?? []).map((row: any) => toAppTask(row));
}
