import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import {
  getAllUsers,
  suspendUser,
  deleteTask,
  deleteService,
} from '../controllers/adminController.js';

const router = express.Router();


router.use(protect, admin);

// User Management Routes
router.route('/users').get(getAllUsers);
router.route('/users/:id/suspend').put(suspendUser);

// Content Management Routes
router.route('/tasks/:id').delete(deleteTask);
router.route('/services/:id').delete(deleteService);

export default router;