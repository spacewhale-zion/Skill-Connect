import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword, 
  resetPassword,  
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../middleware/validationSchema.js';

const router = express.Router();


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 minutes for auth actions
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);

router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', authLimiter, resetPassword);
router.post('/verify-email', authLimiter, verifyEmail);

// Private route
router.get('/me', protect, getUserProfile);

export default router;