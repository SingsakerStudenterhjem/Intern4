import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../../../contexts/authContext';
import { canApproveWork } from '../../../constants/userRoles';
import { getRequiredRegiHoursForRole } from '../../../constants/regiRequirements';
import { getApprovedRegiHoursByUserSince } from '../../../../server/dao/regiDAO';
import { getActiveUsersWithRole } from '../../../../server/dao/userDAO';

type RegistatusRow = {
  id: string;
  name: string;
  email: string;
  role?: string;
  requiredHours: number;
  approvedHours: number;
  remainingHours: number;
  onLeave: boolean;
};

const getSemesterStart = (): Date => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() < 7 ? new Date(year, 0, 1) : new Date(year, 7, 1);
};

const semesterStart = getSemesterStart();
const semesterLabel = semesterStart.toLocaleDateString('no-NO');

const Registatus: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<RegistatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [activeUsers, hoursMap] = await Promise.all([
        getActiveUsersWithRole(),
        getApprovedRegiHoursByUserSince(semesterStart),
      ]);

      const nextRows = activeUsers.map((u) => {
        const requiredHours = getRequiredRegiHoursForRole(u.role);
        const approvedHours = hoursMap[u.id] ?? 0;
        const remainingHours = Math.max(requiredHours - approvedHours, 0);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ?? 'Halv/Halv',
          requiredHours,
          approvedHours,
          remainingHours,
          onLeave: u.onLeave,
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
    void load();
  }, [authLoading, load, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.role ?? '').toLowerCase().includes(q)
    );
  }, [query, rows]);

  if (authLoading) return null;
  if (!user || !canApproveWork(user.role)) {
    return (
      <div className="p-4 shadow-sm rounded-md bg-gray-50 text-sm text-gray-700">
        Du har ikke tilgang til registatus.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk (navn, e-post, rolle)..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Oppdater
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="p-3 shadow-sm rounded-md bg-gray-50 text-sm text-gray-700">
        Aktive beboere: <span className="font-semibold">{filtered.length}</span> • Semesterstart:{' '}
        <span className="font-semibold">{semesterLabel}</span>
      </div>

      <div className="max-h-[60vh] md:max-h-[65vh] overflow-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Navn
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Rolle
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Godkjent
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Krav
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Gjenstår
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>
                  Laster...
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                  </td>
                  <td className="px-4 py-3">{row.role ?? 'Uten rolle'}</td>
                  <td className="px-4 py-3">{row.approvedHours.toFixed(2)} t</td>
                  <td className="px-4 py-3">{row.requiredHours.toFixed(0)} t</td>
                  <td className="px-4 py-3">{row.remainingHours.toFixed(2)} t</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.onLeave ? (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Permisjon
                      </span>
                    ) : row.remainingHours > 0 ? (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Mangler timer
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Oppfylt
                      </span>
                    )}
                  </td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>
                  Ingen aktive beboere funnet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Registatus;
