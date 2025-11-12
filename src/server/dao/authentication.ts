import { supabase } from '../supabaseClient';
import { Application } from '../../shared/types/application';
import { User } from '../../shared/types/user';
import { addUser, getUser } from './userDAO';

const generateRandomPassword = (): string => {
  return Math.random().toString(36).slice(-12) + '!A1';
};

// NOTE: This function assumes an admin Supabase client is used.
// Regular client-side createUser is not available in server environments.
const addNewUser = async (userData: Omit<User, 'createdAt'>) => {
  try {
    const password = generateRandomPassword();
    // @ts-ignore
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true, // Users will need to confirm their email
    });

    if (authError) {
      throw authError;
    }
    if (!authData.user) {
      throw new Error('User could not be created in auth provider.');
    }

    const newUser: User = {
      ...userData,
      createdAt: new Date(),
    };

    const userId = await addUser(authData.user.id, newUser);
    return { success: true, uid: userId, user: authData.user };
  } catch (error: any) {
    console.error('Create user error:', error);
    let errorMessage = 'Kunne ikke opprette bruker: ' + error.message;
    return { success: false, error: errorMessage };
  }
};

const addNewUserFromApplication = async (application: Application) => {
  try {
    const password = generateRandomPassword();
    // @ts-ignore
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: application.email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User could not be created in auth provider.');

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
      roomNumber: 0, // Default value
      role: 'Halv/Halv', // Default value
      onLeave: false, // Default value
      isActive: true, // Default value
      createdAt: new Date(),
    };

    const userId = await addUser(authData.user.id, newUser);
    return { success: true, uid: userId, user: authData.user };
  } catch (error: any) {
    console.error('Create user from application error:', error);
    let errorMessage = 'Kunne ikke opprette bruker fra søknad: ' + error.message;
    return { success: false, error: errorMessage };
  }
};

const logIn = async (email: string, password: string) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Could not sign in');

    const userData = await getUser(authData.user.id);

    if (!userData) {
      await supabase.auth.signOut();
      return { success: false, error: 'Brukerprofil ikke funnet' };
    }

    if (!userData.isActive) {
      await supabase.auth.signOut();
      return { success: false, error: 'Brukerprofil er deaktivert' };
    }

    // Note: lastLogin from previous implementation is not in the new schema.

    return {
      success: true,
      user: authData.user,
      userData: userData,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Innlogging feilet: ' + error.message };
  }
};

const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: 'Kunne ikke logge ut: ' + error.message };
  }
};

const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error('Kunne ikke sende tilbakestillings e-post: ' + error.message);
    }
};

// confirmResetPassword is not needed with Supabase's standard email link flow.
// The user clicks a link in the email and is taken to a page to enter a new password.
// The password update is handled on the client side.

export { addNewUser, addNewUserFromApplication, logIn, logOut, forgotPassword };
