import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import Task from '../models/Task.js';
import { createPaymentIntent } from '../services/paymentService.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { io } from '../server.js';
import { onlineUsers } from '../sockets/socketHandler.js';
import { sendPushNotification } from '../services/notificationService.js';

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private
 */
const createService = asyncHandler(async (req, res) => {
  const { title, description, category, price, location } = req.body;
  const providerId = req.user._id;

  if (!title || !description || !category || !price || !location) {
    res.status(400);
    throw new Error('Please provide all required fields.');
  }

  const service = await Service.create({
    provider: providerId,
    title,
    description,
    category,
    price,
    location,
  });

  res.status(201).json(service);
});

/**
 * @desc    Get services, with optional filtering
 * @route   GET /api/services
 * @access  Public
 */
const getServices = asyncHandler(async (req, res) => {
  const { lat, lng, category, keyword, maxPrice } = req.query;
  const userId = req.user?._id; // Assuming auth middleware sets req.user
  
  let query = { isActive: true };

  // --- Exclude services posted by the current user ---
  if (userId) {
    query.provider = { $ne: userId };
  }

  // --- KEYWORD SEARCH: prefix or partial match ---
  if (keyword) {
    const regex = new RegExp('^' + keyword, 'i'); // starts with keyword, case-insensitive
    query.title = regex;
  }

  // --- CATEGORY FILTER ---
  if (category) {
    query.category = category;
  }

  // --- PRICE FILTER: only show services <= maxPrice ---
  if (maxPrice) {
    query.price = { $lte: parseInt(maxPrice) };
  }

  let services;

  if (lat && lng) {
    // Geospatial search
    services = await Service.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          spherical: true,
          query: query, // pre-filtered with keyword, category, maxPrice, excluding own services
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'provider',
          foreignField: '_id',
          as: 'providerDetails'
        }
      },
      { $unwind: '$providerDetails' },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          price: 1,
          createdAt: 1,
          'provider.name': '$providerDetails.name',
          'provider.averageRating': '$providerDetails.averageRating',
          'provider._id': '$providerDetails._id',
          'distance': { $round: [{ $divide: ['$distance', 1000] }, 1] }
        }
      }
    ]);
  } else {
    // Regular find without geospatial filtering
    services = await Service.find(query).populate('provider', 'name averageRating');
  }

  res.status(200).json(services);
});




/**
 * @desc    Instantly book a service, creating a task and payment intent
 * @route   POST /api/services/:id/book
 * @access  Private
 */
const bookService = asyncHandler(async (req, res) => {
const { paymentMethod } = req.body;
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found.');
  }

  if (!service.isActive) {
    res.status(400);
    throw new Error('This service is currently unavailable.');
  }

  const taskSeeker = req.user;

  if (service.provider.equals(taskSeeker._id)) {
    res.status(400);
    throw new Error('You cannot book your own service.');
  }

  let task;
  let clientSecret = null;

  if (paymentMethod === 'Cash') {
    task = await Task.create({
      title: service.title,
      description: `Instantly booked service: ${service.description}`,
      category: service.category,
      budget: { amount: service.price, currency: 'USD' },
      location: service.location,
      taskSeeker: taskSeeker._id,
      acceptedBidAmount: service.price,
      assignedProvider: service.provider,
      status: 'Assigned',
      paymentMethod: 'Cash',
      isInstantBooking: true,
      originatingService: service._id,
    });
  } else {
    const paymentIntent = await createPaymentIntent(service.price);
    clientSecret = paymentIntent.client_secret;

    task = await Task.create({
      title: service.title,
      description: `Instantly booked service: ${service.description}`,
      category: service.category,
      budget: { amount: service.price, currency: 'USD' },
      location: service.location,
      taskSeeker: taskSeeker._id,
      acceptedBidAmount: service.price,
      assignedProvider: service.provider,
      status: 'Pending Payment',
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'Stripe',
      isInstantBooking: true,
      originatingService: service._id,
    });
  }

 

  // --- NOTIFICATION LOGIC ---
  const notificationTitle = 'Your service has been booked!';
  const notificationBody = `${taskSeeker.name} has booked your service: "${service.title}"`;
  
  const notification = await Notification.create({
    user: service.provider,
    title: notificationTitle,
    message: notificationBody,
    link: `/tasks/${task._id}` // Link to the created task
  });

  const recipientSocketId = onlineUsers.get(service.provider.toString());

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('new_notification', notification);
  } else {
    const provider = await User.findById(service.provider);
    if (provider && provider.fcmToken) {
      await sendPushNotification(provider.fcmToken, notificationTitle, notificationBody, { taskId: task._id.toString(), type: 'SERVICE_BOOKED' });
    }
  }

  service.isActive = false;
  await service.save();

  res.status(201).json({
    task,
    clientSecret,
  });
});

const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id });
  res.status(200).json(services);
});
/**
 * @desc    Get a single service by its ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('provider', 'name averageRating profilePicture');
  
  if (service) {
    res.status(200).json(service);
  } else {
    res.status(404);
    throw new Error('Service not found.');
  }
});


/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private
 */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (service) {
    if (service.provider.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// Add the new function to the exports
export { createService, getServices, bookService, getMyServices, getServiceById, deleteService };