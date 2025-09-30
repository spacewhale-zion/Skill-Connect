import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getServiceById, bookService } from '../services/serviceServices';
import { getTaskById, markTaskAsCompletedByProvider, completeTask } from '../services/taskServices';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MapView from '../components/map/MapView';
import PaymentModal from '../components/payment/PaymentModal';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';
import SubmitReviewModal from '../components/reviews/SubmitReviewmodal';
import { Service, Task, AuthUser } from '../types';
import { useNotifications } from '../context/notificationContext';

const ServiceDetailsPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useNotifications();

  const [service, setService] = useState<Service | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewee, setReviewee] = useState<{ id: string, name: string } | null>(null);


  const fetchServiceAndTask = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const serviceData = await getServiceById(serviceId);
      setService(serviceData);
      
      // A service might be booked multiple times, creating multiple tasks.
      // For this page, we are interested in the task created by the current user.
      // This is a simplified approach; a real-world app might need to list all bookings.
      if (serviceData.originatingTask) {
          const taskData = await getTaskById(serviceData.originatingTask);
          if (taskData.taskSeeker._id === user?._id) {
            setTask(taskData);
          }
      }
    } catch (error) {
      toast.error('Could not load service details.');
    } finally {
      setLoading(false);
    }
  }, [serviceId, user]);

  useEffect(() => {
    fetchServiceAndTask();
  }, [fetchServiceAndTask]);

  const handleBookNowClick = () => {
    if (!user) {
        toast.error('You must be logged in to book a service.');
        navigate('/login');
        return;
    }
    setIsPaymentMethodModalOpen(true);
  };

  const handleSelectPaymentMethod = async (method: 'Stripe' | 'Cash') => {
    if (!serviceId) return;
    setIsPaymentMethodModalOpen(false);
    try {
        const res = await bookService(serviceId, method);
        setCreatedTaskId(res.task._id);
        if (method === 'Stripe' && res.clientSecret) {
            setClientSecret(res.clientSecret);
            setIsPaymentModalOpen(true);
        } else {
            toast.success('Service booked successfully! You can view it in your dashboard.');
            navigate('/dashboard');
        }
    } catch (error) {
        toast.error('Failed to book service. This might be your own service.');
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    toast.success('Payment submitted! Refreshing...');
    fetchServiceAndTask();
  };
  
  const handleProviderComplete = async () => {
    if (!task?._id || !task.taskSeeker) return;
    try {
      const updatedTask = await markTaskAsCompletedByProvider(task._id);
      setTask(updatedTask);
      toast.success('Service marked as complete! Please review the client.');
      setReviewee({ id: task.taskSeeker._id, name: task.taskSeeker.name });
      setIsReviewModalOpen(true);
    } catch (error) {
      toast.error('Failed to mark service as complete.');
    }
  };

  const handleSeekerConfirm = async () => {
    if (!task?._id || !task.assignedProvider) return;
    try {
      const updatedTask = await completeTask(task._id);
      setTask(updatedTask);
      toast.success('Service confirmed! Please review the provider.');
      setReviewee({ id: task.assignedProvider._id, name: task.assignedProvider.name });
      setIsReviewModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm completion.');
    }
  };
  
  const handleReviewSubmitted = () => {
      setIsReviewModalOpen(false);
      fetchServiceAndTask();
  };

  if (loading) return <div>Loading...</div>;
  if (!service) return <div>Service not found.</div>;
  
  const isProvider = user?._id === service.provider._id;
  const isBooker = user?._id === task?.taskSeeker._id;
  const mapCoordinates: [number, number] = [service.location.coordinates[1], service.location.coordinates[0]];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <span className="text-indigo-600 font-semibold">{service.category}</span>
          <h1 className="text-4xl font-bold text-gray-800 mt-2">{service.title}</h1>
          <p className="text-gray-500 mt-2">Offered by: {service.provider.name} (⭐ {service.provider.averageRating?.toFixed(1) || 'New'})</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Service Details</h2>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Location</h3>
                <MapView coordinates={mapCoordinates} />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-100 p-6 rounded-lg sticky top-24">
                <p className="text-sm text-gray-500">Fixed Price</p>
                <p className="text-3xl font-extrabold text-indigo-600">₹{service.price}</p>
                
                {task ? (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Booking Status</p>
                        <p className="text-lg font-bold text-gray-800">{task.status}</p>
                    </div>
                ) : (
                    !isProvider && (
                        <button
                            onClick={handleBookNowClick}
                            className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                        >
                            Book Now
                        </button>
                    )
                )}

                {isProvider && task?.status === 'Assigned' && (
                    <div className="mt-6">
                        <button onClick={handleProviderComplete} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                            Mark as Complete
                        </button>
                    </div>
                )}
                
                {isBooker && task?.status === 'CompletedByProvider' && (
                    <div className="mt-6">
                        <p className="text-center text-sm text-gray-600 mb-2">The provider has marked this service as complete.</p>
                        <button
                            onClick={handleSeekerConfirm}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                        >
                            Confirm & Finalize
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        bidAmount={service.price}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientSecret={clientSecret}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      {isReviewModalOpen && reviewee && task && (
        <SubmitReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onReviewSubmitted={handleReviewSubmitted}
            taskId={task._id}
            revieweeName={reviewee.name}
        />
      )}

    </div>
  );
};

export default ServiceDetailsPage;