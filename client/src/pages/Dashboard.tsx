import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { getMyPostedTasks, getMyAssignedTasks } from '../services/taskServices';
import { getMyOfferedServices } from '../services/serviceServices';
import TaskCard from '../components/tasks/TaskCard';
import ServiceCard from '../components/services/ServiceCardDashBoard';
import PostTaskModal from '../components/tasks/PostTaskModal';
import PostServiceModal from '../components/services/PostServiceModel';
import toast from 'react-hot-toast';
import ProfilePage from './ProfilePage';
import type { Task, Service } from '../types/index';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [offeredServices, setOfferedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [posted, assigned, services] = await Promise.all([
        getMyPostedTasks(),
        getMyAssignedTasks(),
        getMyOfferedServices(),
      ]);
      setPostedTasks(posted);
      setAssignedTasks(assigned);
      setOfferedServices(services);
    } catch (error) {
      toast.error('Failed to load your dashboard data.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bookedServices = useMemo(() => {
    return postedTasks.filter(task => task.isInstantBooking);
  }, [postedTasks]);

  const regularPostedTasks = useMemo(() => {
    return postedTasks.filter(task => !task.isInstantBooking);
  }, [postedTasks]);


  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className={isTaskModalOpen || isServiceModalOpen ? 'modal-open' : ''}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          + Post a New Task
        </button>
      </div>

      <div className="mb-12 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Profile</h2>
        <ProfilePage />
       </div>

       {bookedServices.length > 0 && (
          <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Booked Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookedServices.map(task => <TaskCard key={task._id} task={task} />)}
              </div>
          </section>
      )}

      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">My Offered Services</h2>
          <div>
            {offeredServices.length > 3 && (
                <Link to="/my-offered-services" className="text-indigo-600 hover:underline font-semibold mr-4">
                View More
                </Link>
            )}
            <button
                onClick={() => setIsServiceModalOpen(true)}
                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 text-sm"
            >
                + List a New Service
            </button>
          </div>
        </div>
        {offeredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offeredServices.slice(0, 3).map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You haven't listed any services yet.</p>
        )}
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">My Posted Tasks</h2>
            {regularPostedTasks.length > 3 && (
                <Link to="/my-posted-tasks" className="text-indigo-600 hover:underline font-semibold">
                View More
                </Link>
            )}
        </div>
        {regularPostedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPostedTasks.slice(0, 3).map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You haven't posted any tasks yet.</p>
        )}
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Tasks I'm Working On</h2>
            {assignedTasks.length > 3 && (
                <Link to="/my-assigned-tasks" className="text-indigo-600 hover:underline font-semibold">
                View More
                </Link>
            )}
        </div>
        {assignedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedTasks.slice(0, 3).map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You have no assigned tasks.</p>
        )}
      </section>

      <PostTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={fetchData}
      />
      <PostServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onServiceCreated={fetchData}
      />
    </div>
  );
};

export default DashboardPage;