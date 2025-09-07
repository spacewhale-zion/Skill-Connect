import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Get a user's public profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  // Find user but exclude sensitive information
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
  // Get the user from the protect middleware
  const user = await User.findById(req.user._id);

  if (user) {
    // Update fields if they are provided in the request body
    user.name = req.body.name || user.name;
    user.skills = req.body.skills || user.skills;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    // Handle location update specifically for GeoJSON structure
    if (req.body.location && req.body.location.coordinates) {
      user.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates,
      };
    }

    const updatedUser = await user.save();

    // Respond with the updated user data
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      skills: updatedUser.skills,
      profilePicture: updatedUser.profilePicture,
      location: updatedUser.location,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getUserById, updateUserProfile };