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
  // --- NEW: State for location fields ---
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

const handleGetLocation = () => {
  if (!navigator.geolocation) {
    toast.error('Geolocation is not supported by your browser.');
    return;
  }

  const toastId = toast.loading('Fetching location...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      toast.dismiss(toastId);
      toast.success('Location found!');
      setLongitude(position.coords.longitude.toString());
      setLatitude(position.coords.latitude.toString());
    },
    (error) => {
      toast.dismiss(toastId);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error('Permission denied. Please allow location access.');
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error('Location unavailable. Turn on Your Location.');
          break;
        case error.TIMEOUT:
          toast.error('Request timed out. Try again.');
          break;
        default:
          toast.error('An unknown error occurred.');
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0,
    }
  );
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // --- UPDATED: Check for location input ---
    if (!latitude || !longitude) {
        toast.error("Location is required for the service.");
        return;
    }

    const serviceData: ServiceCreationData = {
      title,
      description,
      category,
      price: parseFloat(price),
      // --- UPDATED: Use location from state ---
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
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

  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">List a New Service</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl font-light">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Service Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputStyles} placeholder="e.g., Professional Lawn Mowing" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className={inputStyles} placeholder="Describe the service you are offering..."></textarea>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyles}>
                <option>Home Repair</option>
                <option>Gardening</option>
                <option>Tutoring</option>
                <option>Delivery</option>
                <option>Other</option>
              </select>
            </div>
            <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Fixed Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputStyles} placeholder="e.g., 1500" />
            </div>
          </div>
          {/* --- NEW: Location input fields --- */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Service Location</label>
              <button type="button" onClick={handleGetLocation} className="px-3 py-1 text-xs font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 transition">Get My Current Location</button>
            </div>
            <div className="flex space-x-2">
              <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required className={`w-1/2 mt-1 ${inputStyles}`}/>
              <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required className={`w-1/2 mt-1 ${inputStyles}`}/>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-300 font-semibold rounded-md hover:underline">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-yellow-400 text-slate-900 font-bold rounded-md hover:bg-yellow-500 disabled:opacity-50 transition">
              {isSubmitting ? 'Listing...' : 'List Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostServiceModal;