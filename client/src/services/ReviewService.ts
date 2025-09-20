import api from '../api/axiosConfig';
import { Review } from '../types';

export interface ReviewCreationData {
  rating: number;
  comment?: string;
}

/**
 * Creates a new review for a task.
 * Corresponds to: POST /api/tasks/:taskId/review
 * @param taskId - The ID of the task being reviewed.
 * @param reviewData - The rating and optional comment.
 */
export const createReview = async (taskId: string, reviewData: ReviewCreationData): Promise<Review> => {
  const { data } = await api.post(`/tasks/${taskId}/review`, reviewData);
  return data;
};