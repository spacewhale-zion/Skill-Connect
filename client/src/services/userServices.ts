import api from '../api/axiosConfig';
import { AuthUser } from '../types'; // Assuming AuthUser is in your types file

// Represents the data that can be updated
import type {ProfileUpdateData} from '../types/index'

/**
 * Updates the currently logged-in user's profile.
 * Corresponds to: PUT /api/users/profile
 * @param profileData - The data to update.
 */
export const updateUserProfile = async (profileData: ProfileUpdateData): Promise<AuthUser> => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};