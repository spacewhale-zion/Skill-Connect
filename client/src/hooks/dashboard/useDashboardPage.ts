// client/src/hooks/useDashboardPage.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/authContext';
import { getAllMyTasks, getMyAssignedTasks, getMyPostedTasks } from '@/services/taskServices';
import { getMyOfferedServices } from '@/services/serviceServices';
import toast from 'react-hot-toast';
import type { Task, Service } from '@/types/index';

export const useDashboardPage = () => {
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
            // Set loading true only if it's not the initial load
            setIsLoading(true);
            const [posted, assigned, services, allTasks] = await Promise.all([
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
            .filter(task => (task.status === 'Completed' && task.assignedProvider?._id === user?._id))
            .reduce((sum, task) => sum + task.acceptedBidAmount, 0);
    }, [Alltasks, user?._id]);

    const totalSpent = useMemo(() => {
        return Alltasks
            .filter(task => (task.status === 'Completed' && task.taskSeeker._id === user?._id))
            .reduce((sum, task) => sum + task.acceptedBidAmount, 0);
    }, [Alltasks, user?._id]);

    const bookedServices = useMemo(() => postedTasks.filter(task => task.isInstantBooking), [postedTasks]);
    const regularPostedTasks = useMemo(() => postedTasks.filter(task => !task.isInstantBooking), [postedTasks]);
    const completedTasksCount = useMemo(() => Alltasks.filter(t => t.status === 'Completed' && (t.taskSeeker._id === user?._id || t.assignedProvider?._id === user?._id)).length, [Alltasks, user?._id]);
    const activeJobsCount = useMemo(() => assignedTasks.filter(t => t.status === 'Assigned' || t.status === 'CompletedByProvider').length, [assignedTasks]);

    const sortedAssignedTasks = useMemo(() => {
        const statusOrder: { [key: string]: number } = { 'Assigned': 1, 'CompletedByProvider': 2, 'Completed': 3, 'Cancelled': 4 };
        return [...assignedTasks].sort((a, b) => {
            const statusA = statusOrder[a.status as keyof typeof statusOrder] || 99;
            const statusB = statusOrder[b.status as keyof typeof statusOrder] || 99;
            return statusA - statusB;
        });
    }, [assignedTasks]);

    // Logic for tab content
    let itemsToShow: (Task | Service)[] = [];
    let viewAllLink: string | null = null;

    if (activeTab === 'posted') {
        itemsToShow = regularPostedTasks;
        if (regularPostedTasks.length > 3) viewAllLink = "/my-posted-tasks";
    } else if (activeTab === 'booked') {
        itemsToShow = bookedServices;
        if (bookedServices.length > 3) viewAllLink = "/my-booked-services";
    } else if (activeTab === 'assigned') {
        itemsToShow = sortedAssignedTasks;
        if (sortedAssignedTasks.length > 3) viewAllLink = "/my-assigned-tasks";
    } else if (activeTab === 'services') {
        itemsToShow = offeredServices;
        if (offeredServices.length > 3) viewAllLink = "/my-offered-services";
    }

    return {
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
        assignedTasks // Also return this for the tab count
    };
};