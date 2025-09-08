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
      currency: { type: String, default: 'INR' },
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
      enum: ['Open', 'Assigned', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries
taskSchema.index({ location: '2dsphere', title: 'text', description: 'text', category: 'text'  });

const Task = mongoose.model('Task', taskSchema);
export default Task;