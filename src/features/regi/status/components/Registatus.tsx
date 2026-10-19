import React from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthContext';
import { canApproveWork } from '../../permissions';
import { semesterLabel, useRegistatus } from '../hooks/useRegistatus';

const Registatus: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { filtered, loading, error, query, setQuery, load } = useRegistatus(user, authLoading);

  if (authLoading) return null;
  if (!user || !canApproveWork(user.role)) {
    return (
      <div className="p-4 shadow-sm rounded-md bg-surface-muted text-sm text-muted">
        Du har ikke tilgang til registatus.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk (navn, e-post, rolle)..."
            className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-input text-sm font-medium rounded-md text-muted bg-surface hover:bg-surface-muted disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Oppdater
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger-subtle border border-danger-border rounded-md">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="p-3 shadow-sm rounded-md bg-surface-muted text-sm text-muted">
        Nåværende beboere: <span className="font-semibold">{filtered.length}</span> • Semesterstart:{' '}
        <span className="font-semibold">{semesterLabel}</span>
      </div>

      <div className="max-h-[60vh] md:max-h-[65vh] overflow-auto border border-border rounded-xl bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-muted sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                Navn
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                Rolle
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                Godkjent
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                Krav
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                Gjenstår
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td className="p-3 text-muted" colSpan={6}>
                  Laster...
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-subtle">{row.email}</div>
                  </td>
                  <td className="px-4 py-3">{row.role ?? 'Uten rolle'}</td>
                  <td className="px-4 py-3">{row.approvedHours.toFixed(2)} t</td>
                  <td className="px-4 py-3">{row.requiredHours.toFixed(0)} t</td>
                  <td className="px-4 py-3">{row.remainingHours.toFixed(2)} t</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.onLeave ? (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-full bg-warning-subtle text-warning-subtle-fg">
                        Permisjon
                      </span>
                    ) : row.remainingHours > 0 ? (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-full bg-danger-subtle text-danger-subtle-fg">
                        Mangler timer
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-full bg-success-subtle text-success-subtle-fg">
                        Oppfylt
                      </span>
                    )}
                  </td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-3 text-muted" colSpan={6}>
                  Ingen nåværende beboere funnet.
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
