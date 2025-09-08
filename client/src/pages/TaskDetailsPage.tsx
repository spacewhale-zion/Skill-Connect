import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getTaskById, Task, assignTask, completeTask } from '../services/taskServices';
import { getBidsForTask, Bid } from '../services/bidServices';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MapView from '../components/map/MapView';
import PlaceBidForm from '../components/bids/PlaceBidsForm';

const TaskDetailsPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaskData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const taskData = await getTaskById(taskId);
      setTask(taskData);
      // If the current user is the owner of the task, fetch bids
      if (user && user._id === taskData.taskSeeker._id) {
        const bidsData = await getBidsForTask(taskId);
        setBids(bidsData);
      }
    } catch (error) {
      toast.error('Failed to fetch task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [taskId, user]);

  const handleAcceptBid = async (providerId: string, bidId: string) => {
    if (!taskId) return;
    try {
      await assignTask(taskId, providerId, bidId);
      toast.success('Bid accepted! The provider has been notified.');
      fetchTaskData(); // Refresh task data
    } catch (error) {
      toast.error('Failed to accept bid.');
    }
  };
  
  const handleCompleteTask = async () => {
    if (!taskId) return;
    try {
      await completeTask(taskId);
      toast.success('Task marked as complete!');
      fetchTaskData(); // Refresh task data
    } catch (error) {
      toast.error('Failed to mark task as complete.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!task) return <div>Task not found.</div>;
  
  const isOwner = user && user._id === task.taskSeeker._id;
  
  // Reverse coordinates for Leaflet: [latitude, longitude]
  const mapCoordinates: [number, number] = [task.location.coordinates[1], task.location.coordinates[0]];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* Task Header */}
          <div className="border-b pb-4 mb-6">
            <span className="text-indigo-600 font-semibold">{task.category}</span>
            <h1 className="text-4xl font-bold text-gray-800 mt-2">{task.title}</h1>
            <p className="text-gray-500 mt-2">Posted by: {task.taskSeeker.name}</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details & Map */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Task Details</h2>
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
              
              <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Location</h3>
              <MapView coordinates={mapCoordinates} />
            </div>

            {/* Right Column: Status, Budget & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-bold text-gray-800">{task.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-3xl font-extrabold text-indigo-600">₹{task.budget.amount}</p>
                </div>
              </div>

              {/* --- ACTION PANEL --- */}
              {user && isOwner && task.status === 'Open' && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Bids Received ({bids.length})</h3>
                  <div className="space-y-4">
                    {bids.length > 0 ? bids.map(bid => (
                      <div key={bid._id} className="bg-white p-4 border rounded-lg">
                        <p className="font-bold text-lg">₹{bid.amount}</p>
                        <p className="text-sm text-gray-600 my-2">by {bid.provider.name} (⭐ {bid.provider.averageRating.toFixed(1)})</p>
                        <button onClick={() => handleAcceptBid(bid.provider._id, bid._id)} className="w-full text-sm bg-green-500 text-white py-2 rounded hover:bg-green-600">Accept Bid</button>
                      </div>
                    )) : <p className="text-gray-500">No bids yet.</p>}
                  </div>
                </div>
              )}

              {user && !isOwner && task.status === 'Open' && (
                 <PlaceBidForm taskId={task._id} onBidPlaced={fetchTaskData} />
              )}
              
              {user && isOwner && task.status === 'Assigned' && (
                <div className="mt-6">
                  <button onClick={handleCompleteTask} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">Mark as Complete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TaskDetailsPage;