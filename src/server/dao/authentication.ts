import { supabase } from '../supabaseClient';

export type LoginResult =
  | { success: true; user: SupabaseUser; session: Session }
  | { success: false; error: string };

export async function logIn(email: string, password: string): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user || !data.session) {
      return {
        success: false,
        error: 'Innlogging feilet: ' + (error?.message ?? 'ukjent feil'),
      };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'NetworkError when attempting to fetch resource';
    return { success: false, error: 'Innlogging feilet: ' + message };
  }
}

export type LogoutResult =
  | { success: true }
  | { success: false; error: string };

export async function logOut(): Promise<LogoutResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: 'Kunne ikke logge ut: ' + error.message };
    }
    return { success: true };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'NetworkError when attempting å kontakte auth-tjenesten';
    return { success: false, error: 'Kunne ikke logge ut: ' + message };
  }
}

// export async function forgotPassword(email: string) {
//   const { error } = await supabase.auth.resetPasswordForEmail(email);
//   if (error) throw new Error('Kunne ikke sende tilbakestillings e-post: ' + error.message);
// }
