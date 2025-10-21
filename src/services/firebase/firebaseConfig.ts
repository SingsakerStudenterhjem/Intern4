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

const firebaseConfig = {
  apiKey: 'AIzaSyBR4h0WoNBbLR-9Ee8s1_Et04h75A4EVg4',
  authDomain: 'singintern4.firebaseapp.com',
  projectId: 'singintern4',
  storageBucket: 'singintern4.firebasestorage.app',
  messagingSenderId: '301175057267',
  appId: '1:301175057267:web:6e069fab508796787b7306',
  measurementId: 'G-4EXHDXR1JT',
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
