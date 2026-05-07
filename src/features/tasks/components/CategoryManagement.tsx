import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Palette, Plus, Search, Trash2, X } from 'lucide-react';
import {
  Category,
  CategoryCreationData,
  CategoryFormData,
} from '../../../shared/types/regi/tasks/category.types';

type FormErrors = Record<string, string>;

type CategoryManagementProps = {
  categories: Category[];
  onAddCategory: (categoryData: CategoryCreationData) => Promise<void>;
  onUpdateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  getCategoryUsage: (categoryName: string) => Promise<number>;
  onClose: () => void;
};

const DEFAULT_COLOR = '#3B82F6';

const predefinedColors: string[] = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#F97316',
  '#06B6D4',
  '#84CC16',
  '#EC4899',
  '#6B7280',
];

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  getCategoryUsage,
  onClose,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: DEFAULT_COLOR,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [usageCounts, setUsageCounts] = useState<{ [key: string]: number }>({});
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const hasLoadedUsageCounts = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    const loadAllUsageCounts = async () => {
      setLoadingUsage(!hasLoadedUsageCounts.current);
      const counts: { [key: string]: number } = {};

      try {
        await Promise.all(
          categories.map(async (category) => {
            try {
              counts[category.name] = await getCategoryUsage(category.name);
            } catch (error) {
              console.error(`Error loading usage for category ${category.name}:`, error);
              counts[category.name] = 0;
            }
          })
        );
        if (isCurrent) {
          setUsageCounts(counts);
          hasLoadedUsageCounts.current = true;
        }
      } catch (error) {
        console.error('Error loading category usage counts:', error);
      } finally {
        if (isCurrent) {
          setLoadingUsage(false);
        }
      }
    };

    if (categories.length > 0) {
      void loadAllUsageCounts();
    } else {
      setUsageCounts({});
      hasLoadedUsageCounts.current = true;
      setLoadingUsage(false);
    }

    return () => {
      isCurrent = false;
    };
  }, [categories, getCategoryUsage]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(normalizedQuery) ||
        (category.description ?? '').toLowerCase().includes(normalizedQuery)
    );
  }, [categories, query]);

  const resetForm = (): void => {
    setFormData({ name: '', description: '', color: DEFAULT_COLOR });
    setErrors({});
  };

  const startAdd = (): void => {
    resetForm();
    setEditingCategory(null);
    setIsAddingCategory(true);
  };

  const startEdit = (category: Category): void => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
    });
    setEditingCategory(category);
    setIsAddingCategory(false);
    setErrors({});
  };

  const cancelEdit = (): void => {
    setIsAddingCategory(false);
    setEditingCategory(null);
    resetForm();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kategorinavn er påkrevd';
    } else {
      const existingCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          cat.id !== editingCategory?.id
      );
      if (existingCategory) {
        newErrors.name = 'En kategori med dette navnet eksisterer allerede';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
      } else {
        await onAddCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          isActive: true,
        });
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: 'Kunne ikke lagre kategori. Prøv igjen.' });
    }
  };

  const handleDelete = async (category: Category): Promise<void> => {
    if (!window.confirm(`Er du sikker på at du vil slette kategorien "${category.name}"?`)) {
      return;
    }

    try {
      const usage = usageCounts[category.name] || 0;
      if (usage > 0) {
        alert(
          `Kan ikke slette kategorien "${category.name}" fordi den brukes av ${usage} oppgave${usage !== 1 ? 'r' : ''}.`
        );
        return;
      }

      await onDeleteCategory(category.id);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kunne ikke slette kategori. Prøv igjen.');
    }
  };

  const handleFormDataChange = (field: keyof CategoryFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isFormOpen = isAddingCategory || !!editingCategory;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-management-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <h2 id="category-management-title" className="text-xl font-semibold text-gray-900">
              Kategorier
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startAdd}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ny kategori
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Lukk kategorier"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 px-5 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Søk i kategorier..."
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingUsage ? (
              <div className="px-6 py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                <p className="mt-2 text-sm text-gray-500">Laster kategorier...</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-gray-500">
                    Ingen kategorier opprettet
                  </li>
                ) : filteredCategories.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-gray-500">
                    Ingen kategorier matcher søket
                  </li>
                ) : (
                  filteredCategories.map((category) => {
                    const usage = usageCounts[category.name] || 0;

                    return (
                      <li key={category.id} className="px-5 py-2">
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="h-4 w-4 shrink-0 rounded-full border border-gray-300"
                              style={{ backgroundColor: category.color }}
                              aria-hidden="true"
                            />
                            <div className="min-w-0 leading-tight">
                              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <h3 className="truncate text-sm font-medium text-gray-900">
                                  {category.name}
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {usage} oppgave{usage !== 1 ? 'r' : ''}
                                </span>
                              </div>
                              {category.description && (
                                <p className="truncate text-xs text-gray-500">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(category)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="Rediger kategori"
                              aria-label={`Rediger ${category.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                              title="Slett kategori"
                              aria-label={`Slett ${category.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/30 p-4">
          <div
            className="w-full max-w-xl rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 id="category-form-title" className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Rediger kategori' : 'Ny kategori'}
              </h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Lukk skjema"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5" noValidate>
              {errors.submit && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3" role="alert">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Kategorinavn *
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={formData.name}
                    onChange={(e) => handleFormDataChange('name', e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Strøm"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'category-name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="category-name-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <Palette className="mr-1 inline h-4 w-4" />
                    Farge
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleFormDataChange('color', e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                      aria-label="Velg farge"
                    />
                    <div className="flex flex-wrap gap-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleFormDataChange('color', color)}
                          className={`h-6 w-6 rounded border-2 ${
                            formData.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                          aria-label={`Velg ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="categoryDescription"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Beskrivelse
                </label>
                <textarea
                  id="categoryDescription"
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Valgfri beskrivelse av kategorien..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingCategory ? 'Lagre endringer' : 'Legg til'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default CategoryManagement;
