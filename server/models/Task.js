// spacewhale-zion/skill-connect/Skill-Connect-8d5e060725284c7b119a64381a1e39067c5f2b04/server/models/Task.js
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
    acceptedBidAmount:{
      type: Number,
      default: null
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

taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ 'budget.amount': 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;