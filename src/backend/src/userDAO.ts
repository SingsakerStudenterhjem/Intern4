import { doc, getDoc, setDoc } from "firebase/firestore"
import { User } from "../types/user"
import { db } from "../../services/firebase/firebaseConfig"


export async function leggTilBeboer(uid: string, data: User): Promise<string | undefined> {
    try {
      const docRef = doc(db, "users", uid)

      await setDoc(docRef, data)
      return uid
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

export async function hentBeboer(uid: string): Promise<User | undefined> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        return userDoc.data() as User
      } else { 
        throw new Error("Fant ikke bruker")
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

export async function oppdaterbeboer(uid: string, data: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, "users", uid)
      await setDoc(docRef, data, { merge: true })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }