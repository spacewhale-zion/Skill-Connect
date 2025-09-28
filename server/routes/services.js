import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createService, 
  getServices, 
  bookService,
  getMyServices ,
  getServiceById,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

router.route('/myservices').get(protect, getMyServices);

router.route('/')
  .post(protect, createService)
  .get(getServices);

router.route('/:id/book').post(protect, bookService);
router.route('/:id').get(getServiceById).delete(protect, deleteService);

export default router;