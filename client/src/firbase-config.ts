// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const VAPID_KEY="BEkT9obTUa0v6RCn059jNm-KG4WU5SLbz73UX4m5R946VhtFJIAe91AZ7X7OgWDlmVXCKvXhqEuusYzh275Z2jc"