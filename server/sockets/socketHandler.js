// server/sockets/socketHandler.js
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendPushNotification } from '../services/notificationService.js';

const onlineUsers = new Map();

const socketHandler = (io) => {
  // Middleware: authenticate user via JWT
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.id})`);
    onlineUsers.set(socket.userId, socket.id);

    // Join chat room
    socket.on('join_chat_room', (taskId) => {
      socket.join(taskId);
      console.log(`User ${socket.userId} joined room ${taskId}`);
    });

    // Send message
    socket.on('send_message', async ({ conversationId, taskId, text, recipientId }) => {
      try {
        // Save message in DB
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text,
        });

        const populatedMessage = await message.populate('sender', 'name profilePicture');

        // Emit message to room
        io.to(taskId).emit('message_received', populatedMessage);

        // Push notification for offline recipient
        const recipient = await User.findById(recipientId);
        if (recipient && recipient.fcmToken && !onlineUsers.has(recipientId)) {
          try {
            await sendPushNotification(
              recipient.fcmToken,
              `New message from ${populatedMessage.sender.name}`,
              text,
              { taskId, type: 'NEW_MESSAGE' }
            );
          } catch (err) {
            console.warn('FCM send error:', err.message);
            if (err.message === 'Invalid FCM token') {
              recipient.fcmToken = null;
              await recipient.save();
            }
          }
        }

        // Save notification in DB
        await Notification.create({
          user: recipientId,
          title: `New message from ${populatedMessage.sender.name}`,
          message: text,
          link: `/tasks/${taskId}`,
          isRead: false,
        });

      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // Leave chat room
    socket.on('leave_chat_room', (taskId) => socket.leave(taskId));

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
    });
  });

  return { onlineUsers };
};

export { socketHandler, onlineUsers };
