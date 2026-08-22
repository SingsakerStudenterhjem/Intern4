import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { addRegiPenalty } from '../../../../server/dao/regiDAO';
import { BasicUserWithRole, getActiveUsersWithRole } from '../../../../server/dao/userDAO';

const FormSchema = z.object({
  userId: z.string().uuid({ message: 'Velg en bruker' }),
  hours: z.coerce.number().positive('Må være > 0'),
  reason: z.string().min(1, 'Årsak er påkrevd'),
});

type FormState = {
  userId: string;
  hours: string;
  reason: string;
};

const GrantPenaltyForm: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({ userId: '', hours: '', reason: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const activeUsers = await getActiveUsersWithRole();
        if (!mounted) return;
        setUsers(activeUsers.filter((u) => u.isActive));
      } catch (error) {
        console.error('Kunne ikke laste brukere', error);
        setMessage('Kunne ikke laste brukere.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setField = (k: keyof FormState, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
    setMessage(null);
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const parsed = FormSchema.safeParse(form);

    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        map[key] = issue.message;
      });
      setErrors(map);
      return;
    }

    if (!user) return;

    try {
      setSubmitting(true);
      await addRegiPenalty(
        { userId: parsed.data.userId, hours: parsed.data.hours, reason: parsed.data.reason },
        user.id
      );

      setMessage('Strafferegi registrert.');
      setForm({ userId: '', hours: '', reason: '' });
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Kunne ikke registrere strafferegi.');
    } finally {
      setSubmitting(false);
    }
  };

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
