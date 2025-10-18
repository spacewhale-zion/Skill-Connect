// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/client/src/services/notificationServices.ts
import api from '../api/axiosConfig';

import type { Notification } from '@/types';


export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const { data } = await api.put(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsAsRead = async (): Promise<{ message: string }> => {
  const { data } = await api.put('/notifications/read-all');
  return data;
};