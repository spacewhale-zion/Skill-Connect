// In server/routes/tasks.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

// Import ALL task controllers
import {
  createTask,
  getTasks,
  getTaskById,
  assignTask,
  completeTask,
} from '../controllers/taskController.js';

import { createBid, getBidsForTask } from '../controllers/bidController.js';
import { createReview } from '../controllers/reviewController.js';

const router = express.Router();

// --- Main Task Routes ---
router.route('/')
  .post(protect, createTask) // Logged-in user creates a task
  .get(getTasks); // Anyone can get tasks (with filters)

router.route('/:id')
  .get(getTaskById); // Anyone can view a single task

// --- Task Lifecycle Routes ---
router.route('/:id/assign').put(protect, assignTask); // Task seeker assigns a provider
router.route('/:id/complete').put(protect, completeTask); // Task seeker marks as complete

// --- Nested Bid Routes ---
router.route('/:taskId/bids')
  .post(protect, createBid)
  .get(protect, getBidsForTask);

// --- Nested Review Route ---
router.route('/:taskId/review').post(protect, createReview);

export default router;