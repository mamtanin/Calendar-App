// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBA_-scycqDeBYypL2YQmBV7HtMiyjLGDk",
  authDomain: "calendar-app-53204.firebaseapp.com",
  projectId: "calendar-app-53204",
  storageBucket: "calendar-app-53204.firebasestorage.app",
  messagingSenderId: "373648790738",
  appId: "1:373648790738:web:64a8d8c42fca7fbd2e890b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
