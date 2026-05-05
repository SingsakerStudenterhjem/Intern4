import { useEffect, useState } from 'react';
import { RegiLog } from '../../../../shared/types/regi';
import { Category } from '../../../../shared/types/regi/tasks';
import { addRegiLog } from '../../../../server/dao/regiDAO';
import { getCategories } from '../../../../server/dao/categoriesDAO';
import { deleteImages, uploadImages } from '../../../../server/storage';

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

  const createWorkLog = async (
    payload: Omit<RegiLog, 'id' | 'createdAt' | 'status'>,
    files: File[] = []
  ) => {
    const imagePaths = await uploadImages(payload.userId, 'regi', files);

    try {
      await addRegiLog({ ...payload, imagePaths });
    } catch (error) {
      try {
        await deleteImages(imagePaths);
      } catch (cleanupError) {
        const message = error instanceof Error ? error.message : 'Kunne ikke registrere regi.';
        const cleanupMessage =
          cleanupError instanceof Error ? cleanupError.message : 'opprydding feilet';
        throw new Error(`${message} ${cleanupMessage}`);
      }
      throw error;
    }
  };

  return {
    categories,
    createWorkLog,
  };
};
