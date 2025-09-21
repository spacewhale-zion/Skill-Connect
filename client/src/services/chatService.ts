// src/services/chatService.ts
import api from '../api/axiosConfig';
import { AuthUser } from '../types';

export interface Message {
  _id: string;
  sender: Pick<AuthUser, '_id' | 'name' | 'profilePicture'>;
  text: string;
  createdAt: string;
  isRead?: boolean; // <- optional flag for TypeScript
}

export interface ChatHistoryResponse {
  conversationId: string;
  messages: Message[];
}

export const fetchChatHistory = async (taskId: string): Promise<ChatHistoryResponse> => {
  const { data } = await api.get(`/chats/${taskId}`);
  return data;
};

// ✅ Add this function
export const markMessageAsRead = async (messageId: string) => {
  const { data } = await api.patch(`/chats/message/read/${messageId}`);
  return data;
};
