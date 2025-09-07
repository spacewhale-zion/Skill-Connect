import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   /api/auth

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private route - requires a valid JWT to access
router.get('/me', protect, getUserProfile);

export default router;