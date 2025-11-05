// client/src/pages/dashboard/DashboardPage.tsx
import { useDashboardPage } from '@/hooks/dashboard/useDashboardPage'; // <-- Import the new hook
import TaskCard from '@/components/tasks/TaskCard';
import ServiceCard from '@/components/services/ServiceCardDashBoard';
import PostTaskModal from '@/components/tasks/PostTaskModal';
import PostServiceModal from '@/components/services/PostServiceModel';
import StatCard from '@/components/dasboard/StatCard';
import EarningsSpendChart from '@/components/dasboard/EarningSpendChart';
import type { Task, Service } from '@/types/index';
import { FaPlus, FaTasks, FaCheckDouble, FaBolt, FaConciergeBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const DashboardPage = () => {
  // --- Call the hook to get all state and logic ---
  const {
    user,
    isLoading,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isServiceModalOpen,
    setIsServiceModalOpen,
    activeTab,
    setActiveTab,
    fetchData,
    regularPostedTasks,
    activeJobsCount,
    offeredServices,
    completedTasksCount,
    totalEarned,
    totalSpent,
    itemsToShow,
    viewAllLink,
    bookedServices,
    sortedAssignedTasks,
    assignedTasks
  } = useDashboardPage();
  // --- All logic is now above this line ---

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
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
        <div className="flex-shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            {/* --- NEW BUTTON --- */}
            <Link to="/my-all-tasks" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-600 transition duration-300 text-sm">
                View All Tasks
            </Link>
            <button
            onClick={() => setIsServiceModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-600 transition duration-300 text-sm"
            >
            + List Service
            </button>
            <button
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-400 text-slate-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-500 transition duration-300 text-sm"
            >
            <FaPlus size={12}/> Post Task
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
        <div className="border-b border-slate-700 mb-6 overflow-x-auto">
          <nav className="-mb-px flex justify-between items-center min-w-max">
          <div className="flex space-x-6 min-w-max">
            <button onClick={() => setActiveTab('posted')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'posted' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>

                Tasks I've Posted ({regularPostedTasks.length})
              </button>
              <button onClick={() => setActiveTab('booked')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'booked' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                Services Booked ({bookedServices.length})
              </button>
              <button onClick={() => setActiveTab('assigned')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'assigned' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                Jobs I'm Working On ({assignedTasks.length})
              </button>
              <button onClick={() => setActiveTab('services')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
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