import api from '../api/axiosConfig';

import type { Notification } from '../types';


export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const { data } = await api.put(`/notifications/${notificationId}/read`);
  return data;
};