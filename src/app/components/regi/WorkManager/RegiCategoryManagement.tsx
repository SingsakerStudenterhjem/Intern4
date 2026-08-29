import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  addRegiCategory,
  deleteRegiCategory,
  getRegiCategories,
  getRegiCategoryUsageCount,
  updateRegiCategory,
} from '../../../../server/dao/regiCategoriesDAO';
import { RegiCategoryWithId } from '../../../../shared/types/regiCategory';

type FormState = { name: string; requiredHours: string };
const emptyForm: FormState = { name: '', requiredHours: '' };

const RegiCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<RegiCategoryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<RegiCategoryWithId | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async (): Promise<void> => {
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
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Regikategorier</h2>
          <p className="text-sm text-gray-600">
            Kategorier bestemmer hvor mange regitimer en bruker må gjennomføre per semester.
            Tildeles per person i Oversikt-fanen.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-navy-600 hover:bg-navy-700 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ny kategori
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {(isAdding || editing) && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-sm p-4 bg-gray-50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              {editing ? 'Rediger kategori' : 'Ny kategori'}
            </h3>
            <button type="button" onClick={cancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Navn</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-sm border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="F.eks. Full Regi"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Påkrevde timer per semester
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={form.requiredHours}
                onChange={(e) => setForm((f) => ({ ...f, requiredHours: e.target.value }))}
                className="w-full rounded-sm border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="36"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-2 text-sm font-medium text-white bg-navy-600 rounded-sm hover:bg-navy-700 disabled:opacity-50"
            >
              {submitting ? 'Lagrer...' : editing ? 'Oppdater' : 'Legg til'}
            </button>
          </div>
        </form>
      )}

      <div className="border border-gray-200 rounded-sm bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Laster...</div>
        ) : categories.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Ingen kategorier opprettet ennå.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.requiredHours} t / semester</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Rediger kategori"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Slett kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RegiCategoryManagement;
