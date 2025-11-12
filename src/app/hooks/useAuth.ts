import { useEffect, useState } from 'react';
import { supabase } from '../../server/supabaseClient';

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
} | null;

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async (_evt, session) => {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // read profile from Supabase “users” table
      const { data, error } = await supabase
        .from('users')
        .select('name, role, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        setError('Kunne ikke laste brukerprofil');
        setUser({ id: session.user.id, email: session.user.email ?? undefined });
      } else {
        setUser({ id: session.user.id, name: data?.name, role: data?.role, email: data?.email });
      }
      setLoading(false);
    }).data.subscription;

    return () => sub.unsubscribe();
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };

  return { user, loading, error, logout, isAuthenticated: !!user, isAdmin: user?.role === 'Data Åpmand' || user?.role === 'Daglig leder' };
};