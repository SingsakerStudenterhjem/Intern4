import React, { useEffect, useMemo, useState } from 'react';
import { RegiLogWithId } from '../../../../shared/types/regi';
import { getRegiLogsByUser } from '../../../../server/dao/regiDAO';
import { getRequiredRegiHoursForRole } from '../../../constants/regiRequirements';

const WorkLogList: React.FC<{ userId: string; userRole?: string; refreshKey?: number }> = ({
  userId,
  userRole,
  refreshKey,
}) => {
  const [logs, setLogs] = useState<RegiLogWithId[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await getRegiLogsByUser(userId);
      if (mounted) {
        setLogs(data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, refreshKey]);

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

  // TODO: uncomment after connecting to the db
  //if (loading) return <div>Laster...</div>;

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="font-semibold text-gray-900 mb-1">Oversikt over min regi</div>
        <div className="text-sm text-gray-700">
          Godkjent: <span className="font-semibold">{totals.approved.toFixed(2)}</span> t • Venter:{' '}
          <span className="font-semibold">{totals.pending.toFixed(2)}</span> t • Totalt registrert:{' '}
          <span className="font-semibold">{totals.total.toFixed(2)}</span> t • Gjenstående timer:{' '}
          <span className="font-semibold">{totals.remaining.toFixed(2)}</span> t
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">Regi logg</div>
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
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
                  Type
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3">
                    {new Date(l.date.seconds * 1000).toLocaleDateString('no-NO')}
                  </td>
                  <td className="px-4 py-3">{l.hours.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize">{l.type}</td>
                  <td className="px-4 py-3 capitalize">
                    {l.status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                        venter
                      </span>
                    )}
                    {l.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                        godkjent
                      </span>
                    )}
                    {l.status === 'rejected' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                        avvist
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-600" colSpan={5}>
                    Ingen registreringer ennå.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkLogList;
