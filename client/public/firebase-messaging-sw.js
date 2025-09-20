// public/firebase-messaging-sw.js
// Must use importScripts, not import
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

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
firebase.initializeApp(firebaseConfig);

// Retrieve messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/vite.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
