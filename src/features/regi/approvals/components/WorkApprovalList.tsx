import React from 'react';
import { Ban, Check, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthContext';
import { PendingRegiApproval } from '../../../../shared/types/regi';
import WorkApprovalModal from './WorkApprovalModal';
import { canApproveWork } from '../../permissions';
import { useWorkApprovals } from '../hooks/useWorkApprovals';
import { formatDate } from '../../../../shared/utils/date';

const WorkApprovalList: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
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
  } = useWorkApprovals(user, authLoading);

  if (authLoading) return null;
  if (!user) return null;

  if (!canApproveWork(user.role)) {
    return (
      <div className="p-4 border rounded-md bg-gray-50 text-sm text-gray-700">
        Du har ikke tilgang til godkjenning.
      </div>
    );
  }

  const renderActionButtons = (approval: PendingRegiApproval, stacked = false) => {
    const busy = actionLoadingId === approval.id;

    return (
      <div
        className={`flex gap-2 ${stacked ? 'flex-col' : 'flex-col lg:flex-row lg:items-center'} min-w-40`}
      >
        <button
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            void approve(approval.id);
          }}
          aria-label={`Godkjenn ${approval.title}`}
          className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="w-4 h-4 mr-1.5" />
          Godkjenn
        </button>
        <button
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            void reject(approval.id);
          }}
          aria-label={`Avvis ${approval.title}`}
          className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          <Ban className="w-4 h-4 mr-1.5" />
          Avvis
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk (navn, tittel, beskrivelse, kategori)..."
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

      <div className="p-3 shadow-sm bg-gray-50 text-sm text-gray-700">
        Venter: <span className="font-semibold">{filtered.length}</span>
      </div>

      <div className="hidden md:block max-h-[60vh] md:max-h-[65vh] overflow-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="min-w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[13%]" />
            <col className="w-[18%]" />
            <col />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-48" />
          </colgroup>
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
                Handling
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
              filtered.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelected(a)}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-gray-900">{a.userName}</div>
                    {a.userEmail && (
                      <div className="mt-1 text-xs text-gray-500 truncate">{a.userEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
                        {a.category}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          a.sourceType === 'task'
                            ? 'bg-purple-50 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {a.sourceType === 'task' ? 'Oppgave' : 'Manuell'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate" title={a.title}>
                        {a.title}
                      </div>
                      {a.description && (
                        <div className="mt-1 text-xs text-gray-500 truncate" title={a.description}>
                          {a.description}
                        </div>
                      )}
                      {a.imagePaths && a.imagePaths.length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          {a.imagePaths.length} {a.imagePaths.length === 1 ? 'bilde' : 'bilder'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {formatDate(a.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">{a.hours.toFixed(2)}</td>
                  <td className="px-4 py-3 align-top min-w-48">{renderActionButtons(a)}</td>
                </tr>
              ))}

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

      <div className="space-y-3 md:hidden">
        {loading && (
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 text-sm text-gray-600">
            Laster...
          </div>
        )}

        {!loading &&
          filtered.map((a) => (
            <article
              key={a.id}
              className="border border-gray-200 rounded-xl bg-white shadow-sm p-4"
              data-testid="approval-card"
            >
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="w-full text-left space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{a.userName}</div>
                    <div className="mt-1 text-xs text-gray-500">{formatDate(a.createdAt)}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {a.hours.toFixed(2)} t
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
                    {a.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      a.sourceType === 'task'
                        ? 'bg-purple-50 text-purple-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {a.sourceType === 'task' ? 'Oppgave' : 'Manuell'}
                  </span>
                </div>

                <div>
                  <div className="font-medium text-gray-900 wrap-break-word">{a.title}</div>
                  {a.description && (
                    <div className="mt-1 text-sm text-gray-600 wrap-break-word">
                      {a.description}
                    </div>
                  )}
                  {a.imagePaths && a.imagePaths.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {a.imagePaths.length} {a.imagePaths.length === 1 ? 'bilde' : 'bilder'}
                    </div>
                  )}
                </div>
              </button>

              <div className="mt-4 border-t border-gray-100 pt-4">
                {renderActionButtons(a, true)}
              </div>
            </article>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 text-sm text-gray-600">
            Ingen ventende registreringer.
          </div>
        )}
      </div>

      {selected && (
        <WorkApprovalModal
          key={selected.id}
          approval={selected}
          onClose={() => setSelected(null)}
          onApprove={approve}
          onReject={reject}
          isProcessing={actionLoadingId === selected.id}
        />
      )}
    </div>
  );
};

export default WorkApprovalList;
