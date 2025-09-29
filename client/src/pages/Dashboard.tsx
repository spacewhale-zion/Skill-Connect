import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { getMyPostedTasks, getMyAssignedTasks, getAllMyTasks } from '../services/taskServices';
import { getMyOfferedServices } from '../services/serviceServices';
import TaskCard from '../components/tasks/TaskCard';
import ServiceCard from '../components/services/ServiceCardDashBoard';
import PostTaskModal from '../components/tasks/PostTaskModal';
import PostServiceModal from '../components/services/PostServiceModel';
import StatCard from '../components/dasboard/StatCard';
import EarningsSpendChart from '../components/dasboard/EarningSpendChart';
import toast from 'react-hot-toast';
import type { Task, Service } from '../types/index';
import { FaPlus, FaTasks, FaCheckDouble, FaBolt, FaConciergeBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { get } from 'http';

const DashboardPage = () => {
  const { user } = useAuth();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [Alltasks, setAllTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [offeredServices, setOfferedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posted' | 'booked' | 'assigned' | 'services'>('posted');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [posted, assigned, services,allTasks] = await Promise.all([
        getMyPostedTasks(),
        getMyAssignedTasks(),
        getMyOfferedServices(),
        getAllMyTasks()
      ]);
      setPostedTasks(posted);
      setAssignedTasks(assigned);
      setOfferedServices(services);
      setAllTasks(allTasks); 
    } catch (error) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculations for dashboard data
  const totalEarned = useMemo(() => {
    return Alltasks
      .filter(task => (task.status === 'Completed' && task.assignedProvider===user?._id))
      .reduce((sum, task) => sum + task.acceptedBidAmount, 0);
  }, [assignedTasks]);

  const totalSpent = useMemo(() => {
    return postedTasks
      .filter(task => (task.status === 'Completed' && task.taskSeeker._id ===user?._id))
      .reduce((sum, task) => sum + task.acceptedBidAmount, 0);
  }, [postedTasks]);

  const bookedServices = useMemo(() => postedTasks.filter(task => task.isInstantBooking), [postedTasks]);
  const regularPostedTasks = useMemo(() => postedTasks.filter(task => !task.isInstantBooking), [postedTasks]);
  const completedTasksCount = useMemo(() => [...postedTasks, ...assignedTasks].filter(t => t.status === 'Completed').length, [postedTasks, assignedTasks]);
  const activeJobsCount = useMemo(() => assignedTasks.filter(t => t.status === 'Assigned' || t.status === 'CompletedByProvider').length, [assignedTasks]);
  const sortedAssignedTasks = useMemo(() => {
    const statusOrder = { 'Assigned': 1, 'CompletedByProvider': 2, 'Completed': 3, 'Cancelled': 4 };
    return [...assignedTasks].sort((a, b) => {
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 99;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 99;
      return statusA - statusB;
    });
  }, [assignedTasks]);
  
  if (isLoading) {
    return <div className="text-center text-white py-10">Loading dashboard...</div>;
  }

  // Logic for tab content
  let itemsToShow: (Task | Service)[] = [];
  let viewAllLink: string | null = null;

  if (activeTab === 'posted') {
    itemsToShow = regularPostedTasks;
    if (regularPostedTasks.length > 3) viewAllLink = "/my-posted-tasks";
  } else if (activeTab === 'booked') {
    itemsToShow = bookedServices;
  } else if (activeTab === 'assigned') {
    itemsToShow = sortedAssignedTasks;
    if (sortedAssignedTasks.length > 3) viewAllLink = "/my-assigned-tasks";
  } else if (activeTab === 'services') {
    itemsToShow = offeredServices;
    if (offeredServices.length > 3) viewAllLink = "/my-offered-services";
  }

  return (
    <>
      {/* Profile Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=random&size=128`}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-slate-600"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Good evening, {user?.name}!</h1>
            <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
              <span>⭐</span>
              <span>{user?.averageRating?.toFixed(1) || 'N/A'} (reviews)</span>
              <span className="mx-1">·</span>
              <Link to="/profile" className="hover:text-yellow-400 transition">View/Edit Profile</Link>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto flex items-center gap-4">
            {/* --- NEW BUTTON --- */}
            <Link to="/my-all-tasks" className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-600 transition duration-300">
                View All Tasks
            </Link>
            <button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-600 transition duration-300"
            >
            + List Service
            </button>
            <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-yellow-400 text-slate-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-500 transition duration-300"
            >
            <FaPlus /> Post Task
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<FaTasks size={24} />} label="Tasks Posted" value={regularPostedTasks.length} />
        <StatCard icon={<FaBolt size={24} />} label="Active Jobs" value={activeJobsCount} />
        <StatCard icon={<FaConciergeBell size={24} />} label="Services Offered" value={offeredServices.length} />
        <StatCard icon={<FaCheckDouble size={24} />} label="Total Completed" value={completedTasksCount} />
      </div>

      {/* Financial Overview Section */}
      <EarningsSpendChart earned={totalEarned} spent={totalSpent} />
      
      {/* Integrated Activity Panel */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">My Activity</h2>
        </div>
        <div className="border-b border-slate-700 mb-6">
          <nav className="-mb-px flex justify-between items-center">
            <div className="flex space-x-6">
              <button onClick={() => setActiveTab('posted')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'posted' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                Tasks I've Posted ({regularPostedTasks.length})
              </button>
              <button onClick={() => setActiveTab('booked')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'booked' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                Services Booked ({bookedServices.length})
              </button>
              <button onClick={() => setActiveTab('assigned')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'assigned' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                Jobs I'm Working On ({assignedTasks.length})
              </button>
              <button onClick={() => setActiveTab('services')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'services' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                Services I Offer ({offeredServices.length})
              </button>
            </div>
            {viewAllLink && (
              <Link to={viewAllLink} className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition">View All</Link>
            )}
          </nav>
        </div>

        {itemsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsToShow.slice(0, 3).map(item => 
              'budget' in item ? <TaskCard key={item._id} task={item as Task} /> : <ServiceCard key={item._id} service={item as Service} />
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-slate-700 rounded-full text-slate-500 mb-4">
              <FaTasks size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white">No items to show</h3>
            <p className="text-slate-300 mt-2">
              {activeTab === 'posted' && "You haven't posted any tasks yet."}
              {activeTab === 'booked' && "You haven't booked any services."}
              {activeTab === 'assigned' && "You don't have any assigned jobs."}
              {activeTab === 'services' && "You aren't offering any services yet."}
            </p>
          </div>
        )}
      </div>

      <PostTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onTaskCreated={fetchData} />
      <PostServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onServiceCreated={fetchData} />
    </>
  );
};

export default DashboardPage;