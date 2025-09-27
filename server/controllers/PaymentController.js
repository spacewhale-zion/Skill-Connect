// spacewhale-zion/skill-connect/Skill-Connect-6ff14bc1e35fe2984b9bfa9c060b6b7639e02145/server/controllers/PaymentController.js
import asyncHandler from 'express-async-handler';
import { verifyWebhook } from '../services/paymentService.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { io } from '../server.js';
import { onlineUsers } from '../sockets/socketHandler.js';
import { sendPushNotification } from '../services/notificationService.js';


/**
 * @desc    Handle incoming webhooks from Stripe
 * @route   POST /api/payments/stripe-webhook
 * @access  Public (Webhook from Stripe)
 */


const stripeWebhookHandler = asyncHandler(async (req, res) => {

  console.log("Webhook received");
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = verifyWebhook(req.body, signature);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log(event.type);
  // Handle the payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('✅ PaymentIntent was successful!', paymentIntent.id);

    // Find the associated task in your DB and update its status
    const task = await Task.findOne({ paymentIntentId: paymentIntent.id });

    if (task && task.status === 'Pending Payment') {
      task.paid = true;
      task.status = 'Assigned';
      await task.save();

      // Notify the provider that the task is funded and officially assigned
       const notificationTitle = 'Payment confirmed!';
       const notificationBody = `Payment for "${task.title}" has been confirmed. You can start working now.`;
       
       const notification = await Notification.create({
         user: task.assignedProvider,
         title: notificationTitle,
         message: notificationBody,
         link: `/tasks/${task._id}`
       });

       const recipientSocketId = onlineUsers.get(task.assignedProvider.toString());

       if (recipientSocketId) {
         io.to(recipientSocketId).emit('new_notification', notification);
       } else {
         const provider = await User.findById(task.assignedProvider);
         if (provider && provider.fcmToken) {
           await sendPushNotification(provider.fcmToken, notificationTitle, notificationBody, { taskId: task._id.toString(), type: 'PAYMENT_CONFIRMED' });
         }
       }

      // Emit a specific event to the task seeker to notify of payment success
      const taskSeekerSocketId = onlineUsers.get(task.taskSeeker.toString());
      if (taskSeekerSocketId) {
        io.to(taskSeekerSocketId).emit('payment_success', { taskId: task._id.toString() });
      }
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

export { stripeWebhookHandler };