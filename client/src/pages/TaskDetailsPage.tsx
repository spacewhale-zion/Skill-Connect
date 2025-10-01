import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { getTaskById, assignTask, completeTask, getTaskPaymentDetails, cancelTask, markTaskAsCompletedByProvider } from '../services/taskServices.ts';
import { getBidsForTask } from '../services/bidServices.ts';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar.tsx';
import Footer from '../components/layout/Footer.tsx';
import MapView from '../components/map/MapView.tsx';
import PlaceBidForm from '../components/bids/PlaceBidsForm.tsx';
import ChatWindow from '../components/chat/ChatWindow.tsx';
import SubmitReviewModal from '../components/reviews/SubmitReviewmodal.tsx';
import PaymentModal from '../components/payment/PaymentModal.tsx';
import PaymentMethodModal from '../components/payment/PaymentMethodModal.tsx';
import type { AuthUser, Bid, Task } from '../types/index.ts';
import { useNotifications } from '../context/notificationContext.tsx';
import { FaStar } from 'react-icons/fa';
import LoadingSpinner from '../components/layout/LoadingSpinner.tsx';

const TaskDetailsPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
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
    // setLoading(true);
    if (loading)  return <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    if (!task) return <div className="bg-slate-900 min-h-screen text-white text-center py-10">Task not found.</div>;

    const isOwner = user && user._id === task.taskSeeker._id;
    const isAssignedProvider = user && user._id === task.assignedProvider?._id;
    const chatRecipient = (isOwner ? task.assignedProvider : task.taskSeeker) as AuthUser | undefined;
    const mapCoordinates: [number, number] = [task.location.coordinates[1], task.location.coordinates[0]];

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-lg">
                    <div className="border-b border-slate-700 pb-6 mb-8">
                        <span className="font-semibold text-pink-400">{task.category}</span>
                        <h1 className="text-4xl font-extrabold text-white mt-2">{task.title}</h1>
                        <p className="text-slate-400 mt-2">Posted by: {task.taskSeeker.name}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-white mb-4">Task Details</h2>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                            <h3 className="text-2xl font-bold text-white mt-10 mb-4">Location</h3>
                            <MapView coordinates={mapCoordinates} className="grayscale" />
                            {task.reviews && task.reviews.length > 0 && (
                                <div className="mt-10">
                                    <h2 className="text-2xl font-bold text-white mb-4">Reviews</h2>
                                    <div className="space-y-4">
                                        {task.reviews.map(review => {
                                            const reviewer = review.reviewer as any;
                                            return (
                                                <div key={review._id} className="bg-slate-700/50 p-4 rounded-lg">
                                                    <div className="flex items-center mb-2">
                                                        <img src={reviewer?.profilePicture || `https://ui-avatars.com/api/?name=${reviewer?.name || "User"}&background=random&size=128`} alt={reviewer?.name || "Anonymous"} className="w-10 h-10 rounded-full mr-4" />
                                                        <div>
                                                            <p className="font-bold text-white">{reviewer?.name || "Anonymous"}</p>
                                                            <div className="flex items-center text-yellow-400">{Array.from({ length: review.rating }).map((_, i) => <FaStar key={i} />)}</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 italic">"{review.comment}"</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-slate-900/70 border border-slate-700 p-6 rounded-lg sticky top-24">
                                <div className="mb-4 text-center">
                                    <p className="text-sm text-slate-400">Status</p>
                                    <p className="text-lg font-bold text-white">{task.status}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-slate-400">Task Budget</p>
                                    <p className="text-4xl font-extrabold text-yellow-400">₹{task.budget.amount}</p>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                                    {user && isOwner && task.status === 'Open' && (
                                        <div>
                                            <h3 className="text-xl font-bold text-white text-center mb-2">Bids Received ({bids.length})</h3>
                                            <div className="space-y-4">
                                                {bids.length > 0 ? bids.map(bid => (
                                                    <div key={bid._id} className="bg-slate-800 p-4 border border-slate-600 rounded-lg">
                                                        <p className="font-bold text-lg text-yellow-400">₹{bid.amount}</p>
                                                        <p className="text-sm text-slate-300 my-1">by {bid.provider.name}</p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-400"><FaStar className="text-yellow-500" /><span>{bid.provider.averageRating?.toFixed(1) || 'New'}</span></div>
                                                        <button onClick={() => handleAcceptBidClick(bid)} className="w-full text-sm bg-yellow-400 text-slate-900 font-bold py-2 rounded hover:bg-yellow-500 mt-3 transition">Accept Bid</button>
                                                    </div>
                                                )) : <p className="text-slate-500 text-center text-sm">No bids yet.</p>}
                                            </div>
                                        </div>
                                    )}
                                    {user && isOwner && task.status === 'CompletedByProvider' && (
                                        <div className="text-center bg-sky-500/20 border border-sky-400 p-4 rounded-lg">
                                            <p className="text-sky-300 text-sm mb-2">Provider has marked this task as complete.</p>
                                            <button onClick={handleSeekerConfirm} className="w-full py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition">Confirm Completion & Release Payment</button>
                                        </div>
                                    )}
                                    {user && isOwner && task.status === 'Pending Payment' && (
                                        <div className="text-center bg-orange-500/20 border border-orange-400 p-4 rounded-lg">
                                            <h3 className="text-lg font-bold text-orange-300">Action Required</h3>
                                            <p className="text-orange-300 mt-2 text-sm">This task is awaiting payment to be assigned.</p>
                                            <button onClick={handleResumePayment} className="w-full mt-4 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition">Pay Now</button>
                                        </div>
                                    )}
                                    {user && isAssignedProvider && task.status === 'Assigned' && (
                                        <div className="space-y-3">
                                            <button onClick={handleProviderComplete} className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">Mark as Complete</button>
                                            <button onClick={handleCancelTask} className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">Cancel Task</button>
                                        </div>
                                    )}
                                    {user && (isOwner || isAssignedProvider) && (task.status === 'Assigned' || task.status === 'CompletedByProvider') && (
                                        <button onClick={() => setIsChatOpen(true)} className="w-full py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition">Chat with {chatRecipient?.name}</button>
                                    )}
                                    {user && !isOwner && !isAssignedProvider && task.status === 'Open' && (
                                        <PlaceBidForm taskId={task._id} onBidPlaced={fetchTaskData} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isChatOpen && chatRecipient && (<ChatWindow taskId={task._id} recipient={chatRecipient} onClose={() => setIsChatOpen(false)} />)}
            {isReviewModalOpen && reviewee && (<SubmitReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onReviewSubmitted={handleReviewSubmitted} taskId={task._id} revieweeName={reviewee.name} />)}
            <PaymentMethodModal isOpen={isPaymentMethodModalOpen} onClose={() => setIsPaymentMethodModalOpen(false)} onSelectPaymentMethod={handleSelectPaymentMethod} bidAmount={selectedBid?.amount || 0} />
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
        </div>
    );
};

export default TaskDetailsPage;