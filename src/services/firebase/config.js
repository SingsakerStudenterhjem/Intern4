import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkKP8hwUI_JIFsXzan3RsRmV4Ypi19l3s",
  authDomain: "singinterndevsommer.firebaseapp.com",
  projectId: "singinterndevsommer",
  storageBucket: "singinterndevsommer.firebasestorage.app",
  messagingSenderId: "720132605037",
  appId: "1:720132605037:web:c2922ae94cc367b4e56b64",
  measurementId: "G-M6TBY5RYSF",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
