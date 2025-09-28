// spacewhale-zion/skill-connect/Skill-Connect-8d5e060725284c7b119a64381a1e39067c5f2b04/client/src/services/taskServices.ts
import api from '../api/axiosConfig';

// --- TypeScript Interfaces ---

// Represents the full Task object received from the backend

import {Task,TaskCreationData,TaskSearchParams} from '../types/index'

// --- API Service Functions ---

/**
 * Creates a new task.
 * Corresponds to: POST /api/tasks
 * @param taskData - The data for the new task.
 */
export const createTask = async (taskData: TaskCreationData): Promise<Task> => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};


/**
 * Fetches a single task by its ID.
 * Corresponds to: GET /tasks/:id
 * @param taskId - The ID of the task to fetch.
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
};

// Represents the query parameters for searching tasks


// The getTasks function is now updated to use the full interface
export const getTasks = async (params: TaskSearchParams): Promise<Task[]> => {
  const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));
  const { data } = await api.get('/tasks', { params: filteredParams });
  console.log(data);
  return data;
};

/**
 * Assigns a task to a provider.
 * Corresponds to: PUT /api/tasks/:id/assign
 * @param taskId - The ID of the task to update.
 * @param providerId - The ID of the user being assigned.
 * @param bidId - The ID of the accepted bid.
 */
export const assignTask = async (
  taskId: string,
  providerId: string,
  bidId: string,
  paymentMethod: 'Stripe' | 'Cash'
): Promise<{ task: Task; clientSecret: string | null }> => {
  const { data } = await api.put(`/tasks/${taskId}/assign`, { providerId, bidId, paymentMethod });
  return data;
};
export const getTaskPaymentDetails = async (taskId: string): Promise<{ clientSecret: string }> => {
  const { data } = await api.get(`/tasks/${taskId}/payment-details`);
  return data;
};

export const markTaskAsCompletedByProvider = async (taskId: string): Promise<Task> => {
  const { data } = await api.put(`/tasks/${taskId}/complete-by-provider`);
  return data;
};

export const completeTask = async (taskId: string): Promise<Task> => {
  const { data } = await api.put(`/tasks/${taskId}/complete`);
  return data;
};

/**
 * Fetches tasks created by the currently logged-in user.
 * Corresponds to: GET /api/tasks/mytasks
 */
export const getMyPostedTasks = async (): Promise<Task[]> => {
  const { data } = await api.get('/tasks/mytasks');
  return data;
};

/**
 * Fetches tasks assigned to the currently logged-in user.
 * Corresponds to: GET /api/tasks/assignedtome
 */
export const getMyAssignedTasks = async (): Promise<Task[]> => {
  const { data } = await api.get('/tasks/assignedtome');
  return data;
};