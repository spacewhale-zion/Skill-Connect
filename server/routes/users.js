// In server/routes/users.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserById,
  updateUserProfile,
} from '../controllers/userController.js';

const router = express.Router();

// @route   /api/users

router.route('/profile').put(protect, updateUserProfile); // Update logged-in user's profile
router.route('/:id').get(getUserById); // Get public profile of any user

export default router;