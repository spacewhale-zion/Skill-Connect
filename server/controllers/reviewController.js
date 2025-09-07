import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Task from '../models/Task.js';

/**
 * @desc    Create a new review for a completed task
 * @route   POST /api/tasks/:taskId/review
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { taskId } = req.params;
  const reviewerId = req.user._id;

  // 1. Basic Validation
  if (!rating) {
    res.status(400);
    throw new Error('Rating is a required field.');
  }

  // 2. Find the associated task
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // 3. Check if the task is completed
  if (task.status !== 'Completed') {
    res.status(400);
    throw new Error('You can only leave a review for a completed task.');
  }

  // 4. Determine who is being reviewed (the 'reviewee') and authorize the reviewer
  let revieweeId;
  const isTaskSeeker = task.taskSeeker.equals(reviewerId);
  const isProvider = task.assignedProvider && task.assignedProvider.equals(reviewerId);

  if (isTaskSeeker) {
    // The task seeker is reviewing the provider
    revieweeId = task.assignedProvider;
  } else if (isProvider) {
    // The provider is reviewing the task seeker
    revieweeId = task.taskSeeker;
  } else {
    // The user is not involved in this task
    res.status(403);
    throw new Error('You are not authorized to review this task.');
  }
  
  // 5. Check if the user has already reviewed this task
  const existingReview = await Review.findOne({ task: taskId, reviewer: reviewerId });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already submitted a review for this task.');
  }

  // 6. Create and save the new review
  const review = await Review.create({
    task: taskId,
    reviewer: reviewerId,
    reviewee: revieweeId,
    rating,
    comment,
  });

  // The 'post' middleware on the Review model will automatically update the user's average rating.

  res.status(201).json(review);
});

export { createReview };