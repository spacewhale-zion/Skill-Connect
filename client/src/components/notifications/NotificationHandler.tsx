import { useEffect } from 'react';
import useFcmToken from '../../hooks/useFCMtoken';
import { useAuth } from '../../context/authContext';
import { saveFcmToken } from '../../services/userServices';
import toast from 'react-hot-toast';

const NotificationPermissionHandler = () => {
  const { user } = useAuth();
  const { token, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    if (token && user) {
      // Send the token to the backend to be saved
      saveFcmToken(token).catch(err => {
        console.error("Failed to save FCM token:", err);
      });
    }
  }, [token, user]);

  useEffect(() => {
    if (notificationPermissionStatus === 'denied') {
      toast.error('You have disabled notifications. You may miss important updates!', {
        duration: 6000,
      });
    }
  }, [notificationPermissionStatus]);

  // This component doesn't render anything to the UI
  return null;
};

export default NotificationPermissionHandler;