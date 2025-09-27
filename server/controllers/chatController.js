// spacewhale-zion/skill-connect/Skill-Connect-6ff14bc1e35fe2984b9bfa9c060b6b7639e02145/server/controllers/chatController.js
import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Task from '../models/Task.js';

/**
 * @desc Get chat history for a task
 * @route GET /api/chats/:taskId
 * @access Private
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const isTaskSeeker = task.taskSeeker.equals(userId);
  const isProvider = task.assignedProvider && task.assignedProvider.equals(userId);
  if (!isTaskSeeker && !isProvider) {
    res.status(403);
    throw new Error('Not authorized to access this chat.');
  }

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

/**
 * @desc Mark a message as read
 * @route PATCH /api/chats/message/read/:messageId
 * @access Private
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.recipient.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to mark this message as read');
  }

  message.isRead = true;
  await message.save();

  res.json({ success: true, message });
});

export { getChatHistory, markMessageAsRead };