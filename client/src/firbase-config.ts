// src/firebase-config.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCvKPyKwB7rVlL_C3p0bbwSfwGwPxbEItI",
  authDomain: "skill-connect-5a859.firebaseapp.com",
  projectId: "skill-connect-5a859",
  storageBucket: "skill-connect-5a859.firebasestorage.app",
  messagingSenderId: "371093061749",
  appId: "1:371093061749:web:f3a616854c4aabb939f83c",
  measurementId: "G-MLF2515DSW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Public VAPID key (from Firebase Console → Cloud Messaging → Web Push)
export const VAPID_KEY =
  "BEkT9obTUa0v6RCn059jNm-KG4WU5SLbz73UX4m5R946VhtFJIAe91AZ7X7OgWDlmVXCKvXhqEuusYzh275Z2jc";
