import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js'; // Import the Message model

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
    onlineUsers.set(socket.userId, socket.id);

    // --- CHAT EVENT LISTENERS ---

    /**
     * @desc Client joins a chat room based on the Task ID
     */
    socket.on('join_chat_room', (taskId) => {
      socket.join(taskId);
      console.log(`User ${socket.userId} joined room: ${taskId}`);
    });

    /**
     * @desc Client sends a message to a room
     */
    socket.on('send_message', async (data) => {
      const { conversationId, taskId, text } = data;

      try {
        // 1. Create and save the message to the database
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text: text,
        });

        // 2. Populate the sender info to send the full message object to clients
        const populatedMessage = await message.populate('sender', 'name profilePicture');
        
        // 3. Broadcast the new message to everyone in the specific task room
        io.to(taskId).emit('message_received', populatedMessage);

      } catch (error) {
        console.error('Error saving message or broadcasting:', error);
      }
    });

    /**
     * @desc Client leaves a chat room
     */
    socket.on('leave_chat_room', (taskId) => {
      socket.leave(taskId);
      console.log(`User ${socket.userId} left room: ${taskId}`);
    });
    
    /**
     * @desc Client is typing
     */
    socket.on('typing', (data) => {
      const { taskId } = data; // Use taskId as the room identifier
      // Broadcast to everyone in the room *except* the sender
      socket.to(taskId).emit('typing_started', { senderId: socket.userId });
    });
    
    /**
     * @desc Client stopped typing
     */
    socket.on('stop_typing', (data) => {
      const { taskId } = data; // Use taskId as the room identifier
      socket.to(taskId).emit('typing_stopped', { senderId: socket.userId });
    });

    // --- Disconnect Handler ---
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
    });
  });

  // You can return the onlineUsers map if you need to access it elsewhere
  return { onlineUsers };
};

export { socketHandler, onlineUsers };