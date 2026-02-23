import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration for Vibexathon-26 project
 * Get values from Firebase Console → Project Settings → General → Your apps
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "Vibexathon-26.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "Vibexathon-26",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "Vibexathon-26.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "843448979185",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:843448979185:web:c19c843d60dbc967de2350",
};

if (!firebaseConfig.apiKey) {
  console.error(
    "❌ Firebase API key missing! Create a .env file with VITE_FIREBASE_API_KEY=your_api_key (see .env.example)"
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * TROUBLESHOOTING:
 * If you see "Sync Error" in the app:
 * 1. Check your Firestore "Rules" tab in the Firebase Console.
 * 2. Ensure it says: 
 *    allow read, write: if true; 
 *    (Or that you are in "Test Mode").
 */
