import { useEffect, useState, useMemo } from 'react';
import { getAllMyTasks } from '../services/taskServices'; // <-- Use the new service function
import TaskCard from '../components/tasks/TaskCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';
import type { Task } from '../types/index';

const AllMyTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const allTasks = await getAllMyTasks(); //
        console.log(allTasks)
        setTasks(allTasks);
      } catch (error) {
        toast.error('Failed to load your tasks.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Sort tasks to show active ones first
  const sortedTasks = useMemo(() => {
    const statusOrder: { [key: string]: number } = {
      'Assigned': 1,
      'Pending Payment': 2,
      'CompletedByProvider': 3,
      'Open': 4,
      'Completed': 5,
      'Cancelled': 6,
    };
    return [...tasks].sort((a, b) => {
      const statusA = statusOrder[a.status] || 99;
      const statusB = statusOrder[b.status] || 99;
      return statusA - statusB;
    });
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">All My Tasks</h1>
          <div>Loading tasks...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center mb-10">All My Tasks</h1>
        {sortedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white">No Task History</h3>
            <p className="text-slate-400 mt-2">You haven't posted or worked on any tasks yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllMyTasksPage;