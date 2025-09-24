import api from '../api/axiosConfig';
import { Review, AuthUser } from '../types';

export interface ReviewCreationData {
  rating: number;
  comment?: string;
}

export interface CreateReviewResponse {
    review: Review;
    updatedReviewee: AuthUser;
}

/**
 * Creates a new review for a task.
 * Corresponds to: POST /api/tasks/:taskId/review
 * @param taskId - The ID of the task being reviewed.
 * @param reviewData - The rating and optional comment.
 */
export const createReview = async (taskId: string, reviewData: ReviewCreationData): Promise<CreateReviewResponse> => {
  const { data } = await api.post(`/tasks/${taskId}/review`, reviewData);
  return data;
};