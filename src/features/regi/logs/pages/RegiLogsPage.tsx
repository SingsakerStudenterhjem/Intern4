import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { RegiLogWithUser } from '../../../../shared/types/regi';
import { getAllRegiLogs } from '../../../../server/dao/regiDAO';
import { REGI_PATHS } from '../../paths';
import { useAuth } from '../../../../app/providers/AuthContext';
import { canApproveWork } from '../../permissions';
import { PageLayout } from '../../../../shared/layouts';
import { formatDate } from '../../../../shared/utils/date';

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

  if (!user || !canApproveWork(user.role)) {
    return (
      <PageLayout title="Regilogger">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted">Ingen tilgang.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Regilogger"
      description="Alle registrerte timer, inkludert godkjente og avviste."
      actions={
        <Link to={REGI_PATHS.REGISJEF} className="text-primary hover:underline text-sm">
          Tilbake til oversikt
        </Link>
      }
    >
      <div className="bg-surface border border-border rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk (navn, e-post, tittel, kategori)..."
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="inline-flex items-center px-3 py-2 border border-input text-sm font-medium rounded-md text-muted bg-surface hover:bg-surface-muted disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Oppdater
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-subtle border border-danger-border rounded-md">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="max-h-[70vh] overflow-auto border border-border rounded-xl bg-surface shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-muted sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Bruker
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Tittel
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Kategori
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Timer
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Dato
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Godkjent av
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td className="p-3 text-muted" colSpan={7}>
                    Laster...
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-muted transition-colors">
                    <td className="p-2">
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-xs text-subtle">{log.userEmail}</div>
                    </td>
                    <td className="p-2">{log.title}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>{log.category}</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            log.sourceType === 'task'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                              : 'bg-surface-muted text-muted'
                          }`}
                        >
                          {log.sourceType === 'task' ? 'Oppgave' : 'Manuell'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">{log.hours.toFixed(2)} t</td>
                    <td className="p-2">{formatDate(log.date)}</td>
                    <td className="p-2">
                      {log.status === 'approved' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-success-subtle text-success-subtle-fg">
                          Godkjent
                        </span>
                      )}
                      {log.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-warning-subtle text-warning-subtle-fg">
                          Venter
                        </span>
                      )}
                      {log.status === 'rejected' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-danger-subtle text-danger-subtle-fg">
                          Avvist
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-sm text-muted">
                      {log.approvedByName ?? '—'}
                      {log.approvalComment && (
                        <div className="text-xs text-subtle mt-1">{log.approvalComment}</div>
                      )}
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="p-3 text-muted" colSpan={7}>
                    Ingen regilogger funnet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
};

export default RegiLogsPage;
