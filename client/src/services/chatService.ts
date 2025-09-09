import api from '../api/axiosConfig';
import { AuthUser } from '../types';

export interface Message {
  _id: string;
  sender: Pick<AuthUser, '_id' | 'name' | 'profilePicture'>;
  text: string;
  createdAt: string;
}

export interface ChatHistoryResponse {
  conversationId: string;
  messages: Message[];
}

export const fetchChatHistory = async (taskId: string): Promise<ChatHistoryResponse> => {
  const { data } = await api.get(`/chats/${taskId}`);
  return data;
};