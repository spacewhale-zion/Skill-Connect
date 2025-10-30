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
    makeUserAdmin,
    getAdminChartData
} from '@/services/adminServices';
import toast from 'react-hot-toast';
import type { AuthUser, Task, Service } from '@/types';

// Types for modals
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
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'services'>('overview');
    
    // Loading states
    const [isLoading, setIsLoading] = useState(false); // For paginated data (users/tasks)
    const [isLoadingStats, setIsLoadingStats] = useState(true); // For initial page load (stats/services)
    const [isLoadingCharts, setIsLoadingCharts] = useState(true); // For overview charts
    const [hasFetchedCharts, setHasFetchedCharts] = useState(false);

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

    const [servicePage, setServicePage] = useState(1);
    const [serviceTotalPages, setServiceTotalPages] = useState(1);
    const [serviceCount, setServiceCount] = useState(0);
    const [serviceSearchTerm, setServiceSearchTerm] = useState(''); // Debounced
    const [serviceSearchInput, setServiceSearchInput] = useState(''); // Raw input

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DeletionTarget>(null);
    const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
    const [userToMakeAdmin, setUserToMakeAdmin] = useState<MakeAdminTarget>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<SuspendUserTarget>(null);

    // Chart Data States
    const [userSignupData, setUserSignupData] = useState<{ name: string; users: number }[]>([]);
    const [taskStatusData, setTaskStatusData] = useState<{ name: string; value: number }[]>([]);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState<{ name: string; revenue: number }[]>([]);
   
    useEffect(() => {
        const handler = setTimeout(() => {
            setServiceSearchTerm(serviceSearchInput);
            setServicePage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [serviceSearchInput]);

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
            const data = await getAllUsers({ page: userPage, limit: ADMIN_PAGE_LIMIT, search: userSearchTerm });
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
            const data = await getAllTasksAsAdmin({ page: taskPage, limit: ADMIN_PAGE_LIMIT, search: taskSearchTerm });
            setTasks(data.results);
            setTaskTotalPages(data.totalPages);
            setTaskCount(data.totalCount);
        } catch (error) {
            toast.error('Failed to load tasks.');
        } finally {
            setIsLoading(false);
        }
    }, [taskPage, taskSearchTerm]);

    // --- NEW: fetchServices (paginated) ---
    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllServicesAsAdmin({
                page: servicePage,
                limit: ADMIN_PAGE_LIMIT,
                search: serviceSearchTerm,
            });
            setServices(data.results);
            console.log(services)
            setServiceTotalPages(data.totalPages);
            setServiceCount(data.totalCount);
        } catch (error) {
            toast.error('Failed to load services.');
        } finally {
            setIsLoading(false);
        }
    }, [servicePage, serviceSearchTerm,]);
    
    // --- UPDATED: Renamed to fetchStats, only fetches stats ---
    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true); 
        try {
            const statsData = await getAdminStatsData();
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load admin stats.');
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    const fetchChartData = useCallback(async () => {
        setIsLoadingCharts(true);
        try {
            const data = await getAdminChartData();
            setUserSignupData(data.userSignupData);
            setTaskStatusData(data.taskStatusData);
            setMonthlyRevenueData(data.monthlyRevenueData);
            setHasFetchedCharts(true); // Mark charts as fetched
        } catch (error) {
             toast.error('Failed to load chart data.');
        } finally {
            setIsLoadingCharts(false);
        }
    }, []);

    // --- Main Effects ---

    // 1. Fetch Stats and Services on mount (this is the main page load)
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    
    // 2. Fetch data based on the active tab
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'tasks') {
            fetchTasks();
            
        } 
        else if (activeTab === 'services'){
            fetchServices();
        }
        else if (activeTab === 'overview' && !hasFetchedCharts) {
            // Only fetch charts if they haven't been fetched yet
            fetchChartData();
        }
    }, [activeTab, fetchUsers, fetchTasks,fetchServices, fetchChartData, hasFetchedCharts]);
    
   

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
                setServiceCount(prev => prev - 1); // <-- UPDATED
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
        isLoadingStats,
        isLoadingCharts,
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
        servicePage,
        serviceTotalPages,
        serviceCount,
        serviceSearchInput,
        setServiceSearchInput,
        setServicePage,
        showDeleteModal,
        itemToDelete,
        showMakeAdminModal,
        userToMakeAdmin,
        showSuspendModal,
        userToSuspend,
        monthlyRevenueData,
        taskStatusData,
        userSignupData,
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