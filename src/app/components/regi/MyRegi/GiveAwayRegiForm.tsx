import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { giveAwayRegiHours, getNetAvailableHours } from '../../../../server/dao/regiDAO';
import { BasicUserWithRole, getActiveUsersWithRole } from '../../../../server/dao/userDAO';

const FormSchema = z.object({
  toUserId: z.string().uuid({ message: 'Velg en mottaker' }),
  hours: z.coerce.number().positive('Må være > 0'),
});

const GiveAwayRegiForm: React.FC<{ userId: string; onTransferred?: () => void }> = ({
  userId,
  onTransferred,
}) => {
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [available, setAvailable] = useState(0);
  const [toUserId, setToUserId] = useState('');
  const [hours, setHours] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [activeUsers, netAvailable] = await Promise.all([
        getActiveUsersWithRole(),
        getNetAvailableHours(userId),
      ]);
      setUsers(activeUsers.filter((u) => u.isActive && u.id !== userId));
      setAvailable(netAvailable);
    } catch (err) {
      console.error(err);
      setMessage('Kunne ikke laste brukere.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const parsed = FormSchema.safeParse({ toUserId, hours });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        map[issue.path[0] as string] = issue.message;
      });
      setErrors(map);
      return;
    }

    if (parsed.data.hours > available) {
      setErrors({ hours: `Du har kun ${available.toFixed(2)} godkjente timer tilgjengelig` });
      return;
    }

    try {
      setSubmitting(true);
      await giveAwayRegiHours(userId, parsed.data.toUserId, parsed.data.hours);
      setMessage('Timer overført.');
      setToUserId('');
      setHours('');
      await load();
      onTransferred?.();
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Kunne ikke overføre timer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-1">
      <h2 className="font-medium text-xl mb-2">Gi bort regi</h2>
      <p className="text-sm text-gray-600 mb-4">
        Overfør av dine godkjente timer til en annen beboer. Tilgjengelig:{' '}
        <span className="font-semibold">{available.toFixed(2)}</span> t
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Mottaker</label>
          <select
            value={toUserId}
            onChange={(e) => {
              setToUserId(e.target.value);
              setErrors((er) => ({ ...er, toUserId: '' }));
            }}
            className="w-full rounded-sm border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            disabled={loading}
          >
            <option value="">Velg mottaker</option>
            {sortedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          {errors.toUserId && <p className="text-red-600 text-sm mt-1">{errors.toUserId}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Timer</label>
          <input
            type="number"
            step="0.25"
            max={available}
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setErrors((er) => ({ ...er, hours: '' }));
            }}
            className="w-full rounded-sm border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            placeholder="1.5"
          />
          {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <button
          type="submit"
          disabled={submitting || loading || available <= 0}
          className="px-3 py-2 rounded bg-navy-600 text-white disabled:opacity-50"
        >
          {submitting ? 'Overfører...' : 'Gi bort timer'}
        </button>
      </form>
    </div>
  );
};

export default GiveAwayRegiForm;
