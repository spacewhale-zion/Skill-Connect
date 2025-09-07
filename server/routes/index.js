import express from 'express';
import authRoutes from './auth.js';
import taskRoutes from './tasks.js';
import userRoutes from './users.js';

const router = express.Router();

// Mount each router on its designated path
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;