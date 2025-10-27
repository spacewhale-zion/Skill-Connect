import { useEffect, useState, useMemo, useCallback } from 'react';
import {
    getAllUsers,
    toggleUserSuspension,
    deleteTaskAsAdmin,
    deleteServiceAsAdmin,
    getAllTasksAsAdmin,
    getAllServicesAsAdmin,
    getAdminStatsData,
    AdminStats,
    makeUserAdmin
} from '@/services/adminServices';
import toast from 'react-hot-toast';
import type { AuthUser, Task, Service } from '@/types';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminTasksTab from '@/components/admin/AdminTasksTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminServicesTab from '@/components/admin/AdminServicesTab';
import AdminDeleteConfirmationModal from '@/components/admin/AdminDeleteConfirmationModal';
import AdminConfirmationModal from '@/components/admin/AdminConfirmationModal';

// Helper to format dates consistently
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Types for modals
type DeletionTarget = {
    id: string;
    title: string;
    type: 'task' | 'service';
} | null;

type MakeAdminTarget = {
    id: string;
    name: string;
} | null;

type SuspendUserTarget = {
    id: string;
    name: string;
    isSuspended: boolean;
} | null;

const AdminPage = () => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'services'>('overview');

    // DELETE modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DeletionTarget>(null);

    // MAKE ADMIN modal
    const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
    const [userToMakeAdmin, setUserToMakeAdmin] = useState<MakeAdminTarget>(null);

    // SUSPEND modal
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<SuspendUserTarget>(null);

    // Search states
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [taskSearchTerm, setTaskSearchTerm] = useState('');
    const [serviceSearchTerm, setServiceSearchTerm] = useState('');

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Memoized data for charts and filtering ---
    const monthlyRevenueData = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlyRevenue: Record<string, number> = {};
        monthNames.forEach(month => { monthlyRevenue[month] = 0; });

        tasks.forEach(task => {
            const bidAmount = typeof task.acceptedBidAmount === 'number' ? task.acceptedBidAmount : 0;
            if (task.status === 'Completed' && task.paymentMethod === 'Stripe' && task.completedAt) {
                try {
                    const completionDate = new Date(task.completedAt);
                    if (completionDate.getFullYear() === currentYear) {
                        const monthIndex = completionDate.getMonth();
                        const monthName = monthNames[monthIndex];
                        if (monthName) monthlyRevenue[monthName] += bidAmount * 0.1;
                    }
                } catch (e) {
                    console.warn(`Invalid date for task ${task._id}: ${task.completedAt}`);
                }
            }
        });

        const currentMonthIndex = new Date().getMonth();
        return monthNames.slice(0, currentMonthIndex + 1).map(month => ({
            name: month,
            revenue: parseFloat(monthlyRevenue[month].toFixed(2))
        }));
    }, [tasks]);

    const taskStatusData = useMemo(() => {
        if (!tasks) return [];
        const statusCounts = tasks.reduce((acc, task) => {
            const statusKey = task.status || 'Unknown';
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        ['Open', 'Assigned', 'Pending Payment', 'CompletedByProvider', 'Completed', 'Cancelled'].forEach(status => {
            if (!statusCounts[status]) statusCounts[status] = 0;
        });
        if (statusCounts['Unknown'] === undefined) statusCounts['Unknown'] = 0;
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
                        monthlySignups[monthNames[signupDate.getMonth()]]++;
                    }
                } catch {}
            }
        });
        const currentMonthIndex = new Date().getMonth();
        return monthNames.slice(0, currentMonthIndex + 1).map(month => ({
            name: month,
            users: monthlySignups[month]
        }));
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

    // --- Event Handlers ---
    const openSuspendConfirmModal = (userId: string, userName: string, isSuspended: boolean) => {
        setUserToSuspend({ id: userId, name: userName, isSuspended });
        setShowSuspendModal(true);
    };

    const confirmSuspend = async () => {
        if (!userToSuspend) return;
        const { id, name, isSuspended } = userToSuspend;
        setShowSuspendModal(false);
        setUserToSuspend(null);

        const action = isSuspended ? 'unsuspend' : 'suspend';
        try {
            const result = await toggleUserSuspension(id);
            toast.success(result.message);
            setUsers(prev =>
                prev.map(u => u._id === id ? { ...u, isSuspended: !isSuspended } : u)
            );
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${action} user.`);
            console.error(error);
        }
    };

    const cancelSuspend = () => {
        setShowSuspendModal(false);
        setUserToSuspend(null);
    };

    const openMakeAdminConfirmModal = (userId: string, userName: string) => {
        setUserToMakeAdmin({ id: userId, name: userName });
        setShowMakeAdminModal(true);
    };

    const confirmMakeAdmin = async () => {
        if (!userToMakeAdmin) return;
        const { id, name } = userToMakeAdmin;
        setShowMakeAdminModal(false);
        setUserToMakeAdmin(null);

        try {
            const result = await makeUserAdmin(id);
            toast.success(result.message);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role: 'admin' } : u));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to make ${name} admin.`);
            console.error(error);
        }
    };

    const cancelMakeAdmin = () => {
        setShowMakeAdminModal(false);
        setUserToMakeAdmin(null);
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
            let message = '';
            if (type === 'task') {
                await deleteTaskAsAdmin(id);
                message = `Task "${title}" deleted successfully.`;
                setTasks(prev => prev.filter(t => t._id !== id));
            } else if (type === 'service') {
                await deleteServiceAsAdmin(id);
                message = `Service "${title}" deleted successfully.`;
                setServices(prev => prev.filter(s => s._id !== id));
            }
            toast.success(message);
        } catch (error) {
            toast.error(`Failed to delete ${type}.`);
            console.error(error);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    // --- Render ---
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

                {/* Tabs Navigation */}
                <div className="border-b border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
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

                {/* Tab Content */}
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
                            onSearchChange={e => setUserSearchTerm(e.target.value)}
                            onOpenSuspendConfirm={openSuspendConfirmModal}
                            onOpenMakeAdminConfirm={openMakeAdminConfirmModal}
                            formatDate={formatDate}
                        />
                    )}
                    {activeTab === 'tasks' && (
                        <AdminTasksTab
                            tasks={filteredTasks}
                            searchTerm={taskSearchTerm}
                            onSearchChange={e => setTaskSearchTerm(e.target.value)}
                            onDeleteTask={handleDeleteTask}
                            formatDate={formatDate}
                        />
                    )}
                    {activeTab === 'services' && (
                        <AdminServicesTab
                            services={filteredServices}
                            searchTerm={serviceSearchTerm}
                            onSearchChange={e => setServiceSearchTerm(e.target.value)}
                            onDeleteService={handleDeleteService}
                            formatDate={formatDate}
                        />
                    )}

                    {activeTab === 'users' && !isLoading && users.length === 0 && <p className="p-10 text-center text-slate-500">No users found.</p>}
                    {activeTab === 'tasks' && !isLoading && tasks.length === 0 && <p className="p-10 text-center text-slate-500">No tasks found.</p>}
                    {activeTab === 'services' && !isLoading && services.length === 0 && <p className="p-10 text-center text-slate-500">No services found.</p>}
                </div>
            </main>

            {/* Modals */}
            <AdminDeleteConfirmationModal
                isOpen={showDeleteModal}
                itemToDelete={itemToDelete}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            <AdminConfirmationModal
                isOpen={showMakeAdminModal}
                title="Confirm Admin Promotion"
                message={
                    <>
                        Are you sure you want to promote{' '}
                        <span className="font-semibold text-yellow-400">{userToMakeAdmin?.name}</span>{' '}
                        to an admin? This action grants significant permissions and cannot be easily undone.
                    </>
                }
                confirmText="Make Admin"
                iconType="warning"
                onConfirm={confirmMakeAdmin}
                onCancel={cancelMakeAdmin}
            />

            <AdminConfirmationModal
                isOpen={showSuspendModal}
                title={userToSuspend?.isSuspended ? "Confirm Unsuspend" : "Confirm Suspend"}
                message={
                    <>
                        Are you sure you want to {userToSuspend?.isSuspended ? 'unsuspend' : 'suspend'}{' '}
                        <span className="font-semibold text-yellow-400">{userToSuspend?.name}</span>?
                    </>
                }
                confirmText={userToSuspend?.isSuspended ? "Unsuspend" : "Suspend"}
                iconType="warning"
                onConfirm={confirmSuspend}
                onCancel={cancelSuspend}
            />
        </div>
    );
};

export default AdminPage;
