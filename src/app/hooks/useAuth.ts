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
    let isMounted = true;

    const loadInitialSession = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('name, email, roles(name)')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setError('Kunne ikke laste brukerprofil');
        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
        });
      } else {
        const roleName = (data as any)?.roles?.name as string | undefined;

        setUser({
          id: session.user.id,
          name: data?.name ?? undefined,
          email: data?.email ?? undefined,
          role: roleName,
        });
      }

      setLoading(false);
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      supabase
        .from('users')
        .select('name, email, roles(name)')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!isMounted) return;

          if (error) {
            setError('Kunne ikke laste brukerprofil');
            setUser({
              id: session.user.id,
              email: session.user.email ?? undefined,
            });
          } else {
            const roleName = (data as any)?.roles?.name as string | undefined;

            setUser({
              id: session.user.id,
              name: data?.name ?? undefined,
              email: data?.email ?? undefined,
              role: roleName,
            });
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setError('Kunne ikke laste brukerprofil');
          setUser({
            id: session.user.id,
            email: session.user.email ?? undefined,
          });
        });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Data' || user?.role === 'Daglig leder',
  };
};
