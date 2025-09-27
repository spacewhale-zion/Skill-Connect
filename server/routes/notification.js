// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/server/routes/notification.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// @route /api/notifications
router.route('/').get(protect, getNotifications);
router.route('/read-all').put(protect, markAllAsRead); // New route
router.route('/:id/read').put(protect, markAsRead);

export default router;