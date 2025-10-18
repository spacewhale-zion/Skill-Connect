import api from '../api/axiosConfig';

import type {Bid} from '@/types'

export const getBidsForTask = async (taskId: string): Promise<Bid[]> => {
  const { data } = await api.get(`/tasks/${taskId}/bids`);
  return data;
};

export const placeBid = async (taskId: string, amount: number, message: string): Promise<Bid> => {
  const { data } = await api.post(`/tasks/${taskId}/bids`, { amount, message });
  return data;
};