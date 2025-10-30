// client/src/pages/tasks/TaskDetailsPage.tsx
import { useTaskDetailsPage } from '@/hooks/tasks/useTaskDetailsPage'; // <-- Import the hook
import MapView from '@/components/map/MapView.tsx';
import PlaceBidForm from '@/components/bids/PlaceBidsForm.tsx';
import ChatWindow from '@/components/chat/ChatWindow.tsx';
import SubmitReviewModal from '@/components/reviews/SubmitReviewmodal.tsx';
import PaymentModal from '@/components/payment/PaymentModal.tsx';
import PaymentMethodModal from '@/components/payment/PaymentMethodModal.tsx';
import type { AuthUser } from '@/types/index.ts';
import { FaStar } from 'react-icons/fa';
import LoadingSpinner from '@/components/layout/LoadingSpinner.tsx';

const TaskDetailsPage = () => {
    // --- Call the hook to get all state and logic ---
    const {
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
    } = useTaskDetailsPage();

    if (loading) return <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
    </div>
    if (!task || !mapCoordinates) return <div className="bg-slate-900 min-h-screen text-white text-center py-10">Task not found.</div>;

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