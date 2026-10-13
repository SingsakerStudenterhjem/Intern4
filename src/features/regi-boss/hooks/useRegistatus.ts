import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRequiredRegiHoursForRole } from '../../../app/constants/regiRequirements';
import { canApproveWork } from '../../../shared/permissions';
import {
  getAllRoles,
  getApprovedRegiHoursByUserSince,
  getTotalPenaltyHoursByUser,
} from '../../../server/dao/regiDAO';
import { getActiveUsersWithRole } from '../../../server/dao/userDAO';
import { AuthUser } from '../../auth/hooks/useAuth';
import { Role } from '../../../shared/types/user';

export type RegistatusRow = {
  id: string;
  name: string;
  email: string;
  role?: string;
  requiredHours: number;
  approvedHours: number;
  remainingHours: number;
  penaltyHours: number;
  onLeave: boolean;
};

const getSemesterStart = (): Date => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() < 7 ? new Date(year, 0, 1) : new Date(year, 7, 1);
};

export const semesterStart = getSemesterStart();
export const semesterLabel = semesterStart.toLocaleDateString('no-NO');

export const useRegistatus = (user: AuthUser, authLoading: boolean) => {
  const [rows, setRows] = useState<RegistatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [activeUsers, hoursMap, penaltyMap, rolesResponse] = await Promise.all([
        getActiveUsersWithRole(),
        getApprovedRegiHoursByUserSince(semesterStart),
        getTotalPenaltyHoursByUser(),
        getAllRoles(),
      ]);

      setRoles(rolesResponse);
      const nextRows = activeUsers.map((activeUser) => {
        const requiredHours = getRequiredRegiHoursForRole(activeUser.role);
        const approvedHours = hoursMap[activeUser.id] ?? 0;
        const penaltyHours = penaltyMap[activeUser.id] ?? 0;
        const remainingHours = Math.max(requiredHours - approvedHours + penaltyHours, 0);

        return {
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
          role: activeUser.role ?? 'Halv/Halv',
          requiredHours,
          approvedHours,
          remainingHours,
          penaltyHours,
          onLeave: activeUser.onLeave,
        };
      });

      nextRows.sort(
        (a, b) =>
          b.remainingHours - a.remainingHours ||
          a.name.localeCompare(b.name, 'no', { sensitivity: 'base' })
      );

      setRows(nextRows);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste registatus.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canApproveWork(user.role)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [authLoading, load, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        (row.role ?? '').toLowerCase().includes(q)
    );
  }, [query, rows]);

  return {
    filtered,
    loading,
    error,
    query,
    setQuery,
    load,
    roles
  };
};
