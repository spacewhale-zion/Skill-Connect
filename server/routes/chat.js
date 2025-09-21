import express from 'express';
import { getChatHistory, markMessageAsRead } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:taskId', protect, getChatHistory);
router.patch('/message/read/:messageId', protect, markMessageAsRead);

export default router;
