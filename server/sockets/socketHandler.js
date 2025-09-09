import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

// This Map will store the mapping of userId to socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
  // --- Socket.IO Middleware for Authentication ---
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Check if the user exists in the database for extra security
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }
      socket.userId = user._id.toString(); // Attach userId to the socket object
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  // --- Main Connection Handler ---
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} with socket ID: ${socket.id}`);

    // Add user to the online users map
    onlineUsers.set(socket.userId, socket.id);

    // --- Event Listeners ---

    // Listener for one-on-one chat messages
    socket.on('send_message', (data) => {
      const { recipientId, message } = data;
      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        // If the recipient is online, send the message directly to their socket
        io.to(recipientSocketId).emit('message_received', {
          senderId: socket.userId,
          message: message,
        });
      } else {
        // Optional: Handle offline users (e.g., save message to DB, send push notification)
        console.log(`User ${recipientId} is offline.`);
      }
    });
    
    // Listener for typing indicators
    socket.on('typing', (data) => {
      const { recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing_started', { senderId: socket.userId });
      }
    });
    
    socket.on('stop_typing', (data) => {
      const { recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing_stopped', { senderId: socket.userId });
      }
    });

    // --- Disconnect Handler ---
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      // Remove user from the online users map
      onlineUsers.delete(socket.userId);
    });
  });

  // You can return the onlineUsers map if you need to access it elsewhere
  return { onlineUsers };
};

export { socketHandler, onlineUsers };