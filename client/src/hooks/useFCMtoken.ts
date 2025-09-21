// src/hooks/useFcmToken.ts
import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../firbase-config";
import { useAuth } from "../context/authContext"; // Assuming you have this context

const useFcmToken = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");

  // Send FCM token to backend whenever it changes
  useEffect(() => {
    if (token && user?.token) {
      fetch("/api/users/fcm-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to save FCM token");
          return res.json();
        })
        .then((data) => console.log("FCM token saved:", data))
        .catch((err) => console.error(err));
    }
  }, [token, user?.token]);

  // Retrieve FCM token
  useEffect(() => {
    const retrieveToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission !== "granted") {
          console.warn("Notification permission not granted");
          return;
        }

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

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
