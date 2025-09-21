import { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationAsRead } from '../services/notificationServices';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/notificationContext';
import type { Notification } from '../types';

interface NotificationsPageProps {
  openChatWindow: (conversationId: string, recipientId: string, recipientName: string) => void;
  activeChatId?: string; // optional prop to know which chat is open
}

const NotificationsPage = ({ openChatWindow, activeChatId }: NotificationsPageProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifications, setNotifications, decrementUnreadCount } = useNotifications();

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
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        decrementUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read");
      }
    }

    if (notification.title === "New Chat Message" && notification.link) {
      const conversationId = notification.link.split("/chat/")[1];
      const recipientId = notification.link.split("/user/")[1] || ''; 
      
      // Only open chat if it's not already open
      if (conversationId !== activeChatId) {
        openChatWindow(conversationId, recipientId, notification.message);
      }
    } else {
      navigate(notification.link);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
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
  );
};

export default NotificationsPage;
