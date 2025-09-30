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
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
         
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-6">My Booked Services</h1>
                <div>Loading services...</div>
            </div>
         
        </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-900  min-h-screen  text-white">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center mb-10">My Booked Services</h1>
        {bookedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookedServices.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white">No Booked Services</h3>
            <p className="text-slate-400 mt-2">You haven't booked any instant-book services yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllMyBookedServicesPage;