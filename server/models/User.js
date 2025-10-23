import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
       type: Boolean,
       default: false,
    },
    password: {
      type: String,
      required: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    bio:{
      type:String,
      default:""
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
   profilePicture: {
  type: String,
  default: function () {
    return `https://ui-avatars.com/api/?name=${this.name}&background=random&size=128`;
  },
},
    // GeoJSON Point for geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    skills: {
      type: [String],
      default: [],
    },
       portfolio: { // <-- NEW: For Portfolio images
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: { // <-- NEW: For Verification Badge
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
      stripeAccountId: { // <-- ADD THIS FIELD
      type: String,
    },
   
    fcmToken: {
  type: String,
  default: null,
},
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a 2dsphere index for geospatial queries on the location field
userSchema.index({ location: '2dsphere' });

// Middleware to hash password before saving the user document
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.createEmailVerificationCode = function () {
  // Generate a simple 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store the hashed code (optional, but more secure if needed later for lookup)
  // For simplicity here, storing the plain code. Consider hashing in production.
  this.emailVerificationCode = verificationCode; // In production, hash this: crypto.createHash('sha256').update(verificationCode).digest('hex');

  // Set code to expire in 10 minutes
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  return verificationCode; // Return the plain code to be emailed
};

// --- Add this new method to the User schema ---
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token to expire in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Instance method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;