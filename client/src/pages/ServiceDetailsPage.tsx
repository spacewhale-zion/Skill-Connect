import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getServiceById, bookService } from '../services/serviceServices';
import { getTaskById, markTaskAsCompletedByProvider, completeTask } from '../services/taskServices';
import toast from 'react-hot-toast';
import MapView from '../components/map/MapView';
import PaymentModal from '../components/payment/PaymentModal';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';
import SubmitReviewModal from '../components/reviews/SubmitReviewmodal';
import { Service, Task, AuthUser } from '../types';
import { useNotifications } from '../context/notificationContext';
import LoadingSpinner from  '../components/layout/LoadingSpinner';

const ServiceDetailsPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useNotifications();

  const [service, setService] = useState<Service | null>(null);
  const [task, setTask] = useState<Task | null>(null);
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
      
      const associatedTask = serviceData.originatingTask 
        ? await getTaskById(serviceData.originatingTask).catch(() => null)
        : null;

      if (associatedTask && (associatedTask.taskSeeker._id === user?._id || associatedTask.assignedProvider?._id === user?._id)) {
        setTask(associatedTask);
      } else {
        setTask(null);
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

  if (loading) return  <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>;
  if (!service) return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">Service not found.</div>;
  
  const isProvider = user?._id === service.provider._id;
  const isBooker = user?._id === task?.taskSeeker._id;
  const mapCoordinates: [number, number] = [service.location.coordinates[1], service.location.coordinates[0]];

  return (
    <div className="bg-slate-900 min-h-screen text-white relative">
        <div className="absolute inset-0 z-0">
            <div id="stars"></div>
            <div id="stars2"></div>
            <div id="stars3"></div>
        </div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-xl shadow-lg">
          <span className="text-pink-400 font-semibold">{service.category}</span>
          <h1 className="text-4xl font-extrabold text-white mt-2">{service.title}</h1>
          <p className="text-slate-400 mt-2">Offered by: {service.provider.name} (⭐ {service.provider.averageRating?.toFixed(1) || 'New'})</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-4">Service Details</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{service.description}</p>
                <h3 className="text-2xl font-bold text-white mt-10 mb-4">Location</h3>
                <MapView coordinates={mapCoordinates} className="grayscale" />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-slate-900/70 border border-slate-700 p-6 rounded-lg sticky top-24">
                <p className="text-sm text-slate-400">Fixed Price</p>
                <p className="text-4xl font-extrabold text-yellow-400">₹{service.price}</p>
                
                {task ? (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <p className="text-sm text-slate-400">Booking Status</p>
                        <p className="text-lg font-bold text-white">{task.status}</p>
                    </div>
                ) : (
                    !isProvider && (
                        <button
                            onClick={handleBookNowClick}
                            className="w-full mt-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            Book Now
                        </button>
                    )
                )}

                {isProvider && task?.status === 'Assigned' && (
                    <div className="mt-6">
                        <button onClick={handleProviderComplete} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
                            Mark as Complete
                        </button>
                    </div>
                )}
                
                {isBooker && task?.status === 'CompletedByProvider' && (
                    <div className="mt-6">
                        <p className="text-center text-sm text-slate-400 mb-2">The provider has marked this service as complete.</p>
                        <button
                            onClick={handleSeekerConfirm}
                            className="w-full py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500"
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