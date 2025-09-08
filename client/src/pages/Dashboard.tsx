import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useAuth } from '../context/authContext';
// Correct the import path to singular 'taskService'
import { getMyPostedTasks, getMyAssignedTasks } from '../services/taskServices';
import TaskCard from '../components/tasks/TaskCard';
import PostTaskModal from '../components/tasks/PostTaskModal'; // Import the modal
import toast from 'react-hot-toast';
import ProfilePage from './ProfilePage';
import type {Task} from '../types/index'

const DashboardPage = () => {
  const { user } = useAuth();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal

  // Use useCallback to memoize the fetch function so it can be used in useEffect and onTaskCreated
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
  }, []); // Empty dependency array as it doesn't depend on any props/state

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // Run on mount

  const handleTaskCreated = () => {
    fetchTasks(); // Re-fetch the tasks to update the list
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
        {/* This button now opens the modal */}
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

      {/* Sections for tasks (no changes here) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Posted Tasks</h2>
        {Array.isArray(postedTasks) && postedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postedTasks.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You haven't posted any tasks yet.</p>
        )}
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tasks I'm Working On</h2>
        {Array.isArray(assignedTasks) && assignedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedTasks.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You have no assigned tasks.</p>
        )}
      </section>

      {/* Render the modal component */}
      <PostTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default DashboardPage;