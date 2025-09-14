import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging , VAPID_KEY} from '../firbase-config';

const useFcmToken = () => {
  const [token, setToken] = useState('');
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('');

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const status = await Notification.requestPermission();
          setNotificationPermissionStatus(status);

          if (status === 'granted') {
           
            const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            
            if (fcmToken) {
              setToken(fcmToken);
            }
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;