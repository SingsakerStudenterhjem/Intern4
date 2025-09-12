import { auth } from '../../services/firebase/firebaseConfig';
import { Application } from '../types/application';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  confirmPasswordReset,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { User } from '../types/user';
import { Timestamp } from 'firebase/firestore';
import { addUser, getUser, updateUser } from './userDAO';

const generateRandomPassword = (): string => {
  return Math.random().toString(36).slice(-12) + '!A1';
};

const addNewUser = async (application: Application) => {
  try {
    // We want new users to have a randomly generated password
    // so they use the forgot password feature on their first login.
    const password = generateRandomPassword();
    const userCredential = await createUserWithEmailAndPassword(auth, application.email, password);
    const user = userCredential.user;

    const newUser: User = {
      name: application.name,
      email: application.email,
      phone: application.phone,
      birthDate: application.birthDate,
      address: {
        street: application.address.street,
        postalCode: application.address.postalCode,
        city: application.address.city,
      },
      studyPlace: application.studyPlace,
      profilePicture: application.profilePicture || '',
      study: 'annet', // Default value
      seniority: 0, // Default value
      roomNumber: 60, // Default value
      role: 'Halv/Halv', // Default value
      onLeave: false, // Default value
      isActive: true, // Default value
      volunteerPosition: [], // Default value
      createdAt: Timestamp.now(),
    };

    const userId = await addUser(user.uid, newUser);
    return { success: true, uid: userId, user: userCredential.user };
  } catch (error: any) {
    console.error('Create user error:', error);

    let errorMessage = 'Kunne ikke opprette bruker';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'E-postadressen er allerede i bruk';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Ugyldig e-postadresse';
        break;
      default:
        errorMessage += ': ' + error.message;
    }

    return { success: false, error: errorMessage };
  }
};

const logIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const userData = await getUser(userCredential.user.uid);

    if (!userData) {
      await signOut(auth);
      return { success: false, error: 'Brukerprofil ikke funnet' };
    }

    if (!userData.isActive) {
      await signOut(auth);
      return { success: false, error: 'Brukerprofil er deaktivert' };
    }

    await updateUser(userCredential.user.uid, { lastLogin: Timestamp.now() });

    return {
      success: true,
      user: userCredential.user,
      userData: userData,
    };
  } catch (error: any) {
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
};

const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Kunne ikke logge ut' };
  }
};

const forgotPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    throw new Error('Kunne ikke sende tilbakestillings e-post');
  }
};

const confirmResetPassword = async (code: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error: unknown) {
    throw new Error('Kunne ikke bekrefte tilbakestilling av passord');
  }
};

export { addNewUser, logIn, logOut, forgotPassword, confirmResetPassword };
