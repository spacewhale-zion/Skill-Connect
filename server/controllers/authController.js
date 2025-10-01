import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Helper function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, location, skills, fcmToken } = req.body; // Add fcmToken here

  // Basic validation
  if (!name || !email || !password || !location || !location.coordinates) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create the new user in the database
  const user = await User.create({
    name,
    email,
    password, // Password will be hashed by the pre-save middleware in the User model
    skills,
    location: {
      type: 'Point',
      coordinates: location.coordinates, // Expecting [longitude, latitude]
    },
    fcmToken, // Save the token to the new user document
  });

  if (user) {
   res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      location: user.location,
      bio: user.bio,
      averageRating: user.averageRating,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
   res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      location: user.location,
      bio: user.bio,
      averageRating: user.averageRating,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is set by the authMiddleware
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      location: user.location,
      bio: user.bio,
      averageRating: user.averageRating,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


/**
 * @desc    Forgot Password - Generate and send reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email address.');
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create the reset URL for the frontend
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('There was an error sending the email. Try again later!');
  }
});


/**
 * @desc    Reset Password
 * @route   PATCH /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has not expired, and there is a user, set the new password
  if (!user) {
    res.status(400);
    throw new Error('Token is invalid or has expired.');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Log the user in, send JWT
  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

export { registerUser, loginUser, getUserProfile ,forgotPassword, resetPassword };
