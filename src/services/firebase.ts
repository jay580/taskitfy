import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAa2y0mBwSoD5p75zWlmrB2soegcI0qVes",
  authDomain: "ssiapp-6e196.firebaseapp.com",
  projectId: "ssiapp-6e196",
  storageBucket: "ssiapp-6e196.firebasestorage.app",
  messagingSenderId: "1032701302415",
  appId: "1:1032701302415:web:b0f8be5dc12f598970c2fa",
  measurementId: "G-MZBVR4WM6K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Secondary app for creating users without logging out admin
const secondaryApp = getApps().find(app => app.name === 'SecondaryApp') 
  || initializeApp(firebaseConfig, 'SecondaryApp');

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);
export const storage = getStorage(app);
