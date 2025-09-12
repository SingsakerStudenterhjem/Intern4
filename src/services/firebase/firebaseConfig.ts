import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY!,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN!,
  projectId: process.env.REACT_APP_PROJECT_ID!,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET!,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID!,
  appId: process.env.REACT_APP_APP_ID!,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID!,
};

const app =
  process.env.NODE_ENV === 'development'
    ? getApps().length
      ? getApp()
      : initializeApp(firebaseConfig)
    : initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
