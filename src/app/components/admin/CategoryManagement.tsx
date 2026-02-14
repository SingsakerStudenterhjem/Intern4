import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Palette } from 'lucide-react';
import {
  CategoryManagementProps,
  FormErrors,
} from '../../../shared/types/regi/tasks/component.types';
import { Category, CategoryFormData } from '../../../shared/types/regi/tasks/category.types';

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  getCategoryUsage,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [usageCounts, setUsageCounts] = useState<{ [key: string]: number }>({});
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);

  const predefinedColors: string[] = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  // Load usage counts for all categories when component mounts or categories change
  useEffect(() => {
    const loadAllUsageCounts = async () => {
      setLoadingUsage(true);
      const counts: { [key: string]: number } = {};

      try {
        await Promise.all(
          categories.map(async (category) => {
            try {
              const count = await getCategoryUsage(category.name);
              counts[category.name] = count;
            } catch (error) {
              console.error(`Error loading usage for category ${category.name}:`, error);
              counts[category.name] = 0;
            }
          })
        );
        setUsageCounts(counts);
      } catch (error) {
        console.error('Error loading category usage counts:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    if (categories.length > 0) {
      loadAllUsageCounts();
    } else {
      setLoadingUsage(false);
    }
  }, [categories, getCategoryUsage]);

  const resetForm = (): void => {
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setErrors({});
  };

  const startAdd = (): void => {
    resetForm();
    setIsAddingCategory(true);
  };

  const startEdit = (category: Category): void => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
    });
    setEditingCategory(category);
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
      // Check for duplicate names (excluding current category when editing)
      const existingCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase() === formData.name.toLowerCase() && cat.id !== editingCategory?.id
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Kategoribehandling</h2>
          <p className="text-sm text-gray-500">Administrer kategorier for oppgaver</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ny kategori
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingCategory || editingCategory) && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingCategory ? 'Rediger kategori' : 'Legg til ny kategori'}
            </h3>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kategorinavn *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => handleFormDataChange('name', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Størm 🔌"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Farge
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleFormDataChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleFormDataChange('color', color)}
                        className={`w-6 h-6 rounded border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="categoryDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Beskrivelse
              </label>
              <textarea
                id="categoryDescription"
                value={formData.description}
                onChange={(e) => handleFormDataChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valgfri beskrivelse av kategorien..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {editingCategory ? 'Oppdater' : 'Legg til'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loadingUsage ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Laster kategorier...</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <li className="px-6 py-8 text-center">
                <p className="text-gray-500">Ingen kategorier opprettet</p>
              </li>
            ) : (
              categories.map((category) => (
                <li key={category.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Brukes av {usageCounts[category.name] || 0} oppgave
                          {usageCounts[category.name] !== 1 ? 'r' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Rediger kategori"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Slett kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
