// .t// src/services/authService.ts
import api from '../api/axiosConfig';
import { UserCredentials, UserRegistrationData,AuthUser } from '../types/index'; // We will create this types file next


export const loginUser = async (credentials: UserCredentials) => {
  const response = await api.post('/auth/login', credentials);
  console.log(response.data);
  return response.data;
};

export const registerUser = async (userData: UserRegistrationData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};



export const getMyProfile = async (): Promise<AuthUser> => {
  const { data } = await api.get('/auth/me');
  return data;
};
