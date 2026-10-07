import { useEffect, useState } from 'react';
import { RegiLog } from '../../../../shared/types/regi';
import { Category } from '../../../../shared/types/regi/tasks';
import { BasicUserWithRole } from '../../../../shared/types/user';
import { getCategories } from '../../../../server/dao/categoriesDAO';
import { addRegiLog } from '../../../../server/dao/regiDAO';
import { getActiveUsersWithRole } from '../../../../server/dao/userDAO';

export const useGrantRegiWorkflow = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [cats, activeUsers] = await Promise.all([getCategories(), getActiveUsersWithRole()]);
        if (!mounted) return;

        setCategories(cats);
        setUsers(activeUsers.filter((user) => user.isActive));
      } catch (error) {
        console.error('Kunne ikke laste data', error);
        setMessage('Kunne ikke laste brukere eller kategorier.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const createGrantedLog = async (
    payload: Omit<RegiLog, 'id' | 'createdAt' | 'status'>,
    approvedByUuid: string
  ) => {
    await addRegiLog(payload, { autoApprove: true, approvedByUuid });
  };

  return {
    categories,
    users,
    loading,
    message,
    setMessage,
    createGrantedLog,
  };
};
