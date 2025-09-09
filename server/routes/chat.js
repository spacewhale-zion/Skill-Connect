import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

// @route /api/chats
router.route('/:taskId').get(protect, getChatHistory);

export default router;