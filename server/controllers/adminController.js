// server/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Service from '../models/Service.js';

// --- Existing functions (getAllUsers, suspendUser, deleteTask, deleteService) ---
const getAllUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  // Get total count for pagination
  const totalUsers = await User.countDocuments(searchQuery);

  // Get paginated users
  const users = await User.find(searchQuery)
    .select('-password')
    .sort({ createdAt: -1 }) // Sort by creation date
    .skip(skip)
    .limit(limit);

  res.json({
    results: users,
    page,
    totalPages: Math.ceil(totalUsers / limit),
    totalCount: totalUsers,
  });
});

const getAdminChartData = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth(); // 0-11
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  try {
    // 1. User Signups This Year
    const userSignupsAgg = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' }, // Group by month (1-12)
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    // 2. Task Status Distribution
    const taskStatusAgg = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$value',
        },
      },
    ]);

    // 3. Monthly Revenue This Year
    const monthlyRevenueAgg = await Task.aggregate([
      {
        $match: {
          status: 'Completed',
          paymentMethod: 'Stripe',
          completedAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          acceptedBidAmount: { $exists: true, $type: 'number' }
        },
      },
      {
        $group: {
          _id: { $month: '$completedAt' }, // Group by month (1-12)
          totalRevenue: { $sum: { $multiply: ['$acceptedBidAmount', 0.10] } }, // 10% fee
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // --- Format Data for Frontend ---

    // Format User Signups
    const userSignupData = monthNames.slice(0, currentMonthIndex + 1).map((monthName, index) => {
      const monthIndex = index + 1;
      const data = userSignupsAgg.find(item => item._id === monthIndex);
      return {
        name: monthName,
        users: data ? data.users : 0,
      };
    });

    // Format Task Status
    const allStatuses = ['Open', 'Assigned', 'Pending Payment', 'CompletedByProvider', 'Completed', 'Cancelled'];
    const taskStatusData = allStatuses.map(statusName => {
      const data = taskStatusAgg.find(item => item.name === statusName);
      return {
        name: statusName,
        value: data ? data.value : 0,
      };
    }).filter(d => d.value > 0); // Optionally filter out zero-value statuses

    // Format Monthly Revenue
    const monthlyRevenueData = monthNames.slice(0, currentMonthIndex + 1).map((monthName, index) => {
      const monthIndex = index + 1;
      const data = monthlyRevenueAgg.find(item => item._id === monthIndex);
      return {
        name: monthName,
        revenue: data ? parseFloat(data.totalRevenue.toFixed(2)) : 0,
      };
    });

    res.json({
      userSignupData,
      taskStatusData,
      monthlyRevenueData,
    });

  } catch (error) {
    res.status(500);
    throw new Error(`Failed to get chart data: ${error.message}`);
  }
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

  const limit = parseInt(req.query.limit) || 30;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  let matchQuery = {};

  if (search) {
    const users = await User.find({
      name: { $regex: search, $options: 'i' },
    }).select('_id');
    const userIds = users.map(u => u._id);

    matchQuery = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { taskSeeker: { $in: userIds } },
        { assignedProvider: { $in: userIds } },
      ],
    };
  }

  // Get total count for pagination
  const totalTasks = await Task.countDocuments(matchQuery);

  // Get paginated tasks
  const tasks = await Task.find(matchQuery)
    .populate('taskSeeker', 'name email')
    .populate('assignedProvider', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    results: tasks,
    page,
    totalPages: Math.ceil(totalTasks / limit),
    totalCount: totalTasks,
  });
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
  const limit = parseInt(req.query.limit) || 30;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  let matchQuery = {};

  if (search) {
    // Find users (providers) who match the search term
    const users = await User.find({
      name: { $regex: search, $options: 'i' },
    }).select('_id');
    const userIds = users.map(u => u._id);

    // Search by title, category, or matching provider user IDs
    matchQuery = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { provider: { $in: userIds } },
      ],
    };
  }

  // Get total count for pagination
  const totalServices = await Service.countDocuments(matchQuery);

  // Get paginated services
  const services = await Service.find(matchQuery)
    .populate('provider', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    results: services,
    page,
    totalPages: Math.ceil(totalServices / limit),
    totalCount: totalServices,
  });
});


/**
 * @desc    Promote a user to admin
 * @route   PUT /api/admin/users/:id/make-admin
 * @access  Private/Admin
 */
const makeAdmin = asyncHandler(async (req, res) => {
  const userToPromote = await User.findById(req.params.id);

  if (!userToPromote) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from changing their own role via this endpoint
  if (userToPromote._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot change your own admin status.');
  }

  if (userToPromote.role === 'admin') {
    res.status(400);
    throw new Error('User is already an admin.');
  }

  userToPromote.role = 'admin';
  const updatedUser = await userToPromote.save();

  res.json({
    message: `User ${updatedUser.name} has been promoted to admin.`,
    user: { // Return limited info
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isSuspended: updatedUser.isSuspended,
      createdAt: updatedUser.createdAt,
      profilePicture: updatedUser.profilePicture,
    },
  });
});

export {
  getAllUsers,
  suspendUser,
  deleteTask,
  deleteService,
  getAllTasks,   // <-- Export new function
  getAllServices, // <-- Export new function
  getAdminStats,
  makeAdmin,
  getAdminChartData
};