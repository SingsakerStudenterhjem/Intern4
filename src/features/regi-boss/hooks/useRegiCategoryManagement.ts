import { supabase } from '../../../server/supabaseClient';
import { useCallback, useEffect, useState } from 'react';
import { AuthUser } from '../../auth/hooks/useAuth';
import { canApproveWork } from '../../../shared/permissions';

type RegiCategoryWithId = {
  id: string;
  createdAt: Date;
  name: string;
  requiredHours: number;
};

type FormState = { name: string; requiredHours: string };
const emptyForm: FormState = { name: '', requiredHours: '' };

function toAppCategory(row: any): RegiCategoryWithId {
  return {
    id: String(row.id),
    name: row.name ?? '',
    requiredHours: Number(row.required_hours) || 0,
    createdAt: row.created_at,
  };
}

async function addRegiCategory(data: { name: string; requiredHours: number }): Promise<string> {
  const { data: inserted, error } = await supabase
    .from('regi_categories')
    .insert({ name: data.name, required_hours: data.requiredHours })
    .select('id')
    .single();
  if (error) throw new Error(`Kunne ikke opprette kategori: ${error.message}`);
  return String(inserted.id);
}

async function getRegiCategories(): Promise<RegiCategoryWithId[]> {
  const { data, error } = await supabase
    .from('regi_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toAppCategory);
}

async function updateRegiCategory(
  id: string,
  data: Partial<{ name: string; requiredHours: number }>
): Promise<void> {
  const payload: any = { name: data.name, required_hours: data.requiredHours };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { error } = await supabase.from('regi_categories').update(payload).eq('id', Number(id));
  if (error) throw new Error(`Kunne ikke oppdatere kategori: ${error.message}`);
}

async function deleteRegiCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('regi_categories')
    .update({ is_active: false })
    .eq('id', Number(id));
  if (error) throw new Error(`Kunne ikke slette kategori: ${error.message}`);
}

async function getRegiCategoryUsageCount(id: string): Promise<number> {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('regi_category_id', Number(id));
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export const useRegiCategoryManagement = (user: AuthUser, authLoading: boolean) => {
  const [categories, setCategories] = useState<RegiCategoryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<RegiCategoryWithId | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCategories(await getRegiCategories());
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste kategorier.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canApproveWork(user.role)) return;
    void load();
  }, [authLoading, load, user]);

  const startAdd = (): void => {
    setForm(emptyForm);
    setFormError(null);
    setEditing(null);
    setIsAdding(true);
  };

  const startEdit = (category: RegiCategoryWithId): void => {
    setForm({ name: category.name, requiredHours: String(category.requiredHours) });
    setFormError(null);
    setEditing(category);
    setIsAdding(false);
  };

  const cancel = (): void => {
    setIsAdding(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const name = form.name.trim();
    const hours = Number(form.requiredHours);

    if (!name) {
      setFormError('Navn er påkrevd');
      return;
    }
    if (!Number.isFinite(hours) || hours < 0) {
      setFormError('Timer må være 0 eller mer');
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await updateRegiCategory(editing.id, { name, requiredHours: hours });
      } else {
        await addRegiCategory({ name, requiredHours: hours });
      }
      cancel();
      await load();
    } catch (err: any) {
      setFormError(err?.message ?? 'Kunne ikke lagre kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: RegiCategoryWithId): Promise<void> => {
    const usage = await getRegiCategoryUsageCount(category.id).catch(() => 0);
    if (usage > 0) {
      alert(
        `Kan ikke slette "${category.name}" fordi ${usage} bruker${usage !== 1 ? 'e' : ''} er tilknyttet den.`
      );
      return;
    }
    if (!window.confirm(`Er du sikker på at du vil slette kategorien "${category.name}"?`)) return;

    try {
      await deleteRegiCategory(category.id);
      await load();
    } catch (err) {
      console.error(err);
      alert('Kunne ikke slette kategori.');
    }
  };

  return {
    categories,
    loading,
    error,
    isAdding,
    formError,
    submitting,
    startAdd,
    startEdit,
    cancel,
    handleSubmit,
    handleDelete,
    editing,
    form,
    setForm,
  };
};
