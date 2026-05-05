import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { RegiLogWithUser } from '../../../../shared/types/regi';
import { getAllRegiLogs } from '../../../../server/dao/regiDAO';
import { REGI_PATHS } from '../../paths';
import { useAuth } from '../../../../app/providers/AuthContext';
import { canApproveWork } from '../../permissions';

type DateValue = Date | string | { seconds: number } | null | undefined;

const hasSeconds = (value: DateValue): value is { seconds: number } =>
  typeof value === 'object' &&
  value !== null &&
  'seconds' in value &&
  typeof value.seconds === 'number';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const RegiLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RegiLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRegiLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste regilogger.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !canApproveWork(user.role)) return;
    void load();
  }, [load, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesStatus = status === 'all' ? true : log.status === status;
      const matchesQuery =
        !q ||
        log.userName.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q) ||
        log.title.toLowerCase().includes(q) ||
        (log.category ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [logs, status, query]);

  const formatDate = (value: DateValue) => {
    if (!value) return '-';
    if (hasSeconds(value)) return new Date(value.seconds * 1000).toLocaleDateString('no-NO');
    if (typeof value === 'string') return new Date(value).toLocaleDateString('no-NO');
    if (value instanceof Date) return value.toLocaleDateString('no-NO');
    return '-';
  };

  if (!user || !canApproveWork(user.role)) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p>Ingen tilgang.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Regilogger</h1>
            <p className="text-gray-600">Alle registrerte timer, inkludert godkjente og avviste.</p>
          </div>
          <Link to={REGI_PATHS.REGISJEF} className="text-blue-600 hover:underline text-sm">
            Tilbake til oversikt
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk (navn, e-post, tittel, kategori)..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alle</option>
                <option value="pending">Venter</option>
                <option value="approved">Godkjent</option>
                <option value="rejected">Avvist</option>
              </select>
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Oppdater
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="max-h-[70vh] overflow-auto border border-gray-200 rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Bruker
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Tittel
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Kategori
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Timer
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Dato
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Godkjent av
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td className="p-3 text-gray-600" colSpan={7}>
                      Laster...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                      </td>
                      <td className="p-2">{log.title}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span>{log.category}</span>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              log.sourceType === 'task'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {log.sourceType === 'task' ? 'Oppgave' : 'Manuell'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">{log.hours.toFixed(2)} t</td>
                      <td className="p-2">{formatDate(log.createdAt)}</td>
                      <td className="p-2">
                        {log.status === 'approved' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Godkjent
                          </span>
                        )}
                        {log.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Venter
                          </span>
                        )}
                        {log.status === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Avvist
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-sm text-gray-700">
                        {log.approvedByName ?? '—'}
                        {log.approvalComment && (
                          <div className="text-xs text-gray-500 mt-1">{log.approvalComment}</div>
                        )}
                      </td>
                    </tr>
                  ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-600" colSpan={7}>
                      Ingen regilogger funnet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegiLogsPage;
