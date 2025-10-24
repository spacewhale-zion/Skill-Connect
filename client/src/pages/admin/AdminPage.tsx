import { useEffect, useState, useMemo } from 'react';
import {
    getAllUsers,
    toggleUserSuspension,
    deleteTaskAsAdmin,
    deleteServiceAsAdmin,
    getAllTasksAsAdmin,
    getAllServicesAsAdmin,
    getAdminStatsData,
    AdminStats
} from '@/services/adminServices';
import toast from 'react-hot-toast';
import type { AuthUser, Task, Service } from '@/types';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab'; // Import new components
import AdminTasksTab  from '@/components/admin/AdminTasksTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminServicesTab from '@/components/admin/AdminServicesTab';
import AdminDeleteConfirmationModal from '@/components/admin/AdminDeleteConfirmationModal';

// Helper to format dates consistently (Keep this here or move to a utils file)
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Define type for item to delete (Keep this here or move to types)
type DeletionTarget = {
    id: string;
    title: string;
    type: 'task' | 'service';
} | null;

const AdminPage = () => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'services'>('overview');

    // State for confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DeletionTarget>(null);

    // State for search terms
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [taskSearchTerm, setTaskSearchTerm] = useState('');
    const [serviceSearchTerm, setServiceSearchTerm] = useState('');

    console.log(tasks);
    // --- NEW: Memoize revenue data generation ---
const monthlyRevenueData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyRevenue: Record<string, number> = {};
    monthNames.forEach(month => {
        monthlyRevenue[month] = 0;
    });

    tasks.forEach(task => {
        if (task.status === 'Completed' && task.paymentMethod === 'Stripe' && task.paid==true ) {
            try {
                console.log("Task",task);
                const completionDate = new Date(task.completedAt);
                if (completionDate.getFullYear() === currentYear) {
                    const monthIndex = completionDate.getMonth();
                    const monthName = monthNames[monthIndex];
                     if (monthName && typeof task.acceptedBidAmount === 'number') {
                        const fee = task.acceptedBidAmount * 0.10;
                        monthlyRevenue[monthName] += fee;
                    }
                }
            } catch (e) {
                console.warn(`Could not parse completion date for task ${task._id}: ${task.completedAt}`);
            }
        }
    });

    const currentMonthIndex = new Date().getMonth();
    const chartData = [];
    for (let i = 0; i <= currentMonthIndex; i++) {
         const monthName = monthNames[i];
         if (monthName) { 
            chartData.push({ name: monthName, revenue: parseFloat(monthlyRevenue[monthName].toFixed(2)) });
        }
    }

    return chartData;
}, [tasks]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersData, tasksData, servicesData, statsData] = await Promise.all([
                getAllUsers(),
                getAllTasksAsAdmin(),
                getAllServicesAsAdmin(),
                getAdminStatsData()
            ]);
            setUsers(usersData);
            setTasks(tasksData);
            setServices(servicesData);
            setStats(statsData);
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

     const taskStatusData = useMemo(() => {
        if (!tasks) return [];
        const statusCounts = tasks.reduce((acc, task) => {
             const statusKey = task.status || 'Unknown';
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const allStatuses = ['Open', 'Assigned', 'Pending Payment', 'CompletedByProvider', 'Completed', 'Cancelled'];
        allStatuses.forEach(status => {
            if (!statusCounts[status]) {
                statusCounts[status] = 0;
            }
        });
        if(statusCounts['Unknown'] === undefined) {
             statusCounts['Unknown'] = 0;
        }
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    const userSignupData = useMemo(() => {
        if (!users || users.length === 0) return [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlySignups: Record<string, number> = {};
        monthNames.forEach(month => { monthlySignups[month] = 0; });
        users.forEach(user => {
            if (user.createdAt) {
                try {
                    const signupDate = new Date(user.createdAt);
                    if (signupDate.getFullYear() === currentYear) {
                        const monthIndex = signupDate.getMonth();
                        const monthName = monthNames[monthIndex];
                         if (monthName) { monthlySignups[monthName]++; }
                    }
                } catch (e) {
                    console.warn(`Could not parse date for user ${user._id}: ${user.createdAt}`);
                }
            }
        });
        const currentMonthIndex = new Date().getMonth();
        const chartData = [];
        for (let i = 0; i <= currentMonthIndex; i++) {
            const monthName = monthNames[i];
             if (monthName) { chartData.push({ name: monthName, users: monthlySignups[monthName] }); }
        }
        return chartData;
    }, [users]);


    const filteredUsers = useMemo(() => {
        if (!userSearchTerm) return users;
        const lowerCaseSearch = userSearchTerm.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(lowerCaseSearch) ||
            user.email.toLowerCase().includes(lowerCaseSearch)
        );
    }, [users, userSearchTerm]);

    const filteredTasks = useMemo(() => {
        if (!taskSearchTerm) return tasks;
        const lowerCaseSearch = taskSearchTerm.toLowerCase();
        return tasks.filter(task =>
            task.title.toLowerCase().includes(lowerCaseSearch) ||
            task.taskSeeker?.name?.toLowerCase().includes(lowerCaseSearch) ||
            task.assignedProvider?.name?.toLowerCase().includes(lowerCaseSearch) ||
            task.category?.toLowerCase().includes(lowerCaseSearch) ||
            task.status?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [tasks, taskSearchTerm]);

    const filteredServices = useMemo(() => {
        if (!serviceSearchTerm) return services;
        const lowerCaseSearch = serviceSearchTerm.toLowerCase();
        return services.filter(service =>
            service.title.toLowerCase().includes(lowerCaseSearch) ||
            service.provider?.name?.toLowerCase().includes(lowerCaseSearch) ||
            service.category?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [services, serviceSearchTerm]);

    const handleToggleSuspend = async (userId: string) => {
        const user = users.find(u => u._id === userId);
        if (!user) return;
        const action = user.isSuspended ? 'unsuspend' : 'suspend';
        if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            try {
                const result = await toggleUserSuspension(userId);
                toast.success(result.message);
                // Update local state instead of re-fetching
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

    const handleDeleteTask = (taskId: string, taskTitle: string) => {
        setItemToDelete({ id: taskId, title: taskTitle, type: 'task' });
        setShowDeleteModal(true);
    };

    const handleDeleteService = (serviceId: string, serviceTitle: string) => {
        setItemToDelete({ id: serviceId, title: serviceTitle, type: 'service' });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const { id, title, type } = itemToDelete;
        setShowDeleteModal(false);
        setItemToDelete(null);

        try {
            if (type === 'task') {
                await deleteTaskAsAdmin(id);
                toast.success(`Task "${title}" deleted successfully.`);
                setTasks(prev => prev.filter(t => t._id !== id)); // Update local state
            } else if (type === 'service') {
                await deleteServiceAsAdmin(id);
                toast.success(`Service "${title}" deleted successfully.`);
                setServices(prev => prev.filter(s => s._id !== id)); // Update local state
            }
        } catch (error) {
            toast.error(`Failed to delete ${type}.`);
            console.error(error);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    if (isLoading) {
        return (
            <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-4xl font-extrabold text-white mb-8">Admin Dashboard</h1>

                <div className="border-b border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800" aria-label="Tabs">
                        <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Overview
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Manage Users ({filteredUsers.length})
                        </button>
                        <button onClick={() => setActiveTab('tasks')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Manage Tasks ({filteredTasks.length})
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Manage Services ({filteredServices.length})
                        </button>
                    </nav>
                </div>

                {/* Tab Content Area */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg min-h-[400px]">
                    {activeTab === 'overview' && (
                        <AdminOverviewTab
                            stats={stats}
                            userSignupData={userSignupData}
                            taskStatusData={taskStatusData}
                            monthlyRevenueData={monthlyRevenueData}
                        />
                    )}
                    {activeTab === 'users' && (
                        <AdminUsersTab
                            users={filteredUsers}
                            searchTerm={userSearchTerm}
                            onSearchChange={(e) => setUserSearchTerm(e.target.value)}
                            onToggleSuspend={handleToggleSuspend}
                            formatDate={formatDate}
                        />
                    )}
                    {activeTab === 'tasks' && (
                         <AdminTasksTab
                            tasks={filteredTasks}
                            searchTerm={taskSearchTerm}
                            onSearchChange={(e) => setTaskSearchTerm(e.target.value)}
                            onDeleteTask={handleDeleteTask}
                            formatDate={formatDate}
                        />
                    )}
                    {activeTab === 'services' && (
                        <AdminServicesTab
                            services={filteredServices}
                            searchTerm={serviceSearchTerm}
                            onSearchChange={(e) => setServiceSearchTerm(e.target.value)}
                            onDeleteService={handleDeleteService}
                            formatDate={formatDate}
                        />
                    )}
                    {/* Display message if no original data exists for a tab */}
                    {activeTab === 'users' && users.length === 0 && <p className="p-10 text-center text-slate-500">No users found.</p>}
                    {activeTab === 'tasks' && tasks.length === 0 && <p className="p-10 text-center text-slate-500">No tasks found.</p>}
                    {activeTab === 'services' && services.length === 0 && <p className="p-10 text-center text-slate-500">No services found.</p>}
                </div>
            </main>

            {/* Render the modal */}
            <AdminDeleteConfirmationModal
                isOpen={showDeleteModal}
                itemToDelete={itemToDelete}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
};

export default AdminPage;