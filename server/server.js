import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http'; // Import Node's built-in HTTP module
import { Server } from 'socket.io'; // Import the Socket.IO Server class

// --- Local Imports ---
import connectDB from './config/db.js';
import initializeFirebase from './config/firebase.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { socketHandler } from './sockets/socketHandler.js'; // Import the socket handler

// --- Initializations ---
dotenv.config();
initializeFirebase();
connectDB();

const app = express();

// Create an HTTP server and pass the Express app to it
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Be more specific in production, e.g., 'http://localhost:3000'
    methods: ['GET', 'POST'],
  },
});

// Pass the 'io' instance to the socket handler
socketHandler(io);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('SkillConnect API is running successfully...');
});
app.use('/api', apiRoutes);

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

// Use 'server.listen' instead of 'app.listen'
server.listen(PORT, () =>
  console.log(
    `✅ Server is running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  )
);

// Export 'io' so it can be used in other parts of your app, like controllers
export { io };