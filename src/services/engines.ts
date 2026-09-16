import { ApiClient } from './api-client';
import { TaskSubmitResponse, TaskStatusResponse } from '../types/index';

export const TaskService = {
  submitTask: async (type: string, payload: any): Promise<TaskSubmitResponse> => {
    return ApiClient.post<TaskSubmitResponse>('/api/tasks', { type, payload });
  },

  getTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
    return ApiClient.get<TaskStatusResponse>(`/api/tasks/${taskId}`);
  }
};

export const KnowledgeService = {
  ingest: async (docId: string, text: string, metadata?: any) => {
    return ApiClient.post('/api/knowledge/ingest', { docId, text, metadata });
  }
};

export const CreativeService = {
  generateImage: async (prompt: string, aspectRatio?: string) => {
    return ApiClient.post('/api/creative/image', { prompt, aspectRatio });
  }
};

export const MonitoringService = {
  getHealth: async () => {
    return ApiClient.get('/api/monitoring/health');
  },
  getStats: async () => {
    return ApiClient.get('/api/monitoring/stats');
  }
};
