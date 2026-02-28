import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAo5BiDfHq3Y5z2hb3Or05DoIM5BOdDIJc",
  authDomain: "roselyra-fashion.firebaseapp.com",
  projectId: "roselyra-fashion",
  storageBucket: "roselyra-fashion.firebasestorage.app",
  messagingSenderId: "856056167699",
  appId: "1:856056167699:web:25fc52c49e44fa057feee6",
  measurementId: "G-D5TLX26QN1"
};

let app: FirebaseApp;
let auth: Auth;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else if (typeof window !== "undefined") {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app, auth };
