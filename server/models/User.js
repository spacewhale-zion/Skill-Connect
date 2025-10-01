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
    password: {
      type: String,
      required: true,
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