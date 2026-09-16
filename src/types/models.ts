export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  type: string;
  content: string;
  importance: number;
  createdAt: string;
}

export interface Task {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: number;
}
