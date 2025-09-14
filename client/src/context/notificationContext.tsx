import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';
import { fetchNotifications } from '../services/notificationServices';
import toast from 'react-hot-toast';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Establish socket connection when user logs in
    if (user && !socket) {
      const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const newSocket = io(SERVER_URL, { auth: { token: user.token } });
      setSocket(newSocket);
    }
    // Disconnect when user logs out
    if (!user && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user, socket]);

  const loadNotifications = useCallback(async () => {
    if (user) {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        toast.error("Could not fetch notifications.");
      }
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();

    if (socket) {
      // Listen for new notifications from the server
      socket.on('new_notification', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.success(`New notification: ${newNotification.title}`);
      });

      // Cleanup listener on unmount
      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, loadNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};