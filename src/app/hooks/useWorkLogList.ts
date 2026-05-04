import { useEffect, useState } from 'react';
import { RegiLogWithId } from '../../shared/types/regi';
import { deletePendingRegiLog, getRegiLogsByUser } from '../../server/dao/regiDAO';

export const useWorkLogList = (userId: string, refreshKey?: number) => {
  const [logs, setLogs] = useState<RegiLogWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRegiLogsByUser(userId);
        if (mounted) {
          setLogs(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (mounted) {
          setError('Kunne ikke laste registreringene.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, refreshKey]);

  const deleteLog = async (log: RegiLogWithId): Promise<void> => {
    try {
      setDeletingId(log.id);
      setError(null);
      await deletePendingRegiLog(log.id, userId);
      setLogs((currentLogs) => currentLogs.filter((currentLog) => currentLog.id !== log.id));
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error ? deleteError.message : 'Kunne ikke slette registreringen.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return {
    logs,
    loading,
    deletingId,
    error,
    deleteLog,
  };
};
