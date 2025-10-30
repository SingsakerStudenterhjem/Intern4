import prisma from '../prisma';
import { Category } from '../types/regi/tasks';
import { work_categories as PrismaCategory } from '@prisma/client';

function toAppCategory(cat: PrismaCategory): Category {
  return {
    id: cat.id.toString(),
    name: cat.name ?? '',
    description: cat.description ?? '',
    color: cat.color ?? 'gray',
    isActive: cat.is_active ?? true,
    createdAt: cat.created_at,
  };
}

export async function addCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  try {
    const newCategory = await prisma.work_categories.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        is_active: data.isActive,
      },
    });
    return newCategory.id.toString();
  } catch (error: any) {
    throw new Error(`Could not add category: ${error.message}`);
  }
}

export async function getCategory(categoryId: string): Promise<Category | undefined> {
  try {
    const category = await prisma.work_categories.findUnique({
      where: { id: BigInt(categoryId) },
    });
    return category ? toAppCategory(category) : undefined;
  } catch (error: any) {
    throw new Error(`Could not get category: ${error.message}`);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.work_categories.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return categories.map(toAppCategory);
  } catch (error: any) {
    throw new Error(`Could not get categories: ${error.message}`);
  }
}

export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<void> {
  try {
    const { id, createdAt, isActive, ...rest } = data;
    await prisma.work_categories.update({
      where: { id: BigInt(categoryId) },
      data: {
        ...rest,
        is_active: isActive,
      },
    });
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
    const category = await prisma.work_categories.findFirst({
      where: { name: categoryName },
    });
    if (!category) return 0;

    // Note: The original implementation checked for `isActive` on tasks.
    // The new schema doesn't have this field on `work_items` or `work_tasks`.
    // This function now counts all tasks in a category regardless of an active status.
    return await prisma.work_items.count({
      where: {
        work_category_id: category.id,
        type: 'task',
      },
    });
  } catch (error: any) {
    throw new Error(`Could not get category usage count: ${error.message}`);
  }
}
