import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    taskSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    budget: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    // Location where the task needs to be done
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
    status: {
      type: String,
      required: true,
      enum: ['Open', 'Assigned', 'Completed', 'Cancelled', 'Pending Payment'],
      default: 'Open',
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
     reviews: [{ // Add this field
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],
    completedAt: {
      type: Date,
    },
     isInstantBooking: { // <-- ADD THIS
      type: Boolean,
      default: false,
    },
    originatingService: { // <-- AND THIS
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    paymentIntentId: { // New field
      type: String,
    },
     paymentMethod: { // <-- ADD THIS
      type: String,
      enum: ['Stripe', 'Cash'],
      default: 'Stripe'
    },
    paid: { // New field
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries
taskSchema.index({ location: '2dsphere' });

// Create a separate text index for keyword searching
taskSchema.index({ title: 'text', description: 'text', category: 'text' });

const Task = mongoose.model('Task', taskSchema);
export default Task;