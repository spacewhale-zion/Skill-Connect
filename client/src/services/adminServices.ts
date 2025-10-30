import api from '../api/axiosConfig';
import { AuthUser, Task, Service } from '@/types';

export interface AdminStats {
    totalUsers: number;
    totalTasks: number;
    completedTasks: number;
    totalServices: number;
    totalIncome: number;
}

// --- NEW: Define interfaces for paginated responses ---
interface PaginatedUsersResponse {
  results: AuthUser[];
  page: number;
  totalPages: number;
  totalCount: number;
}
interface PaginatedServicesResponse {
  results: Service[];
  page: number;
  totalPages: number;
  totalCount: number;
}

interface PaginatedTasksResponse {
  results: Task[];
  page: number;
  totalPages: number;
  totalCount: number;
}

interface AdminDataRequestParams {
  page: number;
  limit: number;
  search: string;
}

export interface ChartDataResponse {
  userSignupData: { name: string; users: number }[];
  taskStatusData: { name: string; value: number }[];
  monthlyRevenueData: { name: string; revenue: number }[];
}

export const getAllUsers = async ({ page, limit, search }: AdminDataRequestParams): Promise<PaginatedUsersResponse> => {
  const { data } = await api.get('/admin/users', {
    params: { page, limit, search },
  });
  // Add createdAt if needed for sorting/display
  const usersWithDate = data.results.map((user: AuthUser) => ({
    ...user,
    createdAt: user.createdAt || new Date().toISOString(),
  }));
  return { ...data, results: usersWithDate };
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
export const getAllTasksAsAdmin = async ({ page, limit, search }: AdminDataRequestParams): Promise<PaginatedTasksResponse> => {
  const { data } = await api.get('/admin/tasks', {
    params: { page, limit, search },
  });
  return data;
};

/**
 * Fetches all services (Admin only).
 * Corresponds to: GET /api/admin/services
 */
export const getAllServicesAsAdmin = async ({ page, limit, search }: AdminDataRequestParams): Promise<PaginatedServicesResponse> => {
  const { data } = await api.get('/admin/services', {
    params: { page, limit, search },
  });
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

export const getAdminChartData = async (): Promise<ChartDataResponse> => {
    const { data } = await api.get('/admin/chart-data');
    return data;
};