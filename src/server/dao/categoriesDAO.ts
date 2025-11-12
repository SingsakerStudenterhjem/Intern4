import { supabase } from '../supabaseClient';
import { Category } from '../../shared/types/regi/tasks';

function toAppCategory(row: any): Category {
  return {
    id: String(row.id),
    name: row.name ?? '',
    description: row.description ?? '',
    color: row.color ?? 'gray',
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

export async function addCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  const { data: inserted, error } = await supabase
    .from('work_categories')
    .insert({
      name: data.name,
      description: data.description,
      color: data.color,
      is_active: data.isActive,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Could not add category: ${error.message}`);
  return String(inserted.id);
}

export async function getCategory(categoryId: string): Promise<Category | undefined> {
  const { data, error } = await supabase
    .from('work_categories')
    .select('*')
    .eq('id', Number(categoryId))
    .maybeSingle();
  if (error) throw new Error(`Could not get category: ${error.message}`);
  return data ? toAppCategory(data) : undefined;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('work_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw new Error(`Could not get categories: ${error.message}`);
  return (data ?? []).map(toAppCategory);
}

export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<void> {
  const payload: any = {
    name: data.name,
    description: data.description,
    color: data.color,
    is_active: data.isActive,
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from('work_categories').update(payload).eq('id', Number(categoryId));
  if (error) throw new Error(`Could not update category: ${error.message}`);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('work_categories')
    .update({ is_active: false })
    .eq('id', Number(categoryId));
  if (error) throw new Error(`Could not delete category: ${error.message}`);
}

export async function getCategoryUsageCount(categoryName: string): Promise<number> {
  const { data: cat, error: e1 } = await supabase
    .from('work_categories')
    .select('id')
    .eq('name', categoryName)
    .maybeSingle();
  if (e1) throw new Error(`Could not get category: ${e1.message}`);
  if (!cat) return 0;

  const { count, error: e2 } = await supabase
    .from('work_items')
    .select('*', { count: 'exact', head: true })
    .eq('work_category_id', cat.id)
    .eq('type', 'task');
  if (e2) throw new Error(`Could not get category usage count: ${e2.message}`);
  return count ?? 0;
}