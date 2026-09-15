import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Check, RefreshCw, Search, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  approveRegiLog,
  getPendingRegiApprovals,
  PendingRegiApproval,
  rejectRegiLog,
} from '../../../../server/dao/regiDAO';
import { canApproveWork } from '../../../constants/userRoles';
import { ROUTES } from '../../../constants/routes';

const WorkApprovalList: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<PendingRegiApproval[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const load = async (): Promise<void> => {
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
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canApproveWork(user.role)) return;
    load();
  }, [authLoading, user?.id, user?.role]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return approvals;

    return approvals.filter((a) => {
      return (
        a.userName.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.description ?? '').toLowerCase().includes(q) ||
        (a.category ?? '').toLowerCase().includes(q)
      );
    });
  }, [approvals, query]);

  const handleApprove = async (assignmentId: string): Promise<void> => {
    try {
      if (!user) return;

      setActionLoadingId(assignmentId);
      await approveRegiLog(assignmentId, user.id);

      setApprovals((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (e) {
      console.error(e);
      setError('Kunne ikke godkjenne.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (assignmentId: string): Promise<void> => {
    try {
      setActionLoadingId(assignmentId);
      await rejectRegiLog(assignmentId);
      setApprovals((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (e) {
      console.error(e);
      setError('Kunne ikke avvise.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (value: any) => {
    if (!value) return '-';
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleDateString('no-NO');
    if (typeof value === 'string') return new Date(value).toLocaleDateString('no-NO');
    if (value instanceof Date) return value.toLocaleDateString('no-NO');
    return '-';
  };

  if (authLoading) return null;
  if (!user) return null;

  if (!canApproveWork(user.role)) {
    return (
      <div className="p-4 border rounded-sm bg-gray-50 text-sm text-gray-700">
        Du har ikke tilgang til godkjenning.
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
            placeholder="Søk (navn, tittel, beskrivelse, kategori)..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Oppdater
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="p-3 shadow-sm bg-gray-50 text-sm text-gray-700">
        Venter: <span className="font-semibold">{filtered.length}</span>
      </div>

      <div className="max-h-[60vh] md:max-h-[65vh] overflow-auto border border-gray-200 rounded-sm bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Navn
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Regitype
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Tittel
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Dato
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Timer
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Action
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
              filtered.map((a) => {
                const busy = actionLoadingId === a.id;

                return (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(ROUTES.REGIGODKJENNING_REVIEW.replace(':id', a.id))}
                  >
                    <td className="px-4 py-3">{a.userName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-medium">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">{a.title}</td>
                    <td className="px-4 py-3">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3">{a.hours.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={busy}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(a.id);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Godkjenn
                        </button>
                        <button
                          disabled={busy}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(a.id);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Avvis
                        </button>
                        <button
                          disabled={busy}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(ROUTES.REGIGODKJENNING_REVIEW.replace(':id', a.id));
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Kommenter
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>
                  Ingen ventende registreringer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkApprovalList;
