import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/authContext';
import { getMyPostedTasks, getMyAssignedTasks } from '../services/taskServices';
import TaskCard from '../components/tasks/TaskCard';
import PostTaskModal from '../components/tasks/PostTaskModal';
import toast from 'react-hot-toast';
import ProfilePage from './ProfilePage';
import type { Task } from '../types/index';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const [posted, assigned] = await Promise.all([
        getMyPostedTasks(),
        getMyAssignedTasks(),
      ]);
      setPostedTasks(posted);
      setAssignedTasks(assigned);
    } catch (error) {
      toast.error('Failed to load your tasks.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className={isModalOpen ? 'modal-open' : ''}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          + Post a New Task
        </button>
      </div>

      <div className="mb-12 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Profile</h2>
        <ProfilePage />
       </div>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">My Posted Tasks</h2>
            {postedTasks.length > 3 && (
                <Link to="/my-posted-tasks" className="text-indigo-600 hover:underline font-semibold">
                View More
                </Link>
            )}
        </div>
        {Array.isArray(postedTasks) && postedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postedTasks.slice(0, 3).map(task => <TaskCard key={task._id} task={task} />)}
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
        {Array.isArray(assignedTasks) && assignedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedTasks.slice(0, 3).map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You have no assigned tasks.</p>
        )}
      </section>

      <PostTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default DashboardPage;