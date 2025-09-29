// spacewhale-zion/skill-connect/Skill-Connect-8d5e060725284c7b119a64381a1e39067c5f2b04/server/routes/tasks.js
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
  cancelTask,
  getAllMyTasks
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
router.route('/:id/complete-by-provider').put(protect, markCompletedByProvider); // Corrected route
router.route('/:id/complete').put(protect, completeTask);

router.route('/:taskId/bids')
  .post(protect, createBid)
  .get(protect, getBidsForTask);
router.route('/:id/cancel').put(protect, cancelTask);

router.route('/all-my-tasks').get(protect, getAllMyTasks);

router.route('/:taskId/review').post(protect, createReview);

export default router;