import { useCallback, useEffect, useMemo, useState } from 'react';
import { PendingRegiApproval } from '../../../shared/types/regi';
import {
  approveRegiLog,
  deleteRegiPenalty,
  editRegiPenalty,
  getPenaltiesOfUser,
  getPendingRegiApprovals,
  rejectRegiLog,
  commentRegiLog,
} from '../../../server/dao/regiDAO';
import { canApproveWork } from '../../../shared/permissions';
import { AuthUser } from '../../auth/hooks/useAuth';

export type RegiPunishment = {
  id: number;
  user_uuid: string;
  hours: number;
  reason: string;
  assigned_by_uuid: string;
  created_at: Date;
};

export const useWorkApprovals = (user: AuthUser, authLoading: boolean) => {
  const [approvals, setApprovals] = useState<PendingRegiApproval[]>([]);
  const [selected, setSelected] = useState<PendingRegiApproval | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingRegiApprovals();
      setApprovals(data);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste godkjenninger.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canApproveWork(user.role)) return;
    void load();
  }, [authLoading, load, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return approvals;

    return approvals.filter((approval) => {
      return (
        approval.userName.toLowerCase().includes(q) ||
        approval.title.toLowerCase().includes(q) ||
        (approval.description ?? '').toLowerCase().includes(q) ||
        (approval.category ?? '').toLowerCase().includes(q)
      );
    });
  }, [approvals, query]);

  const approve = async (
    assignmentId: string,
    assignmentUserId: string,
    assignmentHours: number,
    assignmentCategory: string
  ): Promise<void> => {
    try {
      if (!user) return;
      setActionLoadingId(assignmentId);
      await approveRegiLog(assignmentId, user.id);

      const prevPenalties = await getPenaltiesOfUser(assignmentUserId);

      if (assignmentCategory == 'Strafferegi' && prevPenalties) {
        const spesificMatch = prevPenalties.find((penalty) => penalty.hours === assignmentHours);
        const higherMatch = prevPenalties.find((penalty) => penalty.hours <= assignmentHours);
        const lowerMatch = prevPenalties.find((penalty) => penalty.hours >= assignmentHours);
        if (spesificMatch) await deleteRegiPenalty(spesificMatch.id);
        else if (!spesificMatch && higherMatch) {
          if (higherMatch) await deleteRegiPenalty(higherMatch.id);
        } else if (!spesificMatch && !higherMatch && lowerMatch) {
          lowerMatch.hours -= assignmentHours;
          await editRegiPenalty(lowerMatch);
        }
      }

      setApprovals((prev) => prev.filter((approval) => approval.id !== assignmentId));
      if (selected?.id === assignmentId) setSelected(null);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke godkjenne.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (assignmentId: string): Promise<void> => {
    try {
      setActionLoadingId(assignmentId);
      await rejectRegiLog(assignmentId);
      setApprovals((prev) => prev.filter((approval) => approval.id !== assignmentId));
      if (selected?.id === assignmentId) setSelected(null);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke avvise.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const comment = async (assignmentId: string, commment: string): Promise<void> => {
    try {
      setActionLoadingId(assignmentId);
      await commentRegiLog(assignmentId, commment);
      if (selected?.id === assignmentId) setSelected(null);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke kommentere.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    filtered,
    selected,
    setSelected,
    loading,
    actionLoadingId,
    error,
    query,
    setQuery,
    load,
    approve,
    reject,
    comment,
  };
};
