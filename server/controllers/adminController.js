// server/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Service from '../models/Service.js';

// --- Existing functions (getAllUsers, suspendUser, deleteTask, deleteService) ---
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 }); // Sort by creation date
  res.json(users);
});


const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent suspending other admins
    if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
       res.status(403);
       throw new Error('Cannot suspend another admin.');
    }
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot suspend yourself.');
    }

    user.isSuspended = !user.isSuspended;
    const updatedUser = await user.save();
    res.json({
      message: `User ${updatedUser.name} has been ${updatedUser.isSuspended ? 'suspended' : 'unsuspended'}.`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        isSuspended: updatedUser.isSuspended,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


/**
 * @desc    Delete a task by ID
 * @route   DELETE /api/admin/tasks/:id
 * @access  Private/Admin
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    await task.deleteOne(); // Use deleteOne()
    // Optionally: Need to handle related data like bids, reviews if necessary
    res.json({ message: 'Task removed' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});


/**
 * @desc    Delete a service by ID
 * @route   DELETE /api/admin/services/:id
 * @access  Private/Admin
 */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (service) {
    await service.deleteOne(); // Use deleteOne()
     // Optionally: If a service deletion should affect related tasks (e.g., originatingTask), handle here
    res.json({ message: 'Service removed' });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// --- NEW Controller Functions ---

/**
 * @desc    Get all tasks (for admin)
 * @route   GET /api/admin/tasks
 * @access  Private/Admin
 */
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({})
    .populate('taskSeeker', 'name email') // Populate seeker info
    .populate('assignedProvider', 'name email') // Populate provider info
    .sort({ createdAt: -1 }); // Sort by creation date
  res.json(tasks);
});

/**
+ * @desc    Get overall statistics for the admin dashboard
+ * @route   GET /api/admin/stats
+ * @access  Private/Admin
+ */
const getAdminStats = asyncHandler(async (req, res) => {
   const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const totalServices = await Service.countDocuments();

     const completedStripeTasks = await Task.find({ status: 'Completed', paymentMethod: 'Stripe' });
    const totalIncome = completedStripeTasks.reduce((sum, task) => {

      const bidAmount = typeof task.acceptedBidAmount === 'number' ? task.acceptedBidAmount : 0;
        return sum + (bidAmount * 0.10); // 10% platform fee
    }, 0);

    res.json({
        totalUsers,
        totalTasks,
        completedTasks,
       totalServices,
       totalIncome: parseFloat(totalIncome.toFixed(2)), // Format to 2 decimal places
    });
});

/**
 * @desc    Get all services (for admin)
 * @route   GET /api/admin/services
 * @access  Private/Admin
 */
const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find({})
    .populate('provider', 'name email') // Populate provider info
    .sort({ createdAt: -1 }); // Sort by creation date
  res.json(services);
});


export {
  getAllUsers,
  suspendUser,
  deleteTask,
  deleteService,
  getAllTasks,   // <-- Export new function
  getAllServices, // <-- Export new function
  getAdminStats
};