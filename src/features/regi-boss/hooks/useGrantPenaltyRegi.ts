import { z } from 'zod';
import { supabase } from '../../../server/supabaseClient';
import { AuthUser } from '../../auth/hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BasicUserWithRole } from '../../../shared/types/user';
import { getActiveUsersWithRole } from '../../../server/dao/userDAO';
import { canApproveWork } from '../../../shared/permissions';

const FormSchema = z.object({
  userId: z.string().uuid({ message: 'Velg en bruker' }),
  hours: z.coerce.number().positive('Må være > 0'),
  reason: z.string().min(1, 'Årsak er påkrevd'),
});

type Form = z.infer<typeof FormSchema>;

async function addRegiPenalty(
  data: { userId: string; hours: number; reason: string },
  assignedByUuid: string
): Promise<string> {
  const { data: created, error } = await supabase
    .from('regi_penalties')
    .insert({
      user_uuid: data.userId,
      hours: data.hours,
      reason: data.reason,
      assigned_by_uuid: assignedByUuid,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return String(created.id);
}

export const useGrantPenaltyRegi = (user: AuthUser, authLoading: boolean) => {
  const [form, setForm] = useState<Form>({ userId: '', hours: 0, reason: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const activeUsersResponse = await getActiveUsersWithRole();
      setUsers(activeUsersResponse.filter((u) => u.isActive));
    } catch (error) {
      console.error('Kunne ikke laste brukere', error);
      setMessage('Kunne ikke laste brukere.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canApproveWork(user.role)) return;
    void load();
  }, [authLoading, load, user]);

  const setField = (k: keyof Form, v: string) => {
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
      setForm({ userId: '', hours: 0, reason: '' });
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Kunne ikke registrere strafferegi.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    errors,
    loading,
    message,
    submitting,
    setField,
    sortedUsers,
    handleSubmit,
    form,
  };
};
