import prismaClient from '../prismaClient';
import { RegiLog, RegiLogWithId } from '../../shared/types/regi';

const DEFAULT_REGI_CATEGORY = 'Regi';

async function getOrCreateDefaultCategory() {
  let category = await prismaClient.work_categories.findFirst({
    where: { name: DEFAULT_REGI_CATEGORY },
  });

  if (!category) {
    category = await prismaClient.work_categories.create({
      data: {
        name: DEFAULT_REGI_CATEGORY,
        description: 'Generell regi-kategori',
        color: 'gray',
        is_active: true,
      },
    });
  }
  return category;
}

export async function addRegiLog(data: Omit<RegiLog, 'id' | 'createdAt' | 'status'>) {
  const category = await getOrCreateDefaultCategory();

  // Find or create a work_item for this log title
  let workItem = await prismaClient.work_items.findFirst({
    where: {
      title: data.title,
      work_category_id: category.id,
    },
  });

  if (!workItem) {
    workItem = await prismaClient.work_items.create({
      data: {
        title: data.title,
        type: 'misc',
        work_category_id: category.id,
      },
    });
  }

  const assignment = await prismaClient.work_assignments.create({
    data: {
      user_uuid: data.userId,
      work_id: workItem.id,
      hours_used: data.hours,
      approved_state: 0, // 0 for 'pending'
      // Note: `data.date` is not stored as `work_assignments` has no `work_date` field.
      // `created_at` will be used instead.
    },
  });

  return assignment.id.toString();
}

export async function getRegiLogsByUser(userId: string): Promise<RegiLogWithId[]> {
  const assignments = await prismaClient.work_assignments.findMany({
    where: { user_uuid: userId },
    include: {
      work_items: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const statusMap: { [key: number]: 'pending' | 'approved' | 'rejected' } = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
  };

  return assignments.map((d: any) => ({
    id: d.id.toString(),
    title: d.work_items.title,
    hours: d.hours_used ?? 0,
    date: d.created_at, // Using created_at as date
    status: statusMap[d.approved_state] || 'pending',
    type: d.work_items.type ?? 'misc', // Or some other default
    userId: d.user_uuid,
    createdAt: d.created_at,
  }));
}
