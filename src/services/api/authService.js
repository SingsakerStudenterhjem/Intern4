import { 
    signInWithEmailAndPassword, 
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail 
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
  import { auth, db } from '../firebase/config';
  
  export const authService = {
    // Login user
    login: async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Verify user exists in Firestore and is active
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (!userDoc.exists()) {
          await signOut(auth);
          return { success: false, error: 'Brukerprofil ikke funnet' };
        }
        
        const userData = userDoc.data();
        if (!userData.isActive) {
          await signOut(auth);
          return { success: false, error: 'Brukerkonto er deaktivert' };
        }
        
        // Update last login timestamp
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: new Date()
        });
        
        return { 
          success: true, 
          user: userCredential.user,
          userData: userData
        };
      } catch (error) {
        console.error('Login error:', error);
        
        // Error messages for common Firebase Auth errors
        let errorMessage = 'Det oppstod en feil under innlogging';
        
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Ingen bruker funnet med denne e-postadressen';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Feil passord';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Ugyldig e-postadresse';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Brukerkonto er deaktivert';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'For mange innloggingsforsøk. Prøv igjen senere';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Nettverksfeil. Sjekk internettforbindelsen';
            break;
          default:
            errorMessage = 'Ugyldig e-post eller passord';
        }
        
        return { success: false, error: errorMessage };
      }
    },
  
    // Logout user
    logout: async () => {
      try {
        await signOut(auth);
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: 'Kunne ikke logge ut' };
      }
    },
  
    // Create user (admin only)
    createUser: async (email, password, userData) => {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
  
        // Create user document in Firestore
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          lastLogin: null
        });
  
        return { success: true, uid, user: userCredential.user };
      } catch (error) {
        console.error('Create user error:', error);
        
        let errorMessage = 'Kunne ikke opprette bruker';
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'E-postadressen er allerede i bruk';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Ugyldig e-postadresse';
            break;
          case 'auth/weak-password':
            errorMessage = 'Passordet er for svakt';
            break;
          default:
            errorMessage += ": " + error.message;
        }
        
        return { success: false, error: errorMessage };
      }
    },
  
    // Get user profile
    getUserProfile: async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return { success: true, user: userDoc.data() };
        } else {
          return { success: false, error: 'Bruker ikke funnet' };
        }
      } catch (error) {
        console.error('Get user profile error:', error);
        return { success: false, error: 'Kunne ikke hente brukerprofil' };
      }
    },
  
    // Update user profile
    updateUserProfile: async (uid, updateData) => {
      try {
        await updateDoc(doc(db, 'users', uid), {
          ...updateData,
          updatedAt: new Date()
        });
        return { success: true };
      } catch (error) {
        console.error('Update user profile error:', error);
        return { success: false, error: 'Kunne ikke oppdatere profil' };
      }
    },
  
    // Reset password (send email)
    resetPassword: async (email) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: 'Kunne ikke sende e-post for tilbakestilling' };
      }
    }
  };
  