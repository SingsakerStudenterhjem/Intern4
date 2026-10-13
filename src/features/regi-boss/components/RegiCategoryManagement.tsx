import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthContext';
import { useRegiCategoryManagement } from '../hooks/useRegiCategoryManagement';

const RegiCategoryManagement: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const {
    categories,
    loading,
    error,
    isAdding,
    formError,
    cancel,
    handleDelete,
    handleSubmit,
    startAdd,
    startEdit,
    submitting,
    editing,
    form,
    setForm,
  } = useRegiCategoryManagement(user, authLoading);

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
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm text-white font-medium rounded-sm bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
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
