import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { Category } from '../types/regi/tasks/category.types';

export async function addCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = doc(collection(db, 'regiCategories'));
    const categoryData = {
      ...data,
      id: docRef.id,
      createdAt: Timestamp.now(),
    };

    await setDoc(docRef, categoryData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Could not add category: ${error.message}`);
  }
}

export async function getCategory(categoryId: string): Promise<Category | undefined> {
  try {
    const categoryDoc = await getDoc(doc(db, 'regiCategories', categoryId));
    if (categoryDoc.exists()) {
      return categoryDoc.data() as Category;
    }
    return undefined;
  } catch (error: any) {
    throw new Error(`Could not get category: ${error.message}`);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    // Attempt optimized query with composite index
    try {
      const categoriesQuery = query(
        collection(db, 'regiCategories'),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const categoriesDoc = await getDocs(categoriesQuery);
      return categoriesDoc.docs.map((doc) => doc.data() as Category);
    } catch (indexError) {
      // Fallback: Query without orderBy if composite index is not available
      const categoriesQuery = query(
        collection(db, 'regiCategories'),
        where('isActive', '==', true)
      );
      const categoriesDoc = await getDocs(categoriesQuery);

      // Manual sort by name
      const categories = categoriesDoc.docs.map((doc) => doc.data() as Category);
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error: any) {
    // Final fallback: Get all categories and filter manually
    try {
      const allDocs = await getDocs(collection(db, 'regiCategories'));
      const allCategories = allDocs.docs.map((doc) => doc.data() as Category);

      return allCategories
        .filter((cat) => cat.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (finalError: any) {
      throw new Error(`Could not get categories: ${error.message}`);
    }
  }
}

export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<void> {
  try {
    const docRef = doc(db, 'regiCategories', categoryId);
    await updateDoc(docRef, data);
  } catch (error: any) {
    throw new Error(`Could not update category: ${error.message}`);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    // Soft delete by setting isActive to false
    await updateCategory(categoryId, { isActive: false });
  } catch (error: any) {
    throw new Error(`Could not delete category: ${error.message}`);
  }
}

export async function getCategoryUsageCount(categoryName: string): Promise<number> {
  try {
    const tasksQuery = query(
      collection(db, 'regiTasks'),
      where('category', '==', categoryName),
      where('isActive', '==', true)
    );
    const tasksDoc = await getDocs(tasksQuery);
    return tasksDoc.docs.length;
  } catch (error: any) {
    throw new Error(`Could not get category usage count: ${error.message}`);
  }
}
