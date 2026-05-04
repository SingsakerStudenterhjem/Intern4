import { useEffect, useState } from 'react';
import { RegiLog } from '../../shared/types/regi';
import { Category } from '../../shared/types/regi/tasks';
import { addRegiLog } from '../../server/dao/regiDAO';
import { getCategories } from '../../server/dao/categoriesDAO';

export const useWorkLogFormWorkflow = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getCategories();
        if (mounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Kunne ikke laste kategorier', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const createWorkLog = async (payload: Omit<RegiLog, 'id' | 'createdAt' | 'status'>) => {
    await addRegiLog(payload);
  };

  return {
    categories,
    createWorkLog,
  };
};
