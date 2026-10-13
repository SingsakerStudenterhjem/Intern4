import { useAuth } from '../../../app/providers/AuthContext';
import { useGrantPenaltyRegi } from '../hooks/useGrantPenaltyRegi';
import { canApproveWork } from '../../../shared/permissions';
import React from 'react';

const GrantPenaltyForm: React.FC<{ onCreated?: () => void }> = () => {
  const { user, loading: authLoading } = useAuth();
  const { errors, loading, message, submitting, setField, sortedUsers, handleSubmit, form } =
    useGrantPenaltyRegi(user, authLoading);

  if (authLoading) return null;
  if (!user || !canApproveWork(user.role)) {
    return (
      <div className="p-4 shadow-sm rounded-md bg-gray-50 text-sm text-gray-700">
        Du kan ikke gi strafferegi.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="font-medium text-xl mb-2">Gi strafferegi</h2>
      <p className="text-sm text-gray-600 mb-4">
        Legger timer til brukerens regi-krav for semesteret. Timene brukeren allerede har fått
        godkjent påvirkes ikke.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Bruker</label>
          <select
            value={form.userId}
            onChange={(e) => setField('userId', e.target.value)}
            className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            disabled={loading}
          >
            <option value="">Velg bruker</option>
            {sortedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          {errors.userId && <p className="text-red-600 text-sm mt-1">{errors.userId}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Ekstra timer</label>
          <input
            type="number"
            step="0.25"
            value={form.hours}
            onChange={(e) => setField('hours', e.target.value)}
            className="w-full rounded-sm border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            placeholder="5"
          />
          {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Årsak</label>
          <textarea
            value={form.reason}
            onChange={(e) => setField('reason', e.target.value)}
            className="w-full rounded-sm border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            rows={3}
            placeholder="Hvorfor gis strafferegi?"
          />
          {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason}</p>}
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <button
          type="submit"
          disabled={submitting || loading}
          className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50"
        >
          {submitting ? 'Lagrer...' : 'Gi strafferegi'}
        </button>
      </form>
    </div>
  );
};
export default GrantPenaltyForm;
