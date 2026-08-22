import React, { useEffect, useState } from 'react';
import CategoryManagement from '../../components/admin/CategoryManagement';
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryUsageCount,
  updateCategory,
} from '../../../server/dao/categoriesDAO';
import { Category, CategoryCreationData } from '../../../shared/types/regi/tasks';

const AdminPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async (): Promise<void> => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Kunne ikke laste kategorier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (categoryData: CategoryCreationData): Promise<void> => {
    try {
      await addCategory(categoryData);
      await loadCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Kunne ikke opprette kategori');
    }
  };

  const handleUpdateCategory = async (
    categoryId: string,
    categoryData: Partial<Category>
  ): Promise<void> => {
    try {
      await updateCategory(categoryId, categoryData);
      await loadCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Kunne ikke oppdatere kategori');
    }
  };

  const handleDeleteCategory = async (categoryId: string): Promise<void> => {
    try {
      await deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Kunne ikke slette kategori');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <header>
          <p className="text-xs font-semibold tracking-wide text-navy-600 uppercase">Admin</p>
          <h1 className="text-3xl font-bold text-gray-900">Administrasjon</h1>
          <p className="text-gray-600 mt-1">
            Administrer kategorier som brukes på oppgaver og regi.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Laster...</p>
            </div>
          ) : (
            <CategoryManagement
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              getCategoryUsage={getCategoryUsageCount}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
