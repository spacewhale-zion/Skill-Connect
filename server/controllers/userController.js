import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { stripe } from '../services/paymentService.js';

/**
 * @desc    Create a Stripe Express Account onboarding link
 * @route   POST /api/users/stripe-onboarding
 * @access  Private
 */
const createStripeOnboardingLink = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let stripeAccountId = user.stripeAccountId;
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        country: 'US', // Changed from IN to US
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      user.stripeAccountId = stripeAccountId;
      await user.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
    refresh_url: `${process.env.CLIENT_URL}/dashboard`,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500);
    throw new Error(`Stripe Error: ${error.message}`);
  }
});


/**
 * @desc    Get a user's public profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password -email -location'
  );
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update the logged-in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.skills = req.body.skills || user.skills;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    user.bio = req.body.bio || user.bio;
    if (req.body.location && req.body.location.coordinates) {
      user.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates,
      };
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      skills: updatedUser.skills,
      profilePicture: updatedUser.profilePicture,
      location: updatedUser.location,
      bio:updatedUser.bio
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


const saveFcmToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error('FCM token is required');
  }
  const user = await User.findById(req.user._id);
  if (user) {
    user.fcmToken = token;
    await user.save();
    res.status(200).json({ message: 'FCM token saved successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getUserById, updateUserProfile, saveFcmToken, createStripeOnboardingLink };