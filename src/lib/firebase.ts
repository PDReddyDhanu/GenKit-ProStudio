
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "genkit-prostudio-8404114-90b54",
  "appId": "1:257904682165:web:eb834e7f6d292dab304afc",
  "storageBucket": "genkit-prostudio-8404114-90b54.appspot.com",
  "apiKey": "AIzaSyCJtJyvFEV3IKW4xH1IwIFb8yHChq_7_7U",
  "authDomain": "genkit-prostudio-8404114-90b54.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "257904682165"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
