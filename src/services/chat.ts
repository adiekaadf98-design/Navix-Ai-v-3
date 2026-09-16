import { ApiClient } from './api-client';

export const ChatService = {
  sendMessage: async (message: string, sessionId?: string) => {
    return ApiClient.post('/api/chat', { message, sessionId });
  }
};
