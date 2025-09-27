// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/client/src/pages/NotificationPage.tsx
import { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationServices';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/notificationContext';
import type { Notification } from '../types';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

interface NotificationsPageProps {
  openChatWindow: (conversationId: string, recipientId: string, recipientName: string) => void;
  activeChatId?: string;
}

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
      clearUnreadCount(); // Use the new function to clear the count
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error("Failed to mark all notifications as read.");
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <li
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      {!notification.isRead && (
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      )}
                      <div className={`flex-1 ${notification.isRead ? 'pl-7' : ''}`}>
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-8 text-center text-gray-500">You have no notifications.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;