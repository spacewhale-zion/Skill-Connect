import { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationServices';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/notificationContext';
import type { Notification } from '@/types';

import { FaBell, FaDollarSign, FaCommentDots, FaCheckCircle, FaBriefcase } from 'react-icons/fa';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface NotificationsPageProps {
  openChatWindow: (conversationId: string, recipientId: string, recipientName: string) => void;
  activeChatId?: string;
}

// Helper function to determine the icon and color based on notification title
const getNotificationIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('bid')) {
        return { icon: <FaDollarSign />, color: 'bg-yellow-500/20 text-yellow-300' };
    }
    if (lowerTitle.includes('message')) {
        return { icon: <FaCommentDots />, color: 'bg-sky-500/20 text-sky-300' };
    }
    if (lowerTitle.includes('complete') || lowerTitle.includes('confirmed') || lowerTitle.includes('released')) {
        return { icon: <FaCheckCircle />, color: 'bg-green-500/20 text-green-400' };
    }
     if (lowerTitle.includes('assigned') || lowerTitle.includes('booked')) {
        return { icon: <FaBriefcase />, color: 'bg-pink-500/20 text-pink-400' };
    }
    return { icon: <FaBell />, color: 'bg-slate-700 text-slate-300' };
};

const NotificationsPage = ({ openChatWindow, activeChatId }: NotificationsPageProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifications, setNotifications, decrementUnreadCount, unreadCount, clearUnreadCount } = useNotifications();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [setNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        decrementUnreadCount();
      } catch (error) {
        toast.error("Failed to mark notification as read.");
      }
    }
  
    // This logic remains the same
    if (notification.title.startsWith("New message from") && notification.link) {
      const taskId = notification.link.split("/tasks/")[1];
      const recipientName = notification.title.replace("New message from ", "");
      if (taskId && taskId !== activeChatId) {
        openChatWindow(taskId, "recipient-id-placeholder", recipientName);
      }
    } else {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      clearUnreadCount();
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error("Failed to mark all notifications as read.");
    }
  };

  if (loading) return <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner/>
      </div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div>
            {notifications.length > 0 ? (
              <ul className="divide-y divide-slate-700">
                {notifications.map(notification => {
                  const { icon, color } = getNotificationIcon(notification.title);
                  return (
                    <li
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-6 hover:bg-slate-700/50 cursor-pointer transition-colors duration-200 flex items-start gap-4 ${!notification.isRead ? 'bg-slate-800' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                        {icon}
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-white">{notification.title}</p>
                        <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end">
                        {!notification.isRead && (
                            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full mb-2 animate-pulse"></div>
                        )}
                        <p className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="p-12 text-center text-slate-500">You have no notifications yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;