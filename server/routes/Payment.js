import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {  stripeWebhookHandler } from '../controllers/PaymentController.js';

const router = express.Router();


// Stripe webhook needs the raw body, so we disable the default JSON parser for this route
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

export default router;