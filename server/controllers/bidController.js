import asyncHandler from 'express-async-handler';
import Bid from '../models/Bid.js';
import Task from '../models/Task.js';
import User from '../models/User.js'; // <-- FIX 1: Import the User model
import { onlineUsers } from '../sockets/socketHandler.js';
import { io } from '../server.js';
// <-- FIX 1: Import the notification service function
import { sendPushNotification } from '../services/notificationService.js';

/**
 * @desc    Create a new bid on a task
 * @route   POST /api/tasks/:taskId/bids
 * @access  Private
 */
const createBid = asyncHandler(async (req, res) => {
  const { amount, message } = req.body;
  const { taskId } = req.params;
  const providerId = req.user._id;

  if (!amount) {
    res.status(400);
    throw new Error('Bid amount is required.');
  }

  const task = await Task.findById(taskId);

  // --- Validation (This part was already correct) ---
  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }
  if (task.taskSeeker.equals(providerId)) {
    res.status(400);
    throw new Error('You cannot bid on your own task.');
  }
  if (task.status !== 'Open') {
    res.status(400);
    throw new Error('This task is no longer open for bidding.');
  }
  const existingBid = await Bid.findOne({ task: taskId, provider: providerId });
  if (existingBid) {
    res.status(400);
    throw new Error('You have already placed a bid on this task.');
  }

  // --- Create Bid ---
  const bid = await Bid.create({
    task: taskId,
    provider: providerId,
    amount,
    message,
  });

  // --- FIX 2: Populate the bid with provider details ---
  const populatedBid = await bid.populate('provider', 'name profilePicture');

  // --- Push Notification Logic (Now Correct) ---
  const taskSeeker = await User.findById(task.taskSeeker);
  if (taskSeeker && taskSeeker.fcmToken) {
    const title = 'New Bid on Your Task!';
    const body = `${req.user.name} placed a bid on "${task.title}"`;
    const data = { taskId: task._id.toString(), type: 'NEW_BID' };
    await sendPushNotification(taskSeeker.fcmToken, title, body, data);
  }

  // --- Real-time Notification Logic (Now Correct) ---
  const taskSeekerId = task.taskSeeker.toString();
  const recipientSocketId = onlineUsers.get(taskSeekerId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('bid_received', populatedBid); // Use the populated bid
  } else {
    console.log(`Task seeker ${taskSeekerId} is offline. Not sending socket event.`);
  }

  // --- FIX 3: Send the populated bid in the response ---
  res.status(201).json(populatedBid);
});

/**
 * @desc    Get all bids for a specific task
 * @route   GET /api/tasks/:taskId/bids
 * @access  Private (only for the task seeker)
 */
const getBidsForTask = asyncHandler(async (req, res) => {
  // This function was already correct. No changes needed.
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (!task.taskSeeker.equals(userId)) {
    res.status(403);
    throw new Error('You are not authorized to view bids for this task.');
  }

  const bids = await Bid.find({ task: taskId }).populate(
    'provider',
    'name profilePicture averageRating'
  );

  res.status(200).json(bids);
});

export { createBid, getBidsForTask };