import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword, // <-- Import
  resetPassword,  // <-- Import
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword); // <-- Add route for forgot password
router.patch('/reset-password/:token', resetPassword); // <-- Add route for reset password

// Private route
router.get('/me', protect, getUserProfile);

export default router;