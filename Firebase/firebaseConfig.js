import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-F3w5-By2L3XGfFNiK6wPBxPh9rAW9Lg",
  authDomain: "ai-model-cc61a.firebaseapp.com",
  projectId: "ai-model-cc61a",
  storageBucket: "ai-model-cc61a.firebasestorage.app",
  messagingSenderId: "70774100005",
  appId: "1:70774100005:web:e52d80e122f1e094062fcc",
  measurementId: "G-JYKRZT1QDG"
};


const app=initializeApp(firebaseConfig)


export const analytics=getAnalytics(app);
export const auth=getAuth(app)
export const db=getFirestore(app)
export const storage = getStorage(app);
