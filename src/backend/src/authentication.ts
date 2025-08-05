import { auth } from "../../services/firebase/firebaseConfig";
import { Søknad } from "../types/søknad";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, confirmPasswordReset, sendPasswordResetEmail, signOut} from "firebase/auth";
import { User } from '../types/user';
import { Timestamp } from "firebase/firestore";
import { leggTilBeboer, hentBeboer } from "./userDAO";

const genererTilfeldigPassord = (): string => {
    return Math.random().toString(36).slice(-12) + "!A1";
};

const leggTilNyBeboer = async (
    søknad: Søknad
) => {
    try {
        // Vi vil at nye brukere skal ha et tilfeldig generert passord
        // slik at de bruker glemt passord ved første innlogging.
        const password = genererTilfeldigPassord();
        const userCredential = await createUserWithEmailAndPassword(auth, søknad.email, password)
        const user = userCredential.user;

        const newuser: User = {
            navn: søknad.navn,
            email: søknad.email,
            telefon: søknad.telefon,
            fødselsdato: søknad.fødselsDato,
            adresse: {
                gate: søknad.adresse.gate,
                postnummer: søknad.adresse.postnummer,
                by: søknad.adresse.poststed,
            },
            studie: søknad.studie,
            studiested: søknad.studiested,
            profilBilde: søknad.profilbilde || "",
            ansiennitet: 0, // Standardverdi
            romNummer: 0, // Standardverdi
            rolle: 'Halv/halv', // Standardverdi
            påpermisjon: false, // Standardverdi
            åpmandsVerv: [],
            regioppgaver: [],
            createdAt: Timestamp.now(),
        };

        const beboerId = await leggTilBeboer(user.uid, newuser);
        return beboerId


    } catch (error: any) {
        throw new Error("Kunne ikke legge til ny beboer");
    }
}

const logInn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      hentBeboer(userCredential.user.uid);
      return userCredential.user.uid;
    } catch (error: any) {
      throw new Error("Feil brukernavn eller passord");
    }
  };

const loggUt = async () => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error("Kunne ikke logge ut");
    }
}

const glemtpassord = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error("Kunne ikke sende e-post for tilbakestilling av passord");
    }
}

const confirmResetPassword = async (code: string, newPassword: string) => {
    try {
        await confirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
        throw new Error("Kunne ikke tilbakestille passord");
    }
}

export { leggTilNyBeboer, logInn, loggUt, glemtpassord, confirmResetPassword};