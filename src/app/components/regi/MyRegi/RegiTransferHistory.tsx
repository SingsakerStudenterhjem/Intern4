import React, { useEffect, useState } from 'react';
import { getTransfersByUser, RegiTransferWithCounterparty } from '../../../../server/dao/regiDAO';

const RegiTransferHistory: React.FC<{ userId: string; refreshKey?: number }> = ({
  userId,
  refreshKey,
}) => {
  const [transfers, setTransfers] = useState<RegiTransferWithCounterparty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await getTransfersByUser(userId);
      if (mounted) {
        setTransfers(data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, refreshKey]);

  if (loading) return <div className="text-gray-600">Laster...</div>;
  if (transfers.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-sm bg-white shadow-sm">
      <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">
        Overføringshistorikk
      </div>
      <div className="max-h-[280px] overflow-auto">
        <table className="min-w-full text-sm">
          <tbody className="divide-y divide-gray-200">
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {t.direction === 'given' ? (
                    <span>
                      Ga <span className="font-semibold">{t.hours.toFixed(2)}</span> t til{' '}
                      {t.counterpartyName}
                    </span>
                  ) : (
                    <span>
                      Mottok <span className="font-semibold">{t.hours.toFixed(2)}</span> t fra{' '}
                      {t.counterpartyName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {new Date(t.createdAt).toLocaleDateString('no-NO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegiTransferHistory;
