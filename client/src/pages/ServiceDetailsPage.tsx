import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getServiceById, bookService } from '../services/serviceServices';
import { getTaskById, completeTask } from '../services/taskServices'; // Import task services
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MapView from '../components/map/MapView';
import PaymentModal from '../components/payment/PaymentModal';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';
import { Service, Task } from '../types'; // Import Task type
import { useNotifications } from '../context/notificationContext';

const ServiceDetailsPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useNotifications();

  const [service, setService] = useState<Service | null>(null);
  const [task, setTask] = useState<Task | null>(null); // State to hold the associated task
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);

  const fetchServiceAndTask = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const serviceData = await getServiceById(serviceId);
      setService(serviceData);
      // If a task has been created from this service, fetch its details
      if (serviceData.originatingTask) {
          const taskData = await getTaskById(serviceData.originatingTask);
          setTask(taskData);
      }
    } catch (error) {
      toast.error('Could not load service details.');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceAndTask();
  }, [fetchServiceAndTask]);

  useEffect(() => {
    if (socket && createdTaskId) {
      const handlePaymentSuccess = (data: { taskId: string }) => {
        if (data.taskId === createdTaskId) {
          toast.success('Service booked successfully! You can view it in your dashboard.');
          navigate('/dashboard');
        }
      };
      socket.on('payment_success', handlePaymentSuccess);
      return () => {
        socket.off('payment_success', handlePaymentSuccess);
      };
    }
  }, [socket, createdTaskId, navigate]);

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
            toast.success('Service booked successfully! You have agreed to pay in cash.');
            navigate('/dashboard');
        }
    } catch (error) {
        toast.error('Failed to book service. This might be your own service.');
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    toast.success('Payment submitted! Waiting for server confirmation...');
  };
  
  const handleSeekerConfirm = async () => {
    if (!task?._id) return;
    try {
      const updatedTask = await completeTask(task._id);
      setTask(updatedTask); // Update the task state
      toast.success('Task confirmed and payment released!');
      // Optionally, you can open the review modal here
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm completion.');
    }
  };


  if (loading) return <div>Loading...</div>;
  if (!service) return <div>Service not found.</div>;
  
  const isProvider = user?._id === service.provider._id;
  const isBooker = user?._id === task?.taskSeeker._id;
  const mapCoordinates: [number, number] = [service.location.coordinates[1], service.location.coordinates[0]];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
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
                
                {!task && !isProvider && (
                    <button
                        onClick={handleBookNowClick}
                        className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                    >
                        Book Now
                    </button>
                )}

                {task && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-lg font-bold text-gray-800">{task.status}</p>
                    </div>
                )}

                {isBooker && task?.status === 'CompletedByProvider' && (
                    <div className="mt-6">
                        <p className="text-center text-sm text-gray-600 mb-2">The provider has marked this service as complete.</p>
                        <button
                            onClick={handleSeekerConfirm}
                            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                        >
                            Confirm & Release Payment
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
      <Footer />
    </div>
  );
};

export default ServiceDetailsPage;