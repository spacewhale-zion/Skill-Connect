import { useState } from 'react';
import { placeBid } from '../../services/bidServices';
import toast from 'react-hot-toast';

interface PlaceBidFormProps {
  taskId: string;
  onBidPlaced: () => void; // Callback to refresh data
}

const PlaceBidForm = ({ taskId, onBidPlaced }: PlaceBidFormProps) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await placeBid(taskId, parseFloat(amount), message);
      toast.success('Bid placed successfully!');
      setAmount('');
      setMessage('');
      onBidPlaced();
    } catch (error) {
      toast.error('Failed to place bid. You may have already bid on this task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Place Your Bid</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Offer (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1 w-full border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
};

export default PlaceBidForm;