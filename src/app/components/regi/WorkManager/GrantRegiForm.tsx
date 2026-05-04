import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '../../../../contexts/authContext';
import { Category } from '../../../../shared/types/regi/tasks';
import { WorkTypeSchema } from '../../../../shared/types/regi';
import { addRegiLog } from '../../../../server/dao/regiDAO';
import { getActiveUsersWithRole } from '../../../../server/dao/userDAO';
import { BasicUserWithRole } from '../../../../shared/types/user';
import { getCategories } from '../../../../server/dao/categoriesDAO';

const FormSchema = z.object({
  userId: z.string().uuid({ message: 'Velg en bruker' }),
  title: z.string().min(1, 'Påkrevd'),
  description: z.string().min(1, 'Påkrevd'),
  date: z.string().min(1, 'Påkrevd'),
  hours: z.coerce.number().positive('Må være > 0'),
  type: WorkTypeSchema,
});

type FormState = {
  userId: string;
  title: string;
  description: string;
  date: string;
  hours: string;
  type: string;
};

const GrantRegiForm: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({
    userId: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    type: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [cats, activeUsers] = await Promise.all([getCategories(), getActiveUsersWithRole()]);
        if (!mounted) return;

        setCategories(cats);
        setUsers(activeUsers.filter((u) => u.isActive));

        if (cats.length > 0) {
          setForm((prev) => ({ ...prev, type: prev.type || cats[0].name }));
        }
      } catch (error) {
        console.error('Kunne ikke laste data', error);
        setMessage('Kunne ikke laste brukere eller kategorier.');
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

    const parsed = FormSchema.safeParse({
      ...form,
      hours: form.hours,
    });

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
      await addRegiLog({
        userId: parsed.data.userId,
        title: parsed.data.title,
        description: parsed.data.description,
        date: new Date(parsed.data.date),
        hours: parsed.data.hours,
        type: parsed.data.type,
      });

      setMessage('Regitimer registrert og sendt til godkjenning.');
      setForm({
        userId: '',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        type: categories[0]?.name ?? '',
      });
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Kunne ikke registrere regi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-1">
      <h2 className="font-medium text-xl mb-2">Gi regitimer</h2>
      <p className="text-sm text-gray-600 mb-4">
        Registrer regi på vegne av aktive brukere. Registreringer må fortsatt godkjennes.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Bruker</label>
          <select
            value={form.userId}
            onChange={(e) => setField('userId', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block mb-1 text-sm font-medium text-gray-700">Tittel</label>
          <input
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Arbeidet oppsummert"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Arbeidets art</label>
          <select
            value={form.type}
            onChange={(e) => setField('type', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Velg type</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Beskrivelse</label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Forklaring av arbeidet"
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Dato</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Timer</label>
            <input
              type="number"
              step="0.25"
              value={form.hours}
              onChange={(e) => setField('hours', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1.5"
            />
            {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
          </div>
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <button
          type="submit"
          disabled={submitting || loading}
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {submitting ? 'Lagrer...' : 'Registrer'}
        </button>
      </form>
    </div>
  );
};

export default GrantRegiForm;
