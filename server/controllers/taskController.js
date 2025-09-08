import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Bid from '../models/Bid.js';

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
  const queryObject = { status: 'Open' };

  // 1. Keyword/Skill search using the text index
  if (keyword) {
    queryObject.$text = { $search: keyword };
  }

  // 2. Geospatial Filtering
  if (lat && lng && radius) {
    const radiusInMeters = parseInt(radius) * 1000;
    queryObject.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: radiusInMeters,
      },
    };
  }

  // 3. Category Filtering
  if (category) {
    queryObject.category = category;
  }
  
  // 4. Budget Filtering (using 'less than or equal to')
  if (maxBudget) {
    // Use dot notation for nested fields
    queryObject['budget.amount'] = { $lte: parseInt(maxBudget) };
  }

  const tasks = await Task.find(queryObject)
    .populate('taskSeeker', 'name profilePicture')
    .sort({ createdAt: -1 });

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
    .populate('assignedProvider', 'name profilePicture averageRating');

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
const assignTask = asyncHandler(async (req, res) => {
  const { providerId, bidId } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // Authorization: Check if logged-in user is the task creator
  if (!task.taskSeeker.equals(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to assign this task.');
  }

  if (task.status !== 'Open') {
    res.status(400);
    throw new Error('Task is not open for assignment.');
  }

  // Update the task
  task.assignedProvider = providerId;
  task.status = 'Assigned';

  const updatedTask = await task.save();

  // Update the accepted bid's status
  await Bid.findByIdAndUpdate(bidId, { status: 'Accepted' });

  // Reject all other bids for this task
  await Bid.updateMany(
    { task: req.params.id, _id: { $ne: bidId } },
    { status: 'Rejected' }
  );

  res.status(200).json(updatedTask);
});

/**
 * @desc    Mark a task as complete
 * @route   PUT /api/tasks/:id/complete
 * @access  Private (only for the task seeker)
 */
const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

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

  task.status = 'Completed';
  task.completedAt = Date.now();

  const updatedTask = await task.save();
  res.status(200).json(updatedTask);
});


//  * @access  Private
//  */
const getMyPostedTasks = asyncHandler(async (req, res) => {
  // Find all tasks where the taskSeeker matches the logged-in user's ID
  const tasks = await Task.find({ taskSeeker: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(tasks);
});

/**
 * @desc    Get tasks assigned to the logged-in user
 * @route   GET /api/tasks/assignedtome
 * @access  Private
 */
const getMyAssignedTasks = asyncHandler(async (req, res) => {
  // Find all tasks where the assignedProvider matches the logged-in user's ID
  const tasks = await Task.find({ assignedProvider: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(tasks);
});


export {
  createTask,
  getTasks,
  getTaskById,
  assignTask,
  completeTask,
  getMyAssignedTasks,
  getMyPostedTasks
};