import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { io } from '../server.js';
import { onlineUsers } from '../sockets/socketHandler.js';
import { sendPushNotification } from '../services/notificationService.js';
import { createPaymentIntent, stripe } from '../services/paymentService.js';

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
    taskSeeker: req.user._id,
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

  if (keyword) {
    const textResults = await Task.find(
      { $text: { $search: keyword }, status: 'Open' },
      { _id: 1 }
    );
    const textMatchedIds = textResults.map((doc) => doc._id);
    if (textMatchedIds.length === 0) {
      return res.status(200).json([]);
    }
    tasksQuery._id = { $in: textMatchedIds };
  }

  if (category) tasksQuery.category = category;
  if (maxBudget) tasksQuery['budget.amount'] = { $lte: parseInt(maxBudget) };

  let tasks;
  if (lat && lng && radius) {
    const radiusInMeters = parseInt(radius) * 1000;
    tasks = await Task.find({
      ...tasksQuery,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters,
        },
      },
    }).populate('taskSeeker', 'name profilePicture').sort({ createdAt: -1 });
  } else {
    tasks = await Task.find(tasksQuery).populate('taskSeeker', 'name profilePicture').sort({ createdAt: -1 });
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
    .populate({
      path: 'reviews',
      populate: { path: 'reviewer', select: 'name profilePicture' }
    });

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }
  res.status(200).json(task);
});

/**
 * @desc    Assign a provider to a task and handle payment
 * @route   PUT /api/tasks/:id/assign
 * @access  Private (Task Seeker only)
 */
const assignTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found.');
    }
    if (!task.taskSeeker.equals(req.user._id)) {
        res.status(403);
        throw new Error('You are not authorized to assign this task.');
    }
    if (task.status !== 'Open') {
        res.status(400);
        throw new Error('Task is not open for assignment.');
    }

    const { providerId, bidId, paymentMethod } = req.body;
    const bid = await Bid.findById(bidId);

    if (!bid || !bid.task.equals(task._id) || !bid.provider.equals(providerId)) {
        res.status(400);
        throw new Error('Invalid bid details.');
    }

    task.assignedProvider = providerId;
    bid.status = 'Accepted';
    await bid.save();

    if (paymentMethod === 'Cash') {
        task.paymentMethod = 'Cash';
        task.status = 'Assigned';
        await task.save();
        res.status(200).json({ task, clientSecret: null });
    } else {
        const paymentIntent = await createPaymentIntent(bid.amount);
        task.paymentIntentId = paymentIntent.id;
        task.paymentMethod = 'Stripe';
        task.status = 'Pending Payment';
        await task.save();
        res.status(200).json({ task, clientSecret: paymentIntent.client_secret });
    }
});

/**
 * @desc    Get payment details for a task
 * @route   GET /api/tasks/:id/payment-details
 * @access  Private (Task Seeker only)
 */
const getPaymentDetailsForTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found.');
    }
    if (!task.taskSeeker.equals(req.user._id)) {
        res.status(403);
        throw new Error('You are not authorized to view these details.');
    }
    if (!task.paymentIntentId) {
        res.status(400);
        throw new Error('No payment details found for this task.');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(task.paymentIntentId);
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
});

/**
 * @desc    Provider marks a task as complete from their side
 * @route   PUT /api/tasks/:id/complete-by-provider
 * @access  Private (Provider only)
 */
const markCompletedByProvider = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found.');
    }
    if (!task.assignedProvider || !task.assignedProvider.equals(req.user._id)) {
        res.status(403);
        throw new Error('You are not authorized to perform this action.');
    }
    if (task.status !== 'Assigned') {
        res.status(400);
        throw new Error('Task must be in "Assigned" status.');
    }

    task.status = 'CompletedByProvider';
    const updatedTask = await task.save();

    const notificationTitle = 'Provider has completed the task!';
    const notificationBody = `The provider for "${task.title}" has marked the task as complete. Please confirm to release payment.`;
    const notification = await Notification.create({
        user: task.taskSeeker,
        title: notificationTitle,
        message: notificationBody,
        link: `/tasks/${task._id}`
    });

    const recipientSocketId = onlineUsers.get(task.taskSeeker.toString());
    if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_notification', notification);
    } else {
        const seeker = await User.findById(task.taskSeeker);
        if (seeker && seeker.fcmToken) {
            await sendPushNotification(seeker.fcmToken, notificationTitle, notificationBody, { taskId: task._id.toString(), type: 'PROVIDER_COMPLETED' });
        }
    }

    res.status(200).json(updatedTask);
});


/**
 * @desc    Task Seeker confirms completion and releases payment
 * @route   PUT /api/tasks/:id/complete
 * @access  Private (Task Seeker only)
 */
const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignedProvider');

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }
  if (!task.taskSeeker.equals(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to complete this task.');
  }
  if (task.status !== 'CompletedByProvider') {
    res.status(400);
    throw new Error('The provider must mark the task as complete first.');
  }

  if (task.paymentMethod === 'Stripe') {
    const provider = task.assignedProvider;
    if (!provider || !provider.stripeAccountId) {
      res.status(400);
      throw new Error('Provider has not set up their payment account.');
    }

    const platformFee = task.budget.amount * 0.10; // 10% fee
    const amountToTransfer = Math.round((task.budget.amount - platformFee) * 100);

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

  task.status = 'Completed';
  task.completedAt = Date.now();
  const updatedTask = await task.save();
  
    if (task.assignedProvider) {
        const notificationTitle = 'Payment released!';
        const notificationBody = `The task "${task.title}" has been confirmed as complete and your payment has been sent.`;
        const notification = await Notification.create({
          user: task.assignedProvider._id,
          title: notificationTitle,
          message: notificationBody,
          link: `/tasks/${task._id}`
        });
        const recipientSocketId = onlineUsers.get(task.assignedProvider._id.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_notification', notification);
        } else if (task.assignedProvider.fcmToken) {
            await sendPushNotification(
              task.assignedProvider.fcmToken,
              notificationTitle,
              notificationBody,
              { taskId: task._id.toString(), type: 'TASK_COMPLETED' }
            );
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
  getPaymentDetailsForTask,
  markCompletedByProvider
};