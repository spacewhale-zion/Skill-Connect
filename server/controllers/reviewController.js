import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

/**
 * @desc    Create a new review for a completed task
 * @route   POST /api/tasks/:taskId/review
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { taskId } = req.params;
  const reviewerId = req.user._id;

  if (!rating) {
    res.status(400);
    throw new Error('Rating is a required field.');
  }

  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  let revieweeId;
  const isTaskSeeker = task.taskSeeker.equals(reviewerId);
  const isProvider = task.assignedProvider && task.assignedProvider.equals(reviewerId);

  if (isTaskSeeker) {
    revieweeId = task.assignedProvider;
  } else if (isProvider) {
    revieweeId = task.taskSeeker;
  } else {
    res.status(403);
    throw new Error('You are not authorized to review this task.');
  }
  
  // Correctly check if the task is in a reviewable state for the specific user
  if (isProvider && task.status !== 'CompletedByProvider' && task.status !== 'Completed') {
      res.status(400);
      throw new Error('You can only review after you have marked the task as complete.');
  }
  if (isTaskSeeker && task.status !== 'Completed') {
      res.status(400);
      throw new Error('You can only review after you have confirmed the task is complete.');
  }

  const existingReview = await Review.findOne({ task: taskId, reviewer: reviewerId });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already submitted a review for this task.');
  }

  const review = await Review.create({
    task: taskId,
    reviewer: reviewerId,
    reviewee: revieweeId,
    rating,
    comment,
  });
    
  task.reviews.push(review._id);
  await task.save();
  const updatedReviewee = await User.findById(revieweeId).select('-password');


  res.status(201).json({ review, updatedReviewee });
});

export { createReview };