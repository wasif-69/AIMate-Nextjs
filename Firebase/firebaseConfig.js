import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB-F3w5-By2L3XGfFNiK6wPBxPh9rAW9Lg",
  authDomain: "ai-model-cc61a.firebaseapp.com",
  projectId: "ai-model-cc61a",
  storageBucket: "ai-model-cc61a.firebasestorage.app",
  messagingSenderId: "70774100005",
  appId: "1:70774100005:web:e52d80e122f1e094062fcc",
  measurementId: "G-JYKRZT1QDG"
};

// Initialize Firebase only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics is browser-only
export const analytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  } else {
    return null;
  }
};
