import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { createService, ServiceCreationData } from '../../services/serviceServices';

interface PostServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const PostServiceModal = ({ isOpen, onClose, onServiceCreated }: PostServiceModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Home Repair');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.location?.coordinates) {
        toast.error("Your location is not set. Please update your profile.");
        return;
    }

    const serviceData: ServiceCreationData = {
      title,
      description,
      category,
      price: parseFloat(price),
      location: {
        type: 'Point',
        coordinates: user.location.coordinates,
      },
    };

    setIsSubmitting(true);
    try {
      await createService(serviceData);
      toast.success('Service listed successfully!');
      onServiceCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to list service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">List a New Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full p-2 border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 w-full p-2 border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full p-2 border-gray-300 rounded-md shadow-sm">
                <option>Home Repair</option>
                <option>Gardening</option>
                <option>Tutoring</option>
                <option>Delivery</option>
                <option>Other</option>
              </select>
            </div>
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Fixed Price ($)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 w-full p-2 border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Your service will be listed at your profile's location.</p>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Listing...' : 'List Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostServiceModal;