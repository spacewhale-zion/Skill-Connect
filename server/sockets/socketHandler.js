import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js'; // Import Notification model
import { io } from '../server.js';
import { sendPushNotification } from '../services/notificationService.js';

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} with socket ID: ${socket.id}`);
    onlineUsers.set(socket.userId, socket.id);

    socket.on('join_chat_room', (taskId) => {
      socket.join(taskId);
      console.log(`User ${socket.userId} joined room: ${taskId}`);
    });

    socket.on('send_message', async (data) => {
      const { conversationId, taskId, text, recipientId } = data;

      try {
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text: text,
        });

        const populatedMessage = await message.populate('sender', 'name profilePicture');
        
        io.to(taskId).emit('message_received', populatedMessage);
        
        // --- NEW CHAT NOTIFICATION LOGIC ---
        const recipientSocketId = onlineUsers.get(recipientId);

        // If recipient is not connected via socket, send a notification
        if (!recipientSocketId) {
          const sender = await User.findById(socket.userId);
          const recipient = await User.findById(recipientId);

          if (sender && recipient) {
            const notificationTitle = `New message from ${sender.name}`;
            const notificationBody = text;
            
            const notification = await Notification.create({
              user: recipientId,
              title: notificationTitle,
              message: notificationBody,
              link: `/tasks/${taskId}`
            });
            
            // If recipient has an FCM token, send a push notification
            if (recipient.fcmToken) {
              await sendPushNotification(
                recipient.fcmToken, 
                notificationTitle, 
                notificationBody, 
                { taskId, type: 'NEW_MESSAGE' }
              );
            }
          }
        }
      } catch (error) {
        console.error('Error in send_message:', error);
      }
    });

    socket.on('leave_chat_room', (taskId) => {
      socket.leave(taskId);
      console.log(`User ${socket.userId} left room: ${taskId}`);
    });
    
    socket.on('typing', (data) => {
      const { taskId } = data;
      socket.to(taskId).emit('typing_started', { senderId: socket.userId });
    });
    
    socket.on('stop_typing', (data) => {
      const { taskId } = data;
      socket.to(taskId).emit('typing_stopped', { senderId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
    });
  });

  return { onlineUsers };
};

export { socketHandler, onlineUsers };
