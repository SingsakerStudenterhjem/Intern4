import { useCallback, useEffect, useMemo, useState } from 'react';
import { PendingRegiApproval } from '../../../shared/types/regi';
import {
  approveRegiLog,
  deleteRegiPenalty,
  editRegiPenalty,
  getApprovedRegiHoursByUserSince,
  getPenaltiesOfUser,
  getPendingRegiApprovals,
  getTotalPenaltyHoursByUser,
  rejectRegiLog,
  commentRegiLog,
} from '../../../server/dao/regiDAO';
import { canApproveWork } from '../../../shared/permissions';
import { AuthUser } from '../../auth/hooks/useAuth';
import { getUser } from '../../../server/dao/userDAO';
import { semesterStart } from './useRegistatus';
import { getRequiredRegiHoursForRole } from '../../../app/constants/regiRequirements';

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
    assignmentHours: number
  ): Promise<void> => {
    try {
      if (!user) return;
      setActionLoadingId(assignmentId);
      await approveRegiLog(assignmentId, user.id);

      const [assignmentUser, hoursMap, penaltyMap, prevPenalty] = await Promise.all([
        getUser(assignmentUserId),
        getApprovedRegiHoursByUserSince(semesterStart),
        getTotalPenaltyHoursByUser(),
        getPenaltiesOfUser(assignmentUserId),
      ]);

      const requiredHours = assignmentUser ? getRequiredRegiHoursForRole(assignmentUser.role) : 0;
      const approvedHours = hoursMap[assignmentUserId] ?? 0;
      const penaltyHours = penaltyMap[assignmentUserId] ?? 0;
      const remainingHours = Math.max(requiredHours - approvedHours + penaltyHours, 0);

      if (prevPenalty && approvedHours >= requiredHours) {
        if (remainingHours === penaltyHours || assignmentHours === penaltyHours) {
          console.log('deleting');
          await deleteRegiPenalty(assignmentUserId);
        } else {
          console.log('reducing');
          prevPenalty.hours = penaltyHours - assignmentHours;
          await editRegiPenalty(prevPenalty);
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
      console.log(e);
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
