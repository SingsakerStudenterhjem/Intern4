import React, { useEffect, useMemo, useState } from 'react';
import { RegiLogWithId } from '../../../backend/types/regi';
import { getRegiLogsByUser } from '../../../backend/src/regiDAO';

const WorkLogList: React.FC<{ userId: string; refreshKey?: number }> = ({ userId, refreshKey }) => {
  const [logs, setLogs] = useState<RegiLogWithId[]>([]);
  const [loading, setLoading] = useState(true);

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
    // TODO: calculate remaining from users total regitimer (full-regi, halv-halv, full-vakt)
    return { approved, pending, total: approved + pending, remaining: 36 - approved };
  }, [logs]);

  // TODO: uncomment after connecting to the db
  //if (loading) return <div>Laster...</div>;

  return (
    <div className="space-y-4">
      <div className="p-3 border rounded-md bg-gray-50">
        <div className="font-medium mb-1">Oversikt over min regi</div>
        <div className="text-sm text-gray-700">
          Godkjent: <span className="font-semibold">{totals.approved.toFixed(2)}</span> t • Venter:{' '}
          <span className="font-semibold">{totals.pending.toFixed(2)}</span> t • Totalt registrert:{' '}
          <span className="font-semibold">{totals.total.toFixed(2)}</span> t • Gjenstående timer:{' '}
          <span className="font-semibold">{totals.remaining}</span> t
        </div>
      </div>

      <div className="border rounded-md">
        <div className="p-3 border-b font-medium">Regi logg</div>
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Tittel</th>
                <th className="text-left p-2">Dato</th>
                <th className="text-left p-2">Timer</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.title}</td>
                  <td className="p-2">
                    {new Date((l.date as any).seconds * 1000).toLocaleDateString('no-NO')}
                  </td>
                  <td className="p-2">{l.hours.toFixed(2)}</td>
                  <td className="p-2 capitalize">{l.type}</td>
                  <td className="p-2 capitalize">
                    {l.status === 'pending' && <span className="text-amber-700">venter</span>}
                    {l.status === 'approved' && <span className="text-green-700">godkjent</span>}
                    {l.status === 'rejected' && <span className="text-red-700">avvist</span>}
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
