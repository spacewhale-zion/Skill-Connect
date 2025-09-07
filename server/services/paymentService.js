import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe Payment Intent.
 * @param {number} amount - The amount in the base currency (e.g., INR).
 * @returns {Promise<object>} The Stripe Payment Intent object.
 */
const createPaymentIntent = async (amount) => {
  // Stripe also requires the amount in the smallest currency unit (e.g., paise)
  const amountInPaise = Math.round(amount * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr', // or 'usd', 'eur', etc.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe Payment Intent creation failed:', error);
    throw new Error('Could not create payment intent.');
  }
};

/**
 * Verifies and constructs a webhook event from Stripe.
 * @param {Buffer} body - The raw request body from the webhook.
 * @param {string} signature - The value of the 'stripe-signature' header.
 * @returns {Stripe.Event} The verified Stripe event object.
 */
const verifyWebhook = (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error('Invalid webhook signature.');
  }
};

export { createPaymentIntent, verifyWebhook };