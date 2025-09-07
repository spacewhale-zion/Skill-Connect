import asyncHandler from 'express-async-handler';
import { createPaymentIntent, verifyWebhook } from '../services/paymentService.js';
import Task from '../models/Task.js';

/**
 * @desc    Create a Stripe Payment Intent for a task
 * @route   POST /api/payments/create-payment-intent
 * @access  Private
 */
const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { taskId } = req.body;
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const paymentIntent = await createPaymentIntent(task.budget.amount);

  // Send the client_secret to the frontend to process the payment
  res.status(201).json({
    clientSecret: paymentIntent.client_secret,
  });
});

/**
 * @desc    Handle incoming webhooks from Stripe
 * @route   POST /api/payments/stripe-webhook
 * @access  Public (Webhook from Stripe)
 */
const stripeWebhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = verifyWebhook(req.body, signature);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('✅ PaymentIntent was successful!', paymentIntent.id);
    // Here, find the associated task in your DB and update its status to 'Paid'.
    // You'd typically store the paymentIntent.id when it's created.
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

export { createStripePaymentIntent, stripeWebhookHandler };