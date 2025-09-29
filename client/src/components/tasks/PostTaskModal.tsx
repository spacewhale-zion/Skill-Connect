import { useState } from 'react';
import toast from 'react-hot-toast';
import { createTask } from '../../services/taskServices';
import { TaskCreationData  } from '../../types';

interface PostTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void; // Callback to refresh the task list
}

const PostTaskModal = ({ isOpen, onClose, onTaskCreated }: PostTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Home Repair');
  const [amount, setAmount] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Fetching location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          toast.success('Location found!');
          setLongitude(position.coords.longitude.toString());
          setLatitude(position.coords.latitude.toString());
        },
        () => {
          toast.dismiss();
          toast.error('Could not get location. Please enter it manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: TaskCreationData = {
      title,
      description,
      category,
      budget: { amount: parseFloat(amount) },
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    };

    setIsSubmitting(true);
    try {
      await createTask(taskData);
      // console.log(import.meta.env.VITE_API_BASE_URL)
      toast.success('Task posted successfully!');
      onTaskCreated(); // Trigger the refresh in the parent component
      onClose();       // Close the modal
    } catch (error) {
      toast.error('Failed to post task. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Post a New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm">
                <option>Home Repair</option>
                <option>Gardening</option>
                <option>Tutoring</option>
                <option>Delivery</option>
                <option>Other</option>
              </select>
            </div>
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Budget (₹)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <button type="button" onClick={handleGetLocation} className="px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600">Get My Location</button>
            </div>
            <div className="flex space-x-2">
              <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required className="w-1/2 border-gray-300 rounded-md shadow-sm"/>
              <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required className="w-1/2 border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Posting...' : 'Post Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostTaskModal;