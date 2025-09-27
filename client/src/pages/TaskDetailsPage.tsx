import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { getTaskById, assignTask, completeTask, getTaskPaymentDetails } from '../services/taskServices.ts';
import { getBidsForTask } from '../services/bidServices.ts';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar.tsx';
import Footer from '../components/layout/Footer.tsx';
import MapView from '../components/map/MapView.tsx';
import PlaceBidForm from '../components/bids/PlaceBidsForm.tsx';
import ChatWindow from '../components/chat/ChatWindow.tsx';
import SubmitReviewModal from '../components/reviews/SubmitReviewmodal.tsx';
import PaymentModal from '../components/payment/PaymentModal.tsx';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';
import type { AuthUser, Bid, Task } from '../types/index.ts';

const TaskDetailsPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  const fetchTaskData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const taskData = await getTaskById(taskId);
      setTask(taskData);
      if (user && user._id === taskData.taskSeeker._id && (taskData.status === 'Open' || taskData.status === 'Pending Payment')) {
        const bidsData = await getBidsForTask(taskId);
        setBids(bidsData);
      }
    } catch (error) {
      toast.error('Failed to fetch task details.');
    } finally {
      setLoading(false);
    }
  };
  console.log(task);

  useEffect(() => {
    fetchTaskData();
  }, [taskId, user?._id]);

  const handleAcceptBidClick = (bid: Bid) => {
    setSelectedBid(bid);
    setIsPaymentMethodModalOpen(true);
  };

  const handleSelectPaymentMethod = async (method: 'Stripe' | 'Cash') => {
    if (!taskId || !selectedBid) return;
    setIsPaymentMethodModalOpen(false);
    
    try {
      const response = await assignTask(taskId, selectedBid.provider._id, selectedBid._id, method);
      
      if (method === 'Stripe' && response.clientSecret) {
        setClientSecret(response.clientSecret);
        setIsPaymentModalOpen(true);
        toast.success('Bid accepted! Please complete the payment.');
      } else {
        toast.success('Task assigned! You have agreed to pay in cash.');
        fetchTaskData();
      }
    } catch (error) {
      toast.error('Failed to assign task. Please try again.');
    }
  };

  const handleResumePayment = async () => {
    if (!taskId) return;
    try {
      const { clientSecret } = await getTaskPaymentDetails(taskId);
      setClientSecret(clientSecret);
      setIsPaymentModalOpen(true);
    } catch (error) {
      toast.error('Could not retrieve payment details. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    toast.success('Payment successful! Finalizing assignment...');
    setIsFinalizing(true);

    setTimeout(() => {
      fetchTaskData().then(() => {
        setIsFinalizing(false);
      });
    }, 3000);
  };

  const handleCompleteTask = async () => {
    if (!taskId) return;
    try {
      const updatedTask = await completeTask(taskId);
      setTask(updatedTask);
      toast.success('Task marked as complete!');
      setIsReviewModalOpen(true);
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message.includes('Provider has not set up their payment account')) {
            toast.error('Provider has not set up payouts yet. They must link their bank account before you can complete this task.');
        } else {
            toast.error('Failed to mark task as complete.');
        }
    }
  };

  const handleReviewSubmitted = (updatedReviewee: AuthUser) => {
    setIsReviewModalOpen(false);
    
    setTask(prevTask => {
      if (!prevTask) return null;
      const newAssignedProvider =
        prevTask.assignedProvider?._id === updatedReviewee._id
          ? { ...prevTask.assignedProvider, averageRating: updatedReviewee.averageRating }
          : prevTask.assignedProvider;
      const newTaskSeeker =
        prevTask.taskSeeker._id === updatedReviewee._id
          ? { ...prevTask.taskSeeker, averageRating: updatedReviewee.averageRating }
          : prevTask.taskSeeker;
      return {
        ...prevTask,
        assignedProvider: newAssignedProvider,
        taskSeeker: newTaskSeeker,
      };
    });

    if (user && user._id === updatedReviewee._id) {
      updateUser({ averageRating: updatedReviewee.averageRating });
      toast.success("Your new average rating is updated!");
    }
    fetchTaskData();
  };

  if (loading) return <div>Loading...</div>;
  if (!task) return <div>Task not found.</div>;

  const isOwner = user && user._id === task.taskSeeker._id;
  const isAssignedProvider = user && user._id === task.assignedProvider?._id;
  const chatRecipient = (isOwner ? task.assignedProvider : task.taskSeeker) as AuthUser | undefined;
  const mapCoordinates: [number, number] = [task.location.coordinates[1], task.location.coordinates[0]];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="border-b pb-4 mb-6">
            <span className="text-indigo-600 font-semibold">{task.category}</span>
            <h1 className="text-4xl font-bold text-gray-800 mt-2">{task.title}</h1>
            <p className="text-gray-500 mt-2">Posted by: {task.taskSeeker.name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Task Details</h2>
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
              <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Location</h3>
              <MapView coordinates={mapCoordinates} />
              {task.status === 'Completed' && task.reviews && task.reviews.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {task.reviews.map(review => (
                      <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <img 
                            src={review.reviewer.profilePicture || `https://ui-avatars.com/api/?name=${review.reviewer.name}&background=random&size=128`} 
                            alt={review.reviewer.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-bold">{review.reviewer.name}</p>
                            <p className="text-yellow-500">{'⭐'.repeat(review.rating)}</p>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-bold text-gray-800">{task.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-3xl font-extrabold text-indigo-600">${task.budget.amount}</p>
                </div>
              </div>

              {isFinalizing && (
                <div className="mt-6 bg-blue-50 border border-blue-300 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-blue-800">Finalizing Assignment...</h3>
                    <p className="text-blue-700 mt-2 text-sm">
                        Please wait a moment while we confirm your payment.
                    </p>
                </div>
              )}
              
              {!isFinalizing && (
                <>
                  {user && isOwner && task.status === 'Pending Payment' && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-300 p-4 rounded-lg text-center">
                      <h3 className="text-lg font-bold text-yellow-800">Action Required</h3>
                      <p className="text-yellow-700 mt-2 text-sm">
                        This task is awaiting payment to be assigned to{' '}
                        <strong className="block mt-1">{bids.find(b => b.status === 'Accepted')?.provider.name || 'the provider'}</strong>.
                      </p>
                      <button
                        onClick={handleResumePayment}
                        className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                      >
                        Pay Now to Assign
                      </button>
                    </div>
                  )}

                  {user && isOwner && task.status === 'Open' && (
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Bids Received ({bids.length})</h3>
                      <div className="space-y-4">
                        {bids.length > 0 ? bids.map(bid => (
                          <div key={bid._id} className="bg-white p-4 border rounded-lg">
                            <p className="font-bold text-lg">${bid.amount}</p>
                            <p className="text-sm text-gray-600 my-2">by {bid.provider.name} (⭐ {bid.provider.averageRating?.toFixed(1) || 'New'})</p>
                            <button onClick={() => handleAcceptBidClick(bid)} className="w-full text-sm bg-green-500 text-white py-2 rounded hover:bg-green-600">
                              Accept Bid
                            </button>
                          </div>
                        )) : <p className="text-gray-500">No bids yet.</p>}
                      </div>
                    </div>
                  )}

                  {user && (isOwner || isAssignedProvider) && task.status === 'Assigned' && (
                    <div className="mt-6">
                      <button onClick={() => setIsChatOpen(true)} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                        Chat with {chatRecipient?.name}
                      </button>
                      {isOwner && (
                        <button onClick={handleCompleteTask} className="w-full mt-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  )}

                  {user && !isOwner && task.status === 'Open' && (
                     <PlaceBidForm taskId={task._id} onBidPlaced={fetchTaskData} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isChatOpen && chatRecipient && (
        <ChatWindow taskId={task._id} recipient={chatRecipient} onClose={() => setIsChatOpen(false)} />
      )}

      {isReviewModalOpen && task && (isOwner ? task.assignedProvider : task.taskSeeker) && (
        <SubmitReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
          taskId={task._id}
          revieweeName={isOwner ? task.assignedProvider!.name : task.taskSeeker.name}
        />
      )}

      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        bidAmount={selectedBid?.amount || 0}
      />
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientSecret={clientSecret}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default TaskDetailsPage;