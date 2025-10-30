// client/src/hooks/useAdminPage.ts
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

// Types for modals (exported so the page can use them)
export type DeletionTarget = {
    id: string;
    title: string;
    type: 'task' | 'service';
} | null;

export type MakeAdminTarget = {
    id: string;
    name: string;
} | null;

export type SuspendUserTarget = {
    id: string;
    name: string;
    isSuspended: boolean;
} | null;

const ADMIN_PAGE_LIMIT = 30;

export const useAdminPage = () => {
    // Data states
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'services'>('overview');

    // Pagination & Search State
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userCount, setUserCount] = useState(0);
    const [userSearchTerm, setUserSearchTerm] = useState(''); // Debounced
    const [userSearchInput, setUserSearchInput] = useState(''); // Raw input

    const [taskPage, setTaskPage] = useState(1);
    const [taskTotalPages, setTaskTotalPages] = useState(1);
    const [taskCount, setTaskCount] = useState(0);
    const [taskSearchTerm, setTaskSearchTerm] = useState(''); // Debounced
    const [taskSearchInput, setTaskSearchInput] = useState(''); // Raw

    const [serviceSearchTerm, setServiceSearchTerm] = useState(''); // Client-side

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DeletionTarget>(null);
    const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
    const [userToMakeAdmin, setUserToMakeAdmin] = useState<MakeAdminTarget>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<SuspendUserTarget>(null);

    // Chart Data States
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [allUsers, setAllUsers] = useState<AuthUser[]>([]);

    // --- Debounce search terms ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setUserSearchTerm(userSearchInput);
            setUserPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [userSearchInput]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setTaskSearchTerm(taskSearchInput);
            setTaskPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [taskSearchInput]);

    // --- Data Fetching Callbacks ---
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsers({
                page: userPage,
                limit: ADMIN_PAGE_LIMIT,
                search: userSearchTerm,
            });
            setUsers(data.results);
            setUserTotalPages(data.totalPages);
            setUserCount(data.totalCount);
        } catch (error) {
            toast.error('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, [userPage, userSearchTerm]);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllTasksAsAdmin({
                page: taskPage,
                limit: ADMIN_PAGE_LIMIT,
                search: taskSearchTerm,
            });
            setTasks(data.results);
            setTaskTotalPages(data.totalPages);
            setTaskCount(data.totalCount);
        } catch (error) {
            toast.error('Failed to load tasks.');
        } finally {
            setIsLoading(false);
        }
    }, [taskPage, taskSearchTerm]);

    const fetchOtherData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [servicesData, statsData] = await Promise.all([
                getAllServicesAsAdmin(),
                getAdminStatsData()
            ]);
            setServices(servicesData);
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load admin data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- Main Effects ---
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'tasks') {
            fetchTasks();
        } else if (activeTab === 'overview') {
            // Fetch paginated data for display and all data for charts
            fetchTasks();
            fetchUsers();
            fetchOtherData();
            
            // Fetch all data for charts
            const fetchAllForCharts = async () => {
                try {
                    const [allT, allU] = await Promise.all([
                        getAllTasksAsAdmin({ page: 1, limit: 10000, search: '' }),
                        getAllUsers({ page: 1, limit: 10000, search: '' })
                    ]);
                    setAllTasks(allT.results);
                    setAllUsers(allU.results);
                } catch (e) {
                    console.error("Failed to load chart data", e);
                }
            };
            fetchAllForCharts();

        } else if (activeTab === 'services') {
            if (services.length === 0) fetchOtherData();
        }
    }, [activeTab, fetchUsers, fetchTasks, fetchOtherData, services.length]);

    // --- Memoized Chart Data & Filters ---
    const monthlyRevenueData = useMemo(() => {
        if (!allTasks || allTasks.length === 0) return [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlyRevenue: Record<string, number> = {};
        monthNames.forEach(month => { monthlyRevenue[month] = 0; });

        allTasks.forEach(task => {
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
    }, [allTasks]);

    const taskStatusData = useMemo(() => {
        if (!allTasks) return [];
        const statusCounts = allTasks.reduce((acc, task) => {
            const statusKey = task.status || 'Unknown';
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        ['Open', 'Assigned', 'Pending Payment', 'CompletedByProvider', 'Completed', 'Cancelled'].forEach(status => {
            if (!statusCounts[status]) statusCounts[status] = 0;
        });
        if (statusCounts['Unknown'] === undefined) statusCounts['Unknown'] = 0;
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [allTasks]);

    const userSignupData = useMemo(() => {
        if (!allUsers || allUsers.length === 0) return [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlySignups: Record<string, number> = {};
        monthNames.forEach(month => { monthlySignups[month] = 0; });
        allUsers.forEach(user => {
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
    }, [allUsers]);

    const filteredServices = useMemo(() => {
        if (!serviceSearchTerm) return services;
        const lowerCaseSearch = serviceSearchTerm.toLowerCase();
        return services.filter(service =>
            service.title.toLowerCase().includes(lowerCaseSearch) ||
            service.provider?.name?.toLowerCase().includes(lowerCaseSearch) ||
            service.category?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [services, serviceSearchTerm]);

    // --- Modal Event Handlers ---
    const openSuspendConfirmModal = (userId: string, userName: string, isSuspended: boolean) => {
        setUserToSuspend({ id: userId, name: userName, isSuspended });
        setShowSuspendModal(true);
    };

    const confirmSuspend = async () => {
        if (!userToSuspend) return;
        const { id, isSuspended } = userToSuspend;
        setShowSuspendModal(false);
        setUserToSuspend(null);
        try {
            const result = await toggleUserSuspension(id);
            toast.success(result.message);
            setUsers(prev => prev.map(u => (u._id === id ? { ...u, isSuspended: !isSuspended } : u)));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to update user.`);
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
            setUsers(prev => prev.map(u => (u._id === id ? { ...u, role: 'admin' } : u)));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to make ${name} admin.`);
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
            if (type === 'task') {
                await deleteTaskAsAdmin(id);
                toast.success(`Task "${title}" deleted.`);
                setTasks(prev => prev.filter(t => t._id !== id));
                setTaskCount(prev => prev - 1);
            } else if (type === 'service') {
                await deleteServiceAsAdmin(id);
                toast.success(`Service "${title}" deleted.`);
                setServices(prev => prev.filter(s => s._id !== id));
            }
        } catch (error) {
            toast.error(`Failed to delete ${type}.`);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    // --- Return all values needed by the UI ---
    return {
        users,
        tasks,
        services,
        stats,
        isLoading,
        activeTab,
        setActiveTab,
        userPage,
        userTotalPages,
        userCount,
        userSearchInput,
        setUserSearchInput,
        setUserPage,
        taskPage,
        taskTotalPages,
        taskCount,
        taskSearchInput,
        setTaskSearchInput,
        setTaskPage,
        serviceSearchTerm,
        setServiceSearchTerm,
        showDeleteModal,
        itemToDelete,
        showMakeAdminModal,
        userToMakeAdmin,
        showSuspendModal,
        userToSuspend,
        monthlyRevenueData,
        taskStatusData,
        userSignupData,
        filteredServices,
        openSuspendConfirmModal,
        confirmSuspend,
        cancelSuspend,
        openMakeAdminConfirmModal,
        confirmMakeAdmin,
        cancelMakeAdmin,
        handleDeleteTask,
        handleDeleteService,
        confirmDelete,
        cancelDelete
    };
};