// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/server/routes/tasks.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTaskById,
  assignTask,
  completeTask,
  getMyPostedTasks,
  getMyAssignedTasks,
  getPaymentDetailsForTask,
  markCompletedByProvider, // Import the new controller
} from '../controllers/taskController.js';

import { createBid, getBidsForTask } from '../controllers/bidController.js';
import { createReview } from '../controllers/reviewController.js';

const router = express.Router();

router.route('/mytasks').get(protect, getMyPostedTasks);
router.route('/assignedtome').get(protect, getMyAssignedTasks);

router.route('/')
  .post(protect, createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTaskById);

router.route('/:id/payment-details').get(protect, getPaymentDetailsForTask);

router.route('/:id/assign').put(protect, assignTask);
router.route('/:id/complete-by-provider').put(protect, markCompletedByProvider); // Add new route
router.route('/:id/complete').put(protect, completeTask);

router.route('/:taskId/bids')
  .post(protect, createBid)
  .get(protect, getBidsForTask);

router.route('/:taskId/review').post(protect, createReview);

export default router;