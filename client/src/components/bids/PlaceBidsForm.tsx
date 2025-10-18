import { useState } from 'react';
import { placeBid } from '@/services/bidServices';
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

  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Place Your Bid</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium te text-slate-300 mb-1">Your Offer (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className={inputStyles}/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Message (Optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputStyles}></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-yellow-400/50 transition">
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
};

export default PlaceBidForm;