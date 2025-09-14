import asyncHandler from 'express-async-handler';
import Bid from '../models/Bid.js';
import Task from '../models/Task.js';
import User from '../models/User.js'; // <-- FIX 1: Import the User model
import { onlineUsers } from '../sockets/socketHandler.js';
import { io } from '../server.js';
import { sendPushNotification } from '../services/notificationService.js';
import Notification from '../models/Notification.js';

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
    return res.status(400).json({ message: 'Bid amount is required.' });
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  if (task.taskSeeker.equals(providerId)) {
    return res.status(400).json({ message: 'You cannot bid on your own task.' });
  }
  if (task.status !== 'Open') {
    return res.status(400).json({ message: 'This task is no longer open for bidding.' });
  }

  try {
    const bid = await Bid.create({
      task: taskId,
      provider: providerId,
      amount,
      message,
    });

    const populatedBid = await bid.populate('provider', 'name profilePicture');
    const providerName = populatedBid.provider.name;

    // --- NOTIFICATION LOGIC ---
    const notificationTitle = 'You have a new bid!';
    const notificationBody = `${providerName} placed a bid on your task: "${task.title}"`;
    
    // 1. Create the notification document and save it to the database.
    const notification = await Notification.create({
      user: task.taskSeeker,
      title: notificationTitle,
      message: notificationBody,
      link: `/tasks/${task._id}`
    });

    // 2. Check if the task creator is online.
    const taskSeekerId = task.taskSeeker.toString();
    const recipientSocketId = onlineUsers.get(taskSeekerId);

    if (recipientSocketId) {
      // 3a. If they are online, emit a 'new_notification' event directly to their socket.
      io.to(recipientSocketId).emit('new_notification', notification);
    } else {
      // 3b. If they are offline, send a push notification.
      const taskSeeker = await User.findById(taskSeekerId);
      if (taskSeeker && taskSeeker.fcmToken) {
        await sendPushNotification(taskSeeker.fcmToken, notificationTitle, notificationBody, { taskId: task._id.toString(), type: 'NEW_BID' });
      }
    }
    
    res.status(201).json({
      bid: populatedBid,
      taskId: task._id
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already placed a bid on this task.' });
    }
    res.status(500).json({ message: 'Server error while placing bid.' });
  }
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