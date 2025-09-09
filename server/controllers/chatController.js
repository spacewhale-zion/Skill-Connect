import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Task from '../models/Task.js';

/**
 * @desc    Get chat history for a task
 * @route   GET /api/chats/:taskId
 * @access  Private
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Authorize: user must be the seeker or the assigned provider
  const isTaskSeeker = task.taskSeeker.equals(userId);
  const isProvider = task.assignedProvider && task.assignedProvider.equals(userId);

  if (!isTaskSeeker && !isProvider) {
    res.status(403);
    throw new Error('Not authorized to access this chat.');
  }

  // Find or create a conversation for this task
  let conversation = await Conversation.findOne({ task: taskId });
  if (!conversation) {
    conversation = await Conversation.create({
      task: taskId,
      participants: [task.taskSeeker, task.assignedProvider],
    });
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 'asc' });

  res.status(200).json({ conversationId: conversation._id, messages });
});

export { getChatHistory };