export type EngineStatus = 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'RUNNING' 
  | 'IDLE' 
  | 'success' 
  | 'error'
  | 'AVAILABLE'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CAPABILITY_NOT_AVAILABLE'
  | 'TIMEOUT'
  | 'AUTH_ERROR'
  | 'RATE_LIMITED'
  | 'DISABLED'
  | 'DEGRADED';

export interface EngineResult<T = any> {
  status: EngineStatus;
  source: string;
  engineName?: string;
  category?: 'image' | 'video' | 'audio' | 'document' | 'vision' | 'web' | 'trading' | 'agent' | 'coding' | 'security' | 'general' | 'math';
  data?: T;
  output?: T;
  realOutput?: any;
  message?: string;
  error?: string;
  latencyMs?: number;
  current_price?: number;
  klines?: string;
  [key: string]: any;
}

export interface IEngine<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category?: 'image' | 'video' | 'audio' | 'document' | 'vision' | 'web' | 'trading' | 'agent' | 'coding' | 'security' | 'general' | 'math';
  capabilities?: string[];
  execute(input: TInput, signal?: AbortSignal): Promise<EngineResult<TOutput>>;
  healthCheck?(): Promise<boolean>;
}

