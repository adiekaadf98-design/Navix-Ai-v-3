export type MemoryLayer = 'hot' | 'warm' | 'cold';

export type MemoryType =
  | 'session'
  | 'user_preference'
  | 'project'
  | 'knowledge'
  | 'experience'
  | 'decision'
  | 'error_solution';

export type MemoryStatus =
  | 'active'
  | 'archived'
  | 'superseded'
  | 'deleted';

export type RelationType =
  | 'related_to'
  | 'updates'
  | 'contradicts'
  | 'depends_on'
  | 'derived_from'
  | 'belongs_to';

export type EventType =
  | 'created'
  | 'updated'
  | 'merged'
  | 'archived'
  | 'retrieved'
  | 'expired'
  | 'deleted';

export interface NavixMemory {
  id: string;
  userId: string;
  projectId?: string;

  type: MemoryType;
  layer: MemoryLayer;

  title: string;
  content: string;
  summary?: string;

  importance: number; // 0-100
  confidence: number; // 0-100

  status: MemoryStatus;

  version: number;
  parentMemoryId?: string;

  tags: string[];

  accessCount: number;
  lastAccessedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  expiresAt?: Date;

  // Runtime vector score metadata when retrieved
  vectorSimilarity?: number;
}

export interface MemoryScore {
  relevance: number;
  importance: number;
  recency: number;
  confidence: number;
  usage: number;
}

export interface CreateMemoryInput {
  userId: string;
  projectId?: string;
  type: MemoryType;
  layer?: MemoryLayer;
  title: string;
  content: string;
  summary?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  expiresAt?: Date;
}

export interface MemoryRetrievalQuery {
  userId: string;
  projectId?: string;
  query: string;
  limit?: number;
  layers?: MemoryLayer[];
  types?: MemoryType[];
  minScore?: number;
}

export interface MemoryRetrievalResponse {
  query: string;
  memories: Array<{
    memory: NavixMemory;
    score: number;
    reason: string;
  }>;
  context: string;
}

export interface MemoryEvent {
  id: string;
  memoryId: string;
  eventType: EventType;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: Date;
}

export interface MemoryRelation {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relationType: RelationType;
  confidence: number;
  createdAt: Date;
}
