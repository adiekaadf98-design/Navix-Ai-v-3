export interface Attachment {
  type: 'image' | 'video' | 'audio';
  url: string; // Blob URL for preview
  mimeType: string;
  data?: string; // base64 representation of the file to send to server
  name?: string;
}

export interface EngineTraceStage {
  index: number;
  engine: string;
  category: string;
  action: string;
  status: string;
  latencyMs: number;
  score: number;
  fallbackUsed?: string;
  hasOutput: boolean;
}

export interface EngineTraceData {
  traceId: string;
  domain: string;
  primaryEngine: string;
  totalLatencyMs: number;
  stagesCount: number;
  qualityGatePassed: boolean;
  stages: EngineTraceStage[];
}

import type { FormalProofHierarchy } from './services/FormalProofReasoningEngine';
import type { FrontierBenchmarkAudit } from './services/FrontierBenchmarkSentinel';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date | string;
  attachments?: Attachment[];
  systemInstruction?: string;
  thinkingState?: any;
  engineTrace?: EngineTraceData;
  proofHierarchy?: FormalProofHierarchy;
  frontierBenchmark?: FrontierBenchmarkAudit;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date | string;
}

export type NavixAppView = 
  | 'chat' 
  | 'ecosystem_hub'
  | 'studio' 
  | 'document' 
  | 'science' 
  | 'cloud' 
  | 'world_clock'
  | 'image_studio' 
  | 'video_studio' 
  | 'audio_studio' 
  | 'media_library' 
  | 'ai_agents' 
  | 'app_connectors' 
  | 'plugins_sdk' 
  | 'api_keys' 
  | 'knowledge_base' 
  | 'automations' 
  | 'projects_isolation' 
  | 'trading_desk' 
  | 'stock_image_studio'
  | 'turbo_multimedia'
  | 'architecture_runtime'
  | 'admin_dashboard';

export interface SavedDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  source?: 'editor' | 'chat' | 'media';
  sessionId?: string;
  author?: string;
}
