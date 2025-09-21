// server/services/notificationService.js
import admin from 'firebase-admin';

/**
 * Sends a push notification to a specific device.
 * @param {string} token - The FCM registration token of the target device.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body/message of the notification.
 * @param {object} [data={}] - Optional key-value payload.
 */
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) {
    console.log('No FCM token provided. Skipping notification.');
    return;
  }

  const message = {
    token,
    notification: { title, body },
    data: { ...data, timestamp: new Date().toISOString() },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending push notification:', error);

    // Handle invalid/stale token
    if (
      error.code === 'messaging/registration-token-not-registered' ||
      error.code === 'messaging/invalid-argument'
    ) {
      throw new Error('Invalid FCM token');
    }
  }
};

export { sendPushNotification };
