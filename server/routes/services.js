import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createService, 
  getServices, 
  bookService,
  getMyServices ,
    getServiceById
} from '../controllers/serviceController.js';

const router = express.Router();

router.route('/myservices').get(protect, getMyServices); // <-- ADD THIS ROUTE

router.route('/')
  .post(protect, createService)
  .get(getServices);

router.route('/:id/book').post(protect, bookService);
router.route('/:id').get(getServiceById);

export default router;