import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Task',
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// --- ATOMICITY FIX ---
// This ensures that the combination of a task and a provider is always unique,
// preventing duplicate bids at the database level.
bidSchema.index({ task: 1, provider: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;