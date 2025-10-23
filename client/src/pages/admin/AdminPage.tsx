import { useEffect, useState, useMemo } from 'react'; // Added useMemo
import {
    getAllUsers,
    toggleUserSuspension,
    deleteTaskAsAdmin,
    deleteServiceAsAdmin,
    getAllTasksAsAdmin,   // <-- Import new service function
    getAllServicesAsAdmin, // <-- Import new service function
    getAdminStatsData, // <-- Import stats service function
    AdminStats // <-- Import stats type
} from '@/services/adminServices';
import toast from 'react-hot-toast';
import type { AuthUser, Task, Service } from '@/types';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import StatCard from '@/components/dasboard/StatCard'; // Re-use StatCard
import { FaTrash, FaUserSlash, FaUserCheck, FaExternalLinkAlt, FaUsers, FaTasks, FaClipboardCheck, FaConciergeBell, FaRupeeSign } from 'react-icons/fa'; // Added more icons
import { Link } from 'react-router-dom';
// Import recharts components AND the type for the label prop
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, PieLabelRenderProps } from 'recharts';

// Helper to format dates consistently
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        // Use more detailed format for clarity
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Define colors for charts
const COLORS = ['#38bdf8', '#f472b6', '#facc15', '#34d399', '#fb7185', '#a78bfa']; // Added one more color for Pending Payment

const AdminPage = () => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);     // <-- State for tasks
    const [services, setServices] = useState<Service[]>([]); // <-- State for services
    const [stats, setStats] = useState<AdminStats | null>(null); // <-- State for stats
    const [isLoading, setIsLoading] = useState(true);
    // Default to 'overview' tab
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'services'>('overview');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all data concurrently
            const [usersData, tasksData, servicesData, statsData] = await Promise.all([
                getAllUsers(),
                getAllTasksAsAdmin(),   // <-- Fetch tasks
                getAllServicesAsAdmin(), // <-- Fetch services
                getAdminStatsData() // <-- Fetch stats
            ]);
            setUsers(usersData);
            setTasks(tasksData);
            setServices(servicesData);
            setStats(statsData); // <-- Set stats state
        } catch (error) {
            toast.error('Failed to load admin data.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Memoize chart data generation
    const taskStatusData = useMemo(() => {
        if (!tasks) return [];
        const statusCounts = tasks.reduce((acc, task) => {
            // Handle potential undefined status
             const statusKey = task.status || 'Unknown';
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Ensure all expected statuses are present, even if count is 0
        const allStatuses = ['Open', 'Assigned', 'Pending Payment', 'CompletedByProvider', 'Completed', 'Cancelled'];
        allStatuses.forEach(status => {
            if (!statusCounts[status]) {
                statusCounts[status] = 0;
            }
        });
        // Include 'Unknown' if it exists
        if(statusCounts['Unknown'] === undefined) {
             statusCounts['Unknown'] = 0;
        }

        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [tasks]);


    const userSignupData = useMemo(() => {
        // Placeholder: Aggregate user signups by month (requires backend changes for real data)
        // For demonstration, using static data based on fetched users length for variability
        if (!users || users.length === 0) return []; // Return empty if no users

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIndex = new Date().getMonth();
        const data = [];
        const totalUsers = users.length;
        let assignedUsers = 0;

        // Distribute users somewhat realistically across past months
        for (let i = 0; i <= currentMonthIndex; i++) {
            let monthUsers;
            if (i === currentMonthIndex) {
                 // Assign remaining users to the current month, ensuring it's not negative
                monthUsers = Math.max(0, totalUsers - assignedUsers);
            } else {
                // Assign a pseudo-random portion to previous months
                const fraction = Math.random() * (0.2 / (currentMonthIndex + 1)) + (0.8 / (currentMonthIndex + 1)); // Smaller, varying fractions for past months
                monthUsers = Math.max(0, Math.floor(totalUsers * fraction)); // Ensure at least 0
                 // Don't assign more users than available
                monthUsers = Math.min(monthUsers, totalUsers - assignedUsers);
            }
             data.push({ name: months[i], users: monthUsers });
            assignedUsers += monthUsers;

             // Safety break if somehow assigned exceeds total (shouldn't happen with Math.min)
             if (assignedUsers >= totalUsers && i < currentMonthIndex) {
                 // Fill remaining months with 0 if users ran out early
                 for (let j = i + 1; j <= currentMonthIndex; j++) {
                     data.push({ name: months[j], users: 0 });
                 }
                 break;
            }
        }
         // Ensure the current month has the correct remaining count if loop finished early and check bounds
        if(data.length <= currentMonthIndex && currentMonthIndex < months.length) {
             data.push({ name: months[currentMonthIndex], users: Math.max(0, totalUsers - assignedUsers) });
        }


        return data;
    }, [users]);


    // --- Handlers ---
    const handleToggleSuspend = async (userId: string) => {
        const user = users.find(u => u._id === userId);
        if (!user) return;
        const action = user.isSuspended ? 'unsuspend' : 'suspend';
        if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
          try {
            const result = await toggleUserSuspension(userId);
            toast.success(result.message);
            setUsers(prevUsers =>
              prevUsers.map(u =>
                u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u
              )
            );
          } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${action} user.`);
            console.error(error);
          }
        }
    };

    const handleDeleteTask = async (taskId: string, taskTitle: string) => {
       if (window.confirm(`Are you sure you want to delete task "${taskTitle}" (${taskId})? This cannot be undone.`)) {
            try {
                await deleteTaskAsAdmin(taskId);
                toast.success('Task deleted successfully.');
                setTasks(prev => prev.filter(t => t._id !== taskId)); // Update local state
            } catch (error) {
                toast.error('Failed to delete task.');
                console.error(error);
            }
        }
    };

    const handleDeleteService = async (serviceId: string, serviceTitle: string) => {
       if (window.confirm(`Are you sure you want to delete service "${serviceTitle}" (${serviceId})? This cannot be undone.`)) {
            try {
                await deleteServiceAsAdmin(serviceId);
                toast.success('Service deleted successfully.');
                setServices(prev => prev.filter(s => s._id !== serviceId)); // Update local state
            } catch (error) {
                toast.error('Failed to delete service.');
                console.error(error);
            }
        }
    };


    if (isLoading) {
        return (
            <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // --- Render Functions ---

    // Render Overview Tab
    const renderOverview = () => (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
            {/* Stats Cards */}
            {!stats ? (
                 <p className="text-slate-400">Loading statistics...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                     <StatCard icon={<FaUsers size={24} />} label="Total Users" value={stats.totalUsers} />
                     <StatCard icon={<FaTasks size={24} />} label="Total Tasks" value={stats.totalTasks} />
                     <StatCard icon={<FaClipboardCheck size={24} />} label="Completed Tasks" value={stats.completedTasks} />
                     <StatCard icon={<FaConciergeBell size={24} />} label="Total Services" value={stats.totalServices} />
                     <StatCard icon={<FaRupeeSign size={24} />} label="Est. Income (10% Fee)" value={`₹${stats.totalIncome.toLocaleString()}`} />
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Signups Chart */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">User Signups by Month (Demo)</h3>
                   {userSignupData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userSignupData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.5}/>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12}/>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '4px' }}
                                labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                                itemStyle={{ color: '#facc15' }} // Yellow for the value
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }}/>
                            <Bar dataKey="users" fill="#facc15" name="New Users" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                   ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-500">No user data for chart.</div>
                   )}
                </div>

                {/* Task Status Distribution */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                     <h3 className="text-lg font-semibold text-white mb-4">Task Status Distribution</h3>
                     {taskStatusData.some(d => d.value > 0) ? ( // Check if there's any data with value > 0
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={taskStatusData.filter(d => d.value > 0)} // Only show statuses with count > 0
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110} // Slightly larger radius
                                    innerRadius={50} // Add inner radius for donut chart effect
                                    fill="#8884d8"
                                    dataKey="value"
                                    paddingAngle={2} // Add padding between slices
                                     // Correctly typed label function
                                    label={(props: PieLabelRenderProps) => {
                                      // Type guard to ensure props are defined
                                      if (props.percent === undefined || props.name === undefined) {
                                        return null;
                                      }
                                      // Only show label if percentage is significant
                                      return (props.percent as number) > 0.05 ? `${props.name} ${((props.percent as number) * 100).toFixed(0)}%` : null;
                                    }}
                                    fontSize={12} // Adjust label font size
                                >
                                    {taskStatusData.filter(d => d.value > 0).map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '4px' }}
                                    formatter={(value: number, name: string) => [`${value} tasks`, name]} // Custom tooltip format
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                     ) : (
                         <div className="h-[300px] flex items-center justify-center text-slate-500">No task data for chart.</div>
                     )}
                </div>
            </div>
        </div>
    );

    // Render User Table
    const renderUserTable = () => (
       <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center gap-2">
                                <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=32`} alt={user.name} className="w-6 h-6 rounded-full" />
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isSuspended ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {user.isSuspended ? 'Suspended' : 'Active'}
                                </span>
                                {user.role === 'admin' && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300">Admin</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                    onClick={() => handleToggleSuspend(user._id)}
                                    disabled={user.role === 'admin'} // Disable suspending other admins (UI)
                                    className={`p-2 rounded ${user.isSuspended
                                            ? 'bg-green-600/50 hover:bg-green-500 text-green-200'
                                            : 'bg-yellow-600/50 hover:bg-yellow-500 text-yellow-200'
                                        } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                    title={user.role === 'admin' ? 'Cannot suspend admin' : (user.isSuspended ? 'Unsuspend User' : 'Suspend User')}
                                >
                                    {user.isSuspended ? <FaUserCheck /> : <FaUserSlash />}
                                </button>
                                {/* Add delete user button if needed */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Render Task Table
    const renderTaskTable = () => (
      <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Seeker</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Provider</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {tasks.map((task) => (
                        <tr key={task._id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{task.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.taskSeeker?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.assignedProvider?.name || 'N/A'}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.status || 'Unknown'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(task.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Link
                                    to={`/tasks/${task._id}`}
                                    target="_blank" // Open in new tab
                                    rel="noopener noreferrer"
                                    className="p-2 rounded inline-flex items-center bg-blue-600/50 hover:bg-blue-500 text-blue-200 transition-colors"
                                    title="View Task Details"
                                >
                                    <FaExternalLinkAlt size={12} />
                                </Link>
                                <button
                                    onClick={() => handleDeleteTask(task._id, task.title)}
                                    className="p-2 rounded bg-red-600/50 hover:bg-red-500 text-red-200 transition-colors"
                                    title="Delete Task"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Render Service Table
    const renderServiceTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Provider</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Price (₹)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {services.map((service) => (
                        <tr key={service._id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{service.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{service.provider?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{service.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.isActive ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                    {service.isActive ? 'Active' : 'Booked/Inactive'}
                                </span>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(service.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                               <Link
                                    to={`/services/${service._id}`}
                                    target="_blank" // Open in new tab
                                    rel="noopener noreferrer"
                                    className="p-2 rounded inline-flex items-center bg-blue-600/50 hover:bg-blue-500 text-blue-200 transition-colors"
                                    title="View Service Details"
                                >
                                    <FaExternalLinkAlt size={12} />
                                </Link>
                                <button
                                    onClick={() => handleDeleteService(service._id, service.title)}
                                    className="p-2 rounded bg-red-600/50 hover:bg-red-500 text-red-200 transition-colors"
                                    title="Delete Service"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );


    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-4xl font-extrabold text-white mb-8">Admin Dashboard</h1>

                <div className="border-b border-slate-700 mb-6">
                    {/* Make tabs scrollable on small screens */}
                    <nav className="-mb-px flex space-x-6 overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}
                        >
                            Manage Users ({users.length})
                        </button>
                         <button
                            onClick={() => setActiveTab('tasks')}
                            className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}
                        >
                            Manage Tasks ({tasks.length})
                        </button>
                         <button
                            onClick={() => setActiveTab('services')}
                            className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}
                        >
                            Manage Services ({services.length})
                        </button>
                    </nav>
                </div>

                {/* Conditional Rendering Based on Active Tab */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg min-h-[400px]"> {/* Added min-h */}
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && (users.length > 0 ? renderUserTable() : <p className="p-10 text-center text-slate-500">No users found.</p>)}
                    {activeTab === 'tasks' && (tasks.length > 0 ? renderTaskTable() : <p className="p-10 text-center text-slate-500">No tasks found.</p>)}
                    {activeTab === 'services' && (services.length > 0 ? renderServiceTable() : <p className="p-10 text-center text-slate-500">No services found.</p>)}
                </div>
            </main>
        </div>
    );
};

export default AdminPage;

