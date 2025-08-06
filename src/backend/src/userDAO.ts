import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "../types/user";
import { db } from "../../services/firebase/firebaseConfig";

export async function addUser(uid: string, data: User): Promise<string | undefined> {
    try {
        const docRef = doc(db, "users", uid);

        await setDoc(docRef, data);
        return uid;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getUser(uid: string): Promise<User | undefined> {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        } else {
            return undefined;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
    try {
        const docRef = doc(db, "users", uid);
        await setDoc(docRef, data, { merge: true });
    } catch (error: any) {
        throw new Error(error.message);
    }
}