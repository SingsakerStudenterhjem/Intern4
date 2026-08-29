import React, { useEffect, useMemo, useState } from 'react';
import { RegiLogWithId } from '../../../../shared/types/regi';
import {
  getRegiLogsByUser,
  getTransfersByUser,
  RegiTransferWithCounterparty,
} from '../../../../server/dao/regiDAO';
import { getUser } from '../../../../server/dao/userDAO';
import { getRequiredRegiHours } from '../../../constants/regiRequirements';

const WorkLogList: React.FC<{ userId: string; refreshKey?: number }> = ({ userId, refreshKey }) => {
  const [logs, setLogs] = useState<RegiLogWithId[]>([]);
  const [transfers, setTransfers] = useState<RegiTransferWithCounterparty[]>([]);
  const [requiredHours, setRequiredHours] = useState(0);
  const [regiPreapproved, setRegiPreapproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [data, profile, transfersData] = await Promise.all([
          getRegiLogsByUser(userId),
          getUser(userId),
          getTransfersByUser(userId),
        ]);
        if (mounted) {
          setLogs(data);
          setTransfers(transfersData);
          setRequiredHours(getRequiredRegiHours(profile));
          setRegiPreapproved(profile?.regiPreapproved ?? false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, refreshKey]);

  const totals = useMemo(() => {
    const approved = logs.filter((l) => l.status === 'approved').reduce((s, l) => s + l.hours, 0);
    const pending = logs.filter((l) => l.status === 'pending').reduce((s, l) => s + l.hours, 0);

    const transferNet = transfers
      .filter((t) => t.status === 'approved')
      .reduce((s, t) => s + (t.direction === 'received' ? t.hours : -t.hours), 0);
    const pendingGivenAway = transfers
      .filter((t) => t.status === 'pending' && t.direction === 'given')
      .reduce((s, t) => s + t.hours, 0);
    const pendingReceived = transfers
      .filter((t) => t.status === 'pending' && t.direction === 'received')
      .reduce((s, t) => s + t.hours, 0);

    const netApproved = approved + transferNet;
    const remaining = regiPreapproved ? 0 : Math.max(requiredHours - netApproved, 0);

    return {
      approved,
      pending,
      total: approved + pending,
      transferNet,
      pendingGivenAway,
      pendingReceived,
      remaining,
    };
  }, [logs, transfers, requiredHours, regiPreapproved]);

  if (loading) return <div className="text-gray-600">Laster...</div>;

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-sm bg-white shadow-sm">
        <div className="font-semibold text-gray-900 mb-1">Oversikt over min regi</div>
        <div className="text-sm text-gray-700">
          Godkjent: <span className="font-semibold">{totals.approved.toFixed(2)}</span> t • Venter:{' '}
          <span className="font-semibold">{totals.pending.toFixed(2)}</span> t • Totalt registrert:{' '}
          <span className="font-semibold">{totals.total.toFixed(2)}</span> t
          {totals.transferNet !== 0 && (
            <>
              {' '}
              • Overført netto:{' '}
              <span
                className={`font-semibold ${totals.transferNet < 0 ? 'text-red-700' : 'text-green-700'}`}
              >
                {totals.transferNet > 0 ? '+' : ''}
                {totals.transferNet.toFixed(2)}
              </span>{' '}
              t
            </>
          )}{' '}
          • Gjenstående timer: <span className="font-semibold">{totals.remaining.toFixed(2)}</span>{' '}
          t
          {regiPreapproved && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-navy-100 text-navy-800 text-xs font-semibold">
              Forhåndsgodkjent
            </span>
          )}
        </div>
        {(totals.pendingGivenAway > 0 || totals.pendingReceived > 0) && (
          <div className="text-xs text-gray-500 mt-1">
            Venter på godkjenning fra Regisjef:{' '}
            {totals.pendingGivenAway > 0 && (
              <span>gir bort {totals.pendingGivenAway.toFixed(2)} t</span>
            )}
            {totals.pendingGivenAway > 0 && totals.pendingReceived > 0 && ', '}
            {totals.pendingReceived > 0 && (
              <span>mottar {totals.pendingReceived.toFixed(2)} t</span>
            )}{' '}
            (ikke trukket fra/lagt til ennå)
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-sm bg-white shadow-sm">
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
                  <td className="px-4 py-3">{new Date(l.date).toLocaleDateString('no-NO')}</td>
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
