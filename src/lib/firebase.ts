
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "hacksprint-duplicate-idy24",
  "appId": "1:840556866018:web:d12b7cebb615068cf371bb",
  "storageBucket": "hacksprint-duplicate-idy24.firebasestorage.app",
  "apiKey": "AIzaSyDCd3bvNvmEwZ1lh78sXLWvCmpDeMOE3VU",
  "authDomain": "hacksprint-duplicate-idy24.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "840556866018"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
