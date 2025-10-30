// client/src/hooks/useTaskDetailsPage.ts
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.tsx';
import { getTaskById, assignTask, completeTask, getTaskPaymentDetails, cancelTask, markTaskAsCompletedByProvider } from '@/services/taskServices.ts';
import { getBidsForTask } from '@/services/bidServices.ts';
import toast from 'react-hot-toast';
import type { AuthUser, Bid, Task } from '@/types/index.ts';
import { useNotifications } from '../../context/notificationContext.tsx';

export const useTaskDetailsPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const { user, updateUser } = useAuth();
    const [task, setTask] = useState<Task | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewee, setReviewee] = useState<{ id: string, name: string } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
    const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
    const { socket } = useNotifications();

    const fetchTaskData = useCallback(async () => {
        if (!taskId) return;
        try {
            setLoading(true);
            const taskData = await getTaskById(taskId);
            setTask(taskData);
            if (user && user._id === taskData.taskSeeker._id && (taskData.status === 'Open' || taskData.status === 'Pending Payment')) {
                const bidsData = await getBidsForTask(taskId);
                setBids(bidsData);
            }
        } catch (error) {
            toast.error('Failed to fetch task details.');
        } finally {
            setLoading(false);
        }
    }, [taskId, user]);

    useEffect(() => {
        fetchTaskData();
        if (socket) {
            const handlePaymentSuccess = (data: { taskId: string }) => {
                if (data.taskId === taskId) {
                    toast.success('Payment confirmed! Task is now assigned.');
                    fetchTaskData();
                }
            };
            socket.on('payment_success', handlePaymentSuccess);
            return () => {
                socket.off('payment_success', handlePaymentSuccess);
            };
        }
    }, [taskId, socket, fetchTaskData]);

    const handleAcceptBidClick = (bid: Bid) => {
        setSelectedBid(bid);
        setIsPaymentMethodModalOpen(true);
    };

    const handleSelectPaymentMethod = async (method: 'Stripe' | 'Cash') => {
        if (!taskId || !selectedBid) return;
        setIsPaymentMethodModalOpen(false);
        try {
            const response = await assignTask(taskId, selectedBid.provider._id, selectedBid._id, method);
            if (method === 'Stripe' && response.clientSecret) {
                setClientSecret(response.clientSecret);
                setIsPaymentModalOpen(true);
                toast.success('Bid accepted! Please complete the payment.');
            } else {
                toast.success('Task assigned! You have agreed to pay in cash.');
                fetchTaskData();
            }
        } catch (error) {
            toast.error('Failed to assign task. Please try again.');
        }
    };

    const handleCancelTask = async () => {
        if (window.confirm('Are you sure you want to cancel this task?')) {
            try {
                if (!taskId) return;
                await cancelTask(taskId);
                toast.success('Task cancelled successfully');
                fetchTaskData();
            } catch (error) {
                toast.error('Failed to cancel task.');
            }
        }
    };

    const handleResumePayment = async () => {
        if (!taskId) return;
        try {
            const { clientSecret } = await getTaskPaymentDetails(taskId);
            setClientSecret(clientSecret);
            setIsPaymentModalOpen(true);
        } catch (error) {
            toast.error('Could not retrieve payment details.');
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        toast.success('Payment successful! Waiting for server confirmation...');
    };

    const handleProviderComplete = async () => {
        if (!taskId) return;
        try {
            const updatedTask = await markTaskAsCompletedByProvider(taskId);
            setTask(updatedTask);
            toast.success('Task marked as complete! Please leave a review.');
            if (updatedTask.taskSeeker) {
                setReviewee({ id: updatedTask.taskSeeker._id, name: updatedTask.taskSeeker.name });
                setIsReviewModalOpen(true);
            }
        } catch (error) {
            toast.error('Failed to mark task as complete.');
        }
    };

    const handleSeekerConfirm = async () => {
        if (!taskId) return;
        try {
            const updatedTask = await completeTask(taskId);
            setTask(updatedTask);
            toast.success('Task confirmed! Please leave a review.');
            if (updatedTask.assignedProvider) {
                setReviewee({ id: updatedTask.assignedProvider._id, name: updatedTask.assignedProvider.name });
                setIsReviewModalOpen(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to confirm completion.');
        }
    };

    const handleReviewSubmitted = (updatedReviewee: AuthUser) => {
        setIsReviewModalOpen(false);
        setReviewee(null);
        toast.success("Review submitted!");
        fetchTaskData();
        if (user && user._id === updatedReviewee._id) {
            updateUser({ averageRating: updatedReviewee.averageRating });
        }
    };

    const isOwner = user && task && user._id === task.taskSeeker._id;
    const isAssignedProvider = user && task && user._id === task.assignedProvider?._id;
    const chatRecipient = (isOwner ? task?.assignedProvider : task?.taskSeeker) as AuthUser | undefined;
    const mapCoordinates: [number, number] | null = task ? [task.location.coordinates[1], task.location.coordinates[0]] : null;

    return {
        user,
        task,
        bids,
        loading,
        isChatOpen,
        setIsChatOpen,
        isReviewModalOpen,
        setIsReviewModalOpen,
        reviewee,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        clientSecret,
        isPaymentMethodModalOpen,
        setIsPaymentMethodModalOpen,
        selectedBid,
        fetchTaskData,
        handleAcceptBidClick,
        handleSelectPaymentMethod,
        handleCancelTask,
        handleResumePayment,
        handlePaymentSuccess,
        handleProviderComplete,
        handleSeekerConfirm,
        handleReviewSubmitted,
        isOwner,
        isAssignedProvider,
        chatRecipient,
        mapCoordinates,
        taskId
    };
};