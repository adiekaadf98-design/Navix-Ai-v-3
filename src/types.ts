export interface Attachment {
  type: 'image' | 'video' | 'audio';
  url: string; // Blob URL for preview
  mimeType: string;
  data?: string; // base64 representation of the file to send to server
  name?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date | string; // Allow string for JSON parsing
  attachments?: Attachment[];
  systemInstruction?: string;
  thinkingState?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date | string;
}

export type NavixAppView = 
  | 'chat' 
  | 'studio' 
  | 'document' 
  | 'science' 
  | 'cloud' 
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

