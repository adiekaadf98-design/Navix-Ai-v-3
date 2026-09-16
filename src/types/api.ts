import { Task } from './models';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface TaskSubmitResponse {
  success: boolean;
  taskId?: string;
  error?: string;
}

export interface TaskStatusResponse {
  success: boolean;
  task?: Task;
  error?: string;
}
