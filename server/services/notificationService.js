import admin from 'firebase-admin';

/**
 * Sends a push notification to a specific device.
 * @param {string} token - The FCM registration token of the target device.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body/message of the notification.
 * @param {object} [data={}] - An optional key-value payload to send with the notification.
 */
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) {
    console.log('Attempted to send notification, but no FCM token was provided.');
    return;
  }

  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    data: data, // e.g., { taskId: '12345', type: 'NEW_BID' }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export { sendPushNotification };