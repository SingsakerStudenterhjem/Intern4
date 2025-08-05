import { auth } from "../../services/firebase/firebaseConfig";
import { Application } from "../types/application";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, confirmPasswordReset, sendPasswordResetEmail, signOut } from "firebase/auth";
import { User } from '../types/user';
import { Timestamp } from "firebase/firestore";
import { addUser, getUser } from "./userDAO";

const generateRandomPassword = (): string => {
    return Math.random().toString(36).slice(-12) + "!A1";
};

const addNewUser = async (
    application: Application
) => {
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
            study: application.study,
            studyPlace: application.studyPlace,
            profilePicture: application.profilePicture || "",
            seniority: 0, // Default value
            roomNumber: 0, // Default value
            role: 'Half/Half', // Default value
            onLeave: false, // Default value
            leadershipRoles: [],
            tasks: [],
            createdAt: Timestamp.now(),
        };

        const userId = await addUser(user.uid, newUser);
        return userId;

    } catch (error: any) {
        throw new Error("kunne ikke legge til beboer");
    }
};

const logIn = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        getUser(userCredential.user.uid);
        return userCredential.user.uid;
    } catch (error: any) {
        throw new Error("Feil brukernavn eller passord");
    }
};

const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error("Kunne ikke logge ut");
    }
};

const forgotPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error("Kunne ikke sende tilbakestillings e-post");
    }
};

const confirmResetPassword = async (code: string, newPassword: string) => {
    try {
        await confirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
        throw new Error("Kunne ikke bekrefte tilbakestilling av passord");
    }
};

export { addNewUser, logIn, logOut, forgotPassword, confirmResetPassword };