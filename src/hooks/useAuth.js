import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase/firebaseConfig";
import { logOut } from "../backend/src/authentication";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Check if user is still active
            if (!userData.isActive) {
              await logOut();
              setUser(null);
              setError("Brukerkonto er deaktivert");
              return;
            }

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
            });
          } else {
            // User document doesn't exist in Firestore
            setError("Brukerprofil ikke funnet");
            await logOut();
            setUser(null);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Kunne ikke laste brukerprofil");
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const result = await logOut();
    if (!result.success) {
      setError(result.error);
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "data",
    isRegisjef: user?.role === "regisjef",
    isUser: user?.role === "user",
  };
};
