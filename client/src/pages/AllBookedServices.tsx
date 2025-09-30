import { useEffect, useState } from 'react';
import { getMyPostedTasks } from '../services/taskServices';
import TaskCard from '../components/tasks/TaskCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';
import type { Task } from '../types/index';

const AllMyBookedServicesPage = () => {
  const [bookedServices, setBookedServices] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const postedTasks = await getMyPostedTasks();
        // Filter for booked services
        const filteredServices = postedTasks.filter(task => task.isInstantBooking);
        setBookedServices(filteredServices);
      } catch (error) {
        toast.error('Failed to load your booked services.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (isLoading) {
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Booked Services</h1>
                <div>Loading...</div>
            </div>
        </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Booked Services</h1>
        {bookedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookedServices.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You haven't booked any services yet.</p>
        )}
      </main>
    </div>
  );
};

export default AllMyBookedServicesPage;