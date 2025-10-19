// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/client/src/context/notificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';
import { fetchNotifications } from '@/services/notificationServices';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  decrementUnreadCount: () => void;
  incrementUnreadCount: () => void;
  clearUnreadCount: () => void; // New function to clear the count
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user && !socket) {
      const SERVER_URL = import.meta.env.VITE_API_BaseURL ;
      const newSocket = io(SERVER_URL, { auth: { token: user.token } });
      setSocket(newSocket);
    }
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
   const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  const decrementUnreadCount = () => {
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    loadNotifications();

    if (socket) {
      socket.on('new_notification', (newNotification: Notification) => {
        if (newNotification.title !== 'New Chat Message') {
           toast.success(`New notification: ${newNotification.title}`);
        }
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, loadNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setNotifications, decrementUnreadCount, incrementUnreadCount, clearUnreadCount, socket }}>
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