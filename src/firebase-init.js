/**
 * Firebase Modular SDK initialization — MV3 safe
 * Uses firebase/auth/web-extension which strips reCAPTCHA & GAPI remote loaders
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";

// Injected at build time via Vite define
const firebaseConfig = {
  apiKey: __FIREBASE_API_KEY__,
  authDomain: __FIREBASE_AUTH_DOMAIN__,
  projectId: __FIREBASE_PROJECT_ID__,
  storageBucket: __FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
  appId: __FIREBASE_APP_ID__,
  measurementId: __FIREBASE_MEASUREMENT_ID__,
};

export const analyticsConfig = {
  measurementId: __FIREBASE_MEASUREMENT_ID__,
  apiSecret: typeof __FIREBASE_GA_SECRET__ !== "undefined" ? __FIREBASE_GA_SECRET__ : "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };
