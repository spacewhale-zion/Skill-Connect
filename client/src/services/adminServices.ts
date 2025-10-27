import api from '../api/axiosConfig';
import { AuthUser, Task, Service } from '@/types';

export interface AdminStats {
    totalUsers: number;
    totalTasks: number;
    completedTasks: number;
    totalServices: number;
    totalIncome: number;
}

export const getAllUsers = async (): Promise<AuthUser[]> => {
  const { data } = await api.get('/admin/users');
  // Add createdAt if needed for sorting/display
  return data.map(user => ({ ...user, createdAt: user.createdAt || new Date().toISOString() }));
};

export const toggleUserSuspension = async (userId: string): Promise<{ message: string, user: Partial<AuthUser> }> => {
  const { data } = await api.put(`/admin/users/${userId}/suspend`);
  return data;
};

export const deleteTaskAsAdmin = async (taskId: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/admin/tasks/${taskId}`);
  return data;
};

export const deleteServiceAsAdmin = async (serviceId: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/admin/services/${serviceId}`);
  return data;
};


/**
 * Fetches all tasks (Admin only).
 * Corresponds to: GET /api/admin/tasks
 */
export const getAllTasksAsAdmin = async (): Promise<Task[]> => {
  const { data } = await api.get('/admin/tasks');
  return data;
};

/**
 * Fetches all services (Admin only).
 * Corresponds to: GET /api/admin/services
 */
export const getAllServicesAsAdmin = async (): Promise<Service[]> => {
  const { data } = await api.get('/admin/services');
  return data;
};

export const getAdminStatsData = async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
}

export const makeUserAdmin = async (userId: string): Promise<{ message: string, user: Partial<AuthUser> }> => {
  const { data } = await api.put(`/admin/users/${userId}/make-admin`);
  return data;
};