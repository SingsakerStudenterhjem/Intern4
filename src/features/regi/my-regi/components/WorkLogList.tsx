import React, { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { RegiLogWithId } from '../../../../shared/types/regi';
import { getRequiredRegiHoursForRole } from '../../../../app/constants/regiRequirements';
import { useWorkLogList } from '../hooks/useWorkLogList';
import WorkLogDetailsModal from './WorkLogDetailsModal';

const WorkLogList: React.FC<{ userId: string; userRole?: string; refreshKey?: number }> = ({
  userId,
  userRole,
  refreshKey,
}) => {
  const { logs, deletingId, error, deleteLog } = useWorkLogList(userId, refreshKey);
  const [selectedLog, setSelectedLog] = useState<RegiLogWithId | null>(null);

  const totals = useMemo(() => {
    const approved = logs.filter((l) => l.status === 'approved').reduce((s, l) => s + l.hours, 0);
    const pending = logs.filter((l) => l.status === 'pending').reduce((s, l) => s + l.hours, 0);
    const requiredHours = getRequiredRegiHoursForRole(userRole);

    return {
      approved,
      pending,
      total: approved + pending,
      remaining: Math.max(requiredHours - approved, 0),
    };
  }, [logs, userRole]);

  const overviewItems = useMemo(
    () => [
      {
        label: 'Godkjent',
        value: `${totals.approved.toFixed(2)} t`,
        valueClassName: 'text-success',
      },
      {
        label: 'Venter',
        value: `${totals.pending.toFixed(2)} t`,
        valueClassName: 'text-warning-subtle-fg',
      },
      {
        label: 'Totalt registrert',
        value: `${totals.total.toFixed(2)} t`,
      },
      {
        label: 'Gjenstående timer',
        value: `${totals.remaining.toFixed(2)} t`,
      },
    ],
    [totals]
  );

  const formatLogDate = (value: RegiLogWithId['date'] | RegiLogWithId['createdAt']) =>
    value.toLocaleDateString('no-NO');

  const canDeleteLog = (log: RegiLogWithId) =>
    log.status === 'pending' && log.sourceType === 'misc';

  const handleDelete = async (log: RegiLogWithId) => {
    if (!canDeleteLog(log)) return;
    if (!window.confirm('Vil du slette denne ventende registreringen?')) return;

    await deleteLog(log);
  };

  //if (loading) return <div>Laster...</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-fg">Oversikt over min regi</h2>
        </div>
        <dl className="divide-y divide-border">
          {overviewItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 py-1 first:pt-0"
            >
              <dt className="text-sm text-muted">{item.label}</dt>
              <dd className={`text-base font-semibold ${item.valueClassName}`}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border border-border rounded-xl bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-fg">Regi logg</h2>
          <p className="mt-1 text-sm text-muted">Nyeste først. Godkjenning skjer av regisjef.</p>
        </div>
        {error && (
          <div className="border-b border-danger-border bg-danger-subtle px-4 py-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-muted sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Utført / registrert
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Tittel
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Timer
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer transition-colors hover:bg-surface-muted"
                  onClick={() => setSelectedLog(l)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-fg">{formatLogDate(l.date)}</div>
                    <div className="text-xs text-subtle">
                      Registrert {formatLogDate(l.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{l.title}</div>
                    {l.imagePaths && l.imagePaths.length > 0 && (
                      <div className="mt-1 text-xs text-subtle">
                        {l.imagePaths.length} {l.imagePaths.length === 1 ? 'bilde' : 'bilder'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{l.hours.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize">{l.type}</td>
                  <td className="px-4 py-3 capitalize">
                    {l.status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-warning-subtle text-warning-subtle-fg text-xs font-semibold">
                        venter
                      </span>
                    )}
                    {l.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-success-subtle text-success-subtle-fg text-xs font-semibold">
                        godkjent
                      </span>
                    )}
                    {l.status === 'rejected' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-danger-subtle text-danger-subtle-fg text-xs font-semibold">
                        avvist
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canDeleteLog(l) ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(l);
                        }}
                        disabled={deletingId === l.id}
                        className="inline-flex items-center gap-1 rounded-md border border-danger-border px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger-subtle disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === l.id ? 'Sletter...' : 'Slett'}
                      </button>
                    ) : (
                      <span className="text-xs text-subtle">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td className="p-3 text-muted" colSpan={7}>
                    Ingen registreringer ennå.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WorkLogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default WorkLogList;
