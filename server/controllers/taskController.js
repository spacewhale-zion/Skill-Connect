import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { io } from '../server.js';
import { onlineUsers } from '../sockets/socketHandler.js';
import { sendPushNotification } from '../services/notificationService.js';
import { createPaymentIntent } from '../services/paymentService.js'; // <-- This was the missing line
import { stripe } from '../services/paymentService.js';
/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, budget, location } = req.body;

  if (!title || !description || !category || !budget || !location) {
    res.status(400);
    throw new Error('Please provide all required fields.');
  }

  const task = await Task.create({
    title,
    description,
    category,
    budget,
    location,
    taskSeeker: req.user._id, // Set the creator of the task
  });

  res.status(201).json(task);
});



/**
 * @desc    Get tasks, with optional geo-filtering
 * @route   GET /api/tasks
 * @access  Public
 */


const getTasks = asyncHandler(async (req, res) => {
  const { lat, lng, radius, category, keyword, maxBudget } = req.query;

  let tasksQuery = { status: 'Open' };

  // Step 1: Keyword/Skill search (if provided)
  let textMatchedIds = null;
  if (keyword) {
    const textResults = await Task.find(
      { $text: { $search: keyword }, status: 'Open' },
      { _id: 1 }
    );
    textMatchedIds = textResults.map((doc) => doc._id);

    // if no match, return early
    if (textMatchedIds.length === 0) {
      return res.status(200).json([]);
    }
  }

  // Step 2: Build base query
  if (category) {
    tasksQuery.category = category;
  }
  if (maxBudget) {
    tasksQuery['budget.amount'] = { $lte: parseInt(maxBudget) };
  }
  if (textMatchedIds) {
    tasksQuery._id = { $in: textMatchedIds };
  }

  // Step 3: Handle geospatial separately
  let tasks;
  if (lat && lng && radius) {
    const radiusInMeters = parseInt(radius) * 1000;
    tasks = await Task.find({
      ...tasksQuery,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .populate('taskSeeker', 'name profilePicture')
      .sort({ createdAt: -1 });
  } else {
    tasks = await Task.find(tasksQuery)
      .populate('taskSeeker', 'name profilePicture')
      .sort({ createdAt: -1 });
  }

  res.status(200).json(tasks);
});



/**
 * @desc    Get a single task by its ID
 * @route   GET /api/tasks/:id
 * @access  Public
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('taskSeeker', 'name profilePicture averageRating')
    .populate('assignedProvider', 'name profilePicture averageRating')
    .populate({ // Populate reviews and the reviewer's details
      path: 'reviews',
      populate: {
        path: 'reviewer',
        select: 'name profilePicture'
      }
    });

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  res.status(200).json(task);
});
/**
 * @desc    Assign a provider to a task
 * @route   PUT /api/tasks/:id/assign
 * @access  Private (only for the task seeker)
 */


/**
 * @desc    Assign a provider to a task and handle payment method
 * @route   PUT /api/tasks/:id/assign
 * @access  Private (only for the task seeker)
 */
const assignTask = asyncHandler(async (req, res) => {
  const { providerId, bidId, paymentMethod } = req.body; // paymentMethod will come from the frontend
  const task = await Task.findById(req.params.id);
  const bid = await Bid.findById(bidId);

  if (!task || !bid) {
    res.status(404);
    throw new Error('Task or Bid not found.');
  }

  // Authorization: Check if logged-in user is the task creator
  if (!task.taskSeeker.equals(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to assign this task.');
  }

  // Allow assignment if the task is open OR already pending payment
  if (task.status !== 'Open' && task.status !== 'Pending Payment') {
    res.status(400);
    throw new Error('Task is not open for assignment.');
  }

  // --- LOGIC FOR PAYMENT METHOD ---
  if (paymentMethod === 'Cash') {
    // If cash, assign the task directly without involving Stripe for payment intent
    task.assignedProvider = providerId;
    task.status = 'Assigned';
    task.paymentMethod = 'Cash'; // Record the chosen payment method
    
    const updatedTask = await task.save();

    // Update the accepted bid's status
    await Bid.findByIdAndUpdate(bidId, { status: 'Accepted' });
    // Reject all other bids for this task
    await Bid.updateMany(
        { task: req.params.id, _id: { $ne: bidId } },
        { status: 'Rejected' }
    );
    
    // --- Notification logic for the provider ---
    const notificationTitle = 'Your bid was accepted!';
    const notificationBody = `Your bid for the task "${task.title}" has been accepted. You will be paid in cash upon completion.`;
    const notification = await Notification.create({
        user: providerId,
        title: notificationTitle,
        message: notificationBody,
        link: `/tasks/${task._id}`
    });
    const recipientSocketId = onlineUsers.get(providerId.toString());
    if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_notification', notification);
    } else {
        const provider = await User.findById(providerId);
        if (provider && provider.fcmToken) {
            await sendPushNotification(provider.fcmToken, notificationTitle, notificationBody, { taskId: task._id.toString(), type: 'BID_ACCEPTED' });
        }
    }
    
    // Respond without a clientSecret as no online payment is needed
    res.status(200).json({ task: updatedTask, clientSecret: null });

  } else {
    // Default to Stripe if 'Cash' is not specified
    const paymentIntent = await createPaymentIntent(bid.amount);

    task.assignedProvider = providerId;
    task.status = 'Pending Payment';
    task.paymentMethod = 'Stripe';
    task.paymentIntentId = paymentIntent.id;

    const updatedTask = await task.save();

    await Bid.findByIdAndUpdate(bidId, { status: 'Accepted' });
    await Bid.updateMany(
      { task: req.params.id, _id: { $ne: bidId } },
      { status: 'Rejected' }
    );
    
    // --- Notification logic for the provider ---
    const notificationTitle = 'Your bid was accepted!';
    const notificationBody = `Your bid for the task "${task.title}" has been accepted. Please wait for the seeker to complete the payment.`;
    const notification = await Notification.create({
        user: providerId,
        title: notificationTitle,
        message: notificationBody,
        link: `/tasks/${task._id}`
    });
    const recipientSocketId = onlineUsers.get(providerId.toString());
    if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_notification', notification);
    } else {
        const provider = await User.findById(providerId);
        if (provider && provider.fcmToken) {
            await sendPushNotification(provider.fcmToken, notificationTitle, notificationBody, { taskId: task._id.toString(), type: 'BID_ACCEPTED' });
        }
    }

    // Respond with the client secret for the frontend to process the Stripe payment
    res.status(200).json({
      task: updatedTask,
      clientSecret: paymentIntent.client_secret,
    });
  }
});



const getPaymentDetailsForTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // Authorization: Check if logged-in user is the task creator
  if (!task.taskSeeker.equals(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to access this.');
  }

  // Check if there's a payment intent to retrieve
  if (task.status !== 'Pending Payment' || !task.paymentIntentId) {
    res.status(400);
    throw new Error('No payment is pending for this task.');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(task.paymentIntentId);
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe retrieve error:', error);
    res.status(500);
    throw new Error('Could not retrieve payment details.');
  }
});


/**
 * @desc    Mark a task as complete
 * @route   PUT /api/tasks/:id/complete
 * @access  Private (only for the task seeker)
 */
const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignedProvider');

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // Authorization: Check if logged-in user is the task creator
  if (!task.taskSeeker.equals(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to complete this task.');
  }

  if (task.status !== 'Assigned') {
    res.status(400);
    throw new Error('Task must be assigned before it can be completed.');
  }

  // --- THIS IS THE FIX ---
  // Only attempt a Stripe payout if the payment method is 'Stripe'
  if (task.paymentMethod === 'Stripe') {
    const provider = task.assignedProvider;
    if (!provider || !provider.stripeAccountId) {
      res.status(400);
      throw new Error('Provider has not set up their payment account.');
    }

    const bid = await Bid.findOne({ task: task._id, status: 'Accepted' });
    if (!bid) {
        res.status(404); throw new Error('Accepted bid not found for this task.');
    }
    const platformFee = bid.amount * 0.10; // Example: 10% fee
    const amountToTransfer = Math.round((bid.amount - platformFee) * 100);

    try {
      await stripe.transfers.create({
        amount: amountToTransfer,
        currency: 'usd',
        destination: provider.stripeAccountId,
        source_transaction: task.paymentIntentId,
      });
    } catch (error) {
      console.error('Stripe transfer error:', error);
      res.status(500);
      throw new Error('Failed to process payout to the provider.');
    }
  }

  // Update the task status regardless of payment method
  task.status = 'Completed';
  task.completedAt = Date.now();
  const updatedTask = await task.save();

  // --- Notification logic (remains the same) ---
  if (task.assignedProvider) {
    const notificationTitle = 'Task marked as completed!';
    const notificationBody = `The task "${task.title}" has been marked as completed by the task seeker.`;
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
        await sendPushNotification(
          provider.fcmToken,
          notificationTitle,
          notificationBody,
          { taskId: task._id.toString(), type: 'TASK_COMPLETED' }
        );
      }
    }
  }

  res.status(200).json(updatedTask);
});


const getMyPostedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ taskSeeker: req.user._id })
    .populate('reviews')
    .sort({ createdAt: -1 });
  res.status(200).json(tasks);
});

const getMyAssignedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedProvider: req.user._id })
    .populate('reviews')
    .sort({ createdAt: -1 });
  res.status(200).json(tasks);
});


export {
  createTask,
  getTasks,
  getTaskById,
  assignTask,
  completeTask,
  getMyAssignedTasks,
  getMyPostedTasks,
  getPaymentDetailsForTask
};