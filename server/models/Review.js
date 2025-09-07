import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Task',
    },
    // The user who is writing the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // The user who is being reviewed
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to calculate the average rating for a user
reviewSchema.statics.calculateAverageRating = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { reviewee: userId },
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('User').findByIdAndUpdate(userId, {
      averageRating: stats.length > 0 ? stats[0].averageRating.toFixed(1) : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Middleware to call the calculation method after a review is saved
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.reviewee);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;