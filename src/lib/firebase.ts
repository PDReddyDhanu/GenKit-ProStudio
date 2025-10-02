
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (!firebaseConfigString) {
    throw new Error("Missing Firebase configuration. Please set NEXT_PUBLIC_FIREBASE_CONFIG in your .env file.");
}

// Safely parse the config. It might be a stringified JSON or a plain object.
const firebaseConfig = JSON.parse(firebaseConfigString);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
