import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createStripePaymentIntent, stripeWebhookHandler } from '../controllers/PaymentController.js';

const router = express.Router();

// @route /api/payments
router.post('/create-payment-intent', protect, createStripePaymentIntent);

// Stripe webhook needs the raw body, so we disable the default JSON parser for this route
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

export default router;