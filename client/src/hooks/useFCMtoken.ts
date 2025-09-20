// src/hooks/useFcmToken.ts
import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../firbase-config";

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        // Request notifications permission
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission !== "granted") {
          console.warn("Notification permission not granted");
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        // Get FCM token
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (fcmToken) {
          setToken(fcmToken);
          console.log("FCM Token:", fcmToken);
        }
      } catch (err) {
        console.error("Error retrieving FCM token:", err);
      }
    };

    if ("serviceWorker" in navigator && "PushManager" in window) {
      retrieveToken();
    } else {
      console.warn("Push messaging is not supported");
    }
  }, []);

  return { token, permissionStatus };
};

export default useFcmToken;
