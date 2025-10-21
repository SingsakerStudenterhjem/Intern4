import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase/firebaseConfig';
import { logOut } from '../backend/src/authentication';
import type { User as DomainUser } from '../backend/types/user';

export type AuthUser = DomainUser & { uid: string }; // Firestore user + Firebase UID

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRegisjef: boolean;
  isUser: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Get user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // User document doesn't exist in Firestore
          await logOut();
          setUser(null);
          setError('Brukerprofil ikke funnet');
          setLoading(false);
          return;
        }

        const userData = userDoc.data() as DomainUser;

        // Check if user is still active
        if (!userData.isActive) {
          await logOut();
          setUser(null);
          setError('Brukerkonto er deaktivert');
          setLoading(false);
          return;
        }

        const authUser: AuthUser = { uid: firebaseUser.uid, ...userData };
        setUser(authUser);
      } catch (e) {
        console.error('Error fetching user data:', e);
        setError('Kunne ikke laste brukerprofil');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const result = await logOut();
    if (!result.success) {
      setError(result.error ?? 'Kunne ikke logge ut');
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'data',
    isRegisjef: user?.role === 'regisjef',
    isUser: user?.role === 'user',
  };
};
