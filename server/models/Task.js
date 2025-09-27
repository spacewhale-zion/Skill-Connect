// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/server/models/Task.js
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
      enum: ['Open', 'Assigned', 'CompletedByProvider', 'Completed', 'Cancelled', 'Pending Payment'],
      default: 'Open',
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
     reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],
    completedAt: {
      type: Date,
    },
     isInstantBooking: {
      type: Boolean,
      default: false,
    },
    originatingService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    paymentIntentId: {
      type: String,
    },
     paymentMethod: {
      type: String,
      enum: ['Stripe', 'Cash'],
      default: 'Stripe'
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ location: '2dsphere' });
taskSchema.index({ title: 'text', description: 'text', category: 'text' });

const Task = mongoose.model('Task', taskSchema);
export default Task;