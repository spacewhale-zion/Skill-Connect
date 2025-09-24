import { useState } from 'react';
import toast from 'react-hot-toast';
import { createReview } from '../../services/ReviewService';
import { AuthUser } from '../../types';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (updatedReviewee: AuthUser) => void;
  taskId: string;
  revieweeName: string;
}

const Star = ({ filled, onClick, onMouseEnter, onMouseLeave }: { filled: boolean, onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.783.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.06 9.383c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.956z" />
  </svg>
);

const SubmitReviewModal = ({ isOpen, onClose, onReviewSubmitted, taskId, revieweeName }: SubmitReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { updatedReviewee } = await createReview(taskId, { rating, comment });
      toast.success('Review submitted successfully!');
      onReviewSubmitted(updatedReviewee);
      onClose();
    } catch (error) {
      toast.error('Failed to submit review. You may have already reviewed this task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<div className="fixed inset-0 bg-transparent z-50 flex justify-center items-center">

      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Rate Your Experience</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>
        <p className="text-gray-600 mb-6">How was your experience with <span className="font-semibold">{revieweeName}</span>?</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={hoverRating >= star || rating >= star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Add a Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={`Share your experience...`}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-200">
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;
