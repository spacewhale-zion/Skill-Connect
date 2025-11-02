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
  markCompletedByProvider,
  cancelTask,
  getAllMyTasks, // Make sure this is imported
} from '../controllers/taskController.js';
import { createBid, getBidsForTask } from '../controllers/bidController.js';
import { createReview } from '../controllers/reviewController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createTaskSchema } from '../middleware/validationSchema.js';

const router = express.Router();

// --- CORRECTED ROUTE ORDER ---
// Specific routes should come before general/parameterized routes.

router.route('/all-my-tasks').get(protect, getAllMyTasks); // Most specific
router.route('/mytasks').get(protect, getMyPostedTasks);
router.route('/assignedtome').get(protect, getMyAssignedTasks);

router.route('/')
  .post(protect, createTask)
  .get(getTasks);

// Parameterized routes come last
router.route('/:id')
  .get(getTaskById);

router.route('/:id/payment-details').get(protect, getPaymentDetailsForTask);
router.route('/:id/assign').put(protect, assignTask);
router.route('/:id/complete-by-provider').put(protect, markCompletedByProvider);
router.route('/:id/complete').put(protect, completeTask);
router.route('/:id/cancel').put(protect, cancelTask);

router.route('/:taskId/bids')
  .post(protect, createBid)
  .get(protect, getBidsForTask);
  
router.route('/:taskId/review').post(protect, createReview);

export default router;