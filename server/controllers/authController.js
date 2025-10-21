import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { sendEmail } from '../services/emailService.js';
import crypto from 'crypto';

// Helper function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, location, skills, fcmToken } = req.body;

  if (!name || !email || !password || !location || !location.coordinates) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    // If user exists but is not verified, maybe resend code? For now, just error.
    if (!userExists.isEmailVerified) {
         res.status(400);
         throw new Error('Email already registered but not verified. Check your email or try verifying again.');
    }
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create user but don't log them in yet
  const user = new User({ // Use new User() instead of User.create() to call instance method
    name,
    email,
    password,
    skills,
    location: {
      type: 'Point',
      coordinates: location.coordinates,
    },
    fcmToken,
    isEmailVerified: false, // Explicitly set to false
  });

  // Generate verification code
  const verificationCode = user.createEmailVerificationCode();
  await user.save(); // Save user with the code and expiry

  // Send verification email
  const verificationURL = `${process.env.CLIENT_URL}/verify-email`; // Or a page that takes the code
  const message = `Welcome to SkillConnect!\n\nYour verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nYou can enter the code here: ${verificationURL}\n\nIf you didn't create this account, please ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'SkillConnect - Verify Your Email Address',
      text: message,
    });

    res.status(201).json({
      message: 'Registration successful! Please check your email for a verification code.',
      // Optionally send back email to prefill verification form
      email: user.email
    });
  } catch (err) {
    // Important: If email fails, we should ideally roll back user creation or mark them differently.
    // For simplicity, we'll clear the code fields and let the user try registering again.
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("EMAIL SENDING ERROR: ", err);
    res.status(500);
    throw new Error('User registered, but failed to send verification email. Please try registering again.');
  }
});

/**
 * @desc    Verify user email with code
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400);
        throw new Error('Please provide email and verification code.');
    }

    // Find user by email who has a verification code and it hasn't expired
    const user = await User.findOne({
        email: email,
        emailVerificationCode: code, // In production, compare hashed code: crypto.createHash('sha256').update(code).digest('hex'),
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification code.');
    }

    // Mark user as verified and clear verification fields
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Verification successful, log the user in
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        location: user.location,
        bio: user.bio,
        averageRating: user.averageRating,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
        message: 'Email verified successfully! You are now logged in.'
    });
});


/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // **Check if email is verified**
  if (user && !user.isEmailVerified) {
    res.status(401);
    // Optionally: Resend verification email logic could go here
    throw new Error('Email not verified. Please check your email for the verification code.');
  }

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({ // Changed to 201 to match register response style
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

export { registerUser, loginUser, getUserProfile ,forgotPassword, resetPassword ,verifyEmail};
