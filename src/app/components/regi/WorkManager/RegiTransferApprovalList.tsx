import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { canApproveWork } from '../../../constants/userRoles';
import {
  approveRegiTransfer,
  getPendingTransfers,
  PendingRegiTransfer,
  rejectRegiTransfer,
} from '../../../../server/dao/regiDAO';

const RegiTransferApprovalList: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [transfers, setTransfers] = useState<PendingRegiTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setTransfers(await getPendingTransfers());
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste overføringsforespørsler.');
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

  const handleApprove = async (id: string): Promise<void> => {
    if (!user) return;
    try {
      setActionLoadingId(id);
      await approveRegiTransfer(id, user.id);
      setTransfers((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      setError('Kunne ikke godkjenne overføring.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string): Promise<void> => {
    if (!user) return;
    try {
      setActionLoadingId(id);
      await rejectRegiTransfer(id, user.id);
      setTransfers((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      setError('Kunne ikke avvise overføring.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading) return null;
  if (!user || !canApproveWork(user.role)) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Overføringsforespørsler</h2>
        <p className="text-sm text-gray-600">
          Beboere som ønsker å gi bort regitimer til en annen beboer, venter her på godkjenning.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="border border-gray-200 rounded-sm bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Laster...</div>
        ) : transfers.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Ingen overføringer venter på godkjenning.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transfers.map((t) => {
              const busy = actionLoadingId === t.id;
              return (
                <li key={t.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{t.fromUserName}</span> vil gi{' '}
                      <span className="font-semibold">{t.hours.toFixed(2)} t</span> til{' '}
                      <span className="font-medium">{t.toUserName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('no-NO')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busy}
                      onClick={() => handleApprove(t.id)}
                      className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Godkjenn
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleReject(t.id)}
                      className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Avvis
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RegiTransferApprovalList;
