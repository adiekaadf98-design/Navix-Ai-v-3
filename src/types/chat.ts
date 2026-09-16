export type AIMode = 'general' | 'coding' | 'deep_thinking' | 'market_analysis';

export interface MarketMeta {
  symbol?: string;
  pineScriptCode?: string;
  price?: number;
  change24h?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  hasChartIntent?: boolean;
  hasPineScriptIntent?: boolean;
  marketMeta?: MarketMeta;
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  mode: AIMode;
}
