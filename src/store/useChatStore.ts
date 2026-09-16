import { create } from 'zustand';
import { Message } from '../types/index';
import { ChatService } from '../services';

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => {
    const newMessage: Message = {
      ...msg,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },
  sendMessage: async (content) => {
    const { addMessage } = get();
    
    // Optimistic UI update
    addMessage({ sessionId: 'default', role: 'user', content });
    set({ isTyping: true });
    
    try {
      const res = await ChatService.sendMessage(content);
      if (res.text !== undefined) {
         addMessage({ sessionId: 'default', role: 'assistant', content: res.text });
      } else if (res.reply !== undefined) {
         addMessage({ sessionId: 'default', role: 'assistant', content: res.reply });
      } else if (res.success) {
         addMessage({ sessionId: 'default', role: 'assistant', content: 'Success' });
      } else {
         addMessage({ sessionId: 'default', role: 'system', content: `Error: Unknown response format` });
      }
    } catch (err: any) {
      addMessage({ sessionId: 'default', role: 'system', content: `System Error: ${err.message}` });
    } finally {
      set({ isTyping: false });
    }
  },
  clearHistory: () => set({ messages: [] })
}));
