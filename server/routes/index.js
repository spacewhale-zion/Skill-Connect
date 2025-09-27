import express from 'express';
import authRoutes from './auth.js';
import taskRoutes from './tasks.js';
import userRoutes from './users.js';
import payment from './Payment.js'
import chatRoutes from './chat.js'
import notificationRoutes from "./notification.js"
import serviceRoutes from './services.js';


const router = express.Router();

// Mount each router on its designated path
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/payment',payment);
router.use('/chats', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/services', serviceRoutes);

export default router;