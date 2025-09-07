import asyncHandler from 'express-async-handler';
import Bid from '../models/Bid.js';
import Task from '../models/Task.js';

/**
 * @desc    Create a new bid on a task
 * @route   POST /api/tasks/:taskId/bids
 * @access  Private
 */
const createBid = asyncHandler(async (req, res) => {
  const { amount, message } = req.body;
  const { taskId } = req.params;
  const providerId = req.user._id; // The bidder is the logged-in user

  if (!amount) {
    res.status(400);
    throw new Error('Bid amount is required.');
  }

  const task = await Task.findById(taskId);

  // --- Validation ---
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

  res.status(201).json(bid);
});

/**
 * @desc    Get all bids for a specific task
 * @route   GET /api/tasks/:taskId/bids
 * @access  Private (only for the task seeker)
 */
const getBidsForTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // Authorization: Check if the logged-in user is the one who created the task
  if (!task.taskSeeker.equals(userId)) {
    res.status(403); // Use 403 Forbidden for this type of authorization error
    throw new Error('You are not authorized to view bids for this task.');
  }

  // Find all bids and populate provider info to show bidder details
  const bids = await Bid.find({ task: taskId }).populate(
    'provider',
    'name profilePicture averageRating'
  );

  res.status(200).json(bids);
});

export { createBid, getBidsForTask };