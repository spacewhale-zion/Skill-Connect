import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Service from '../models/Service.js';


const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});


const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
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
    await task.deleteOne();
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
    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});


export {
  getAllUsers,
  suspendUser,
  deleteTask,
  deleteService,
};