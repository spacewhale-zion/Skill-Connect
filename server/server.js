// In server.js

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import route files
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js'; // <-- Import user routes

// ... (dotenv.config(), connectDB(), etc.)

const app = express();
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes); // <-- Mount the new user routes

// ... (PORT and app.listen)