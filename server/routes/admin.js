// server/routes/admin.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import {
  getAllUsers,
  suspendUser,
  deleteTask,
  deleteService,
  getAllTasks,   // <-- Import new controller function
  getAllServices ,// <-- Import new controller function
  getAdminStats
} from '../controllers/adminController.js';

const router = express.Router();

// Apply admin middleware to all routes in this file
router.use(protect, admin);
router.route('/stats').get(getAdminStats);
// User Management Routes
router.route('/users').get(getAllUsers);
router.route('/users/:id/suspend').put(suspendUser);

// Content Management Routes
router.route('/tasks').get(getAllTasks); // <-- Add route to get all tasks
router.route('/tasks/:id').delete(deleteTask);

router.route('/services').get(getAllServices); // <-- Add route to get all services
router.route('/services/:id').delete(deleteService);

export default router;