import { NavixMemory, MemoryEvent, MemoryRelation, CreateMemoryInput } from '../types/memory';

const STORAGE_KEY = 'NAVIX_MEMORY_POSTGRES_DB_V2';

/**
 * NAVIX Browser Memory Store.
 *
 * HONESTY NOTE: despite the old name "PostgresDatabase", this class does
 * NOT connect to PostgreSQL. It stores everything in the browser's
 * `localStorage` — per-device, per-browser, not synced, not durable if the
 * user clears site data. For a real server-side persistent database, see
 * `src/backend/database/pg-client.ts`, which does connect to a real
 * Postgres instance via `DATABASE_URL`. This class is kept (renamed via
 * export alias below for backward compatibility) as a lightweight local
 * cache for the in-browser "memory" UI feature only.
 */
export class LocalBrowserMemoryStore {
  private memories: Map<string, NavixMemory> = new Map();
  private events: MemoryEvent[] = [];
  private relations: MemoryRelation[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.memories.size === 0) {
      this.seedInitialMemories();
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.memories)) {
          parsed.memories.forEach((item: NavixMemory) => {
            this.memories.set(item.id, {
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              lastAccessedAt: item.lastAccessedAt ? new Date(item.lastAccessedAt) : undefined,
              expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
            });
          });
        }
      }
    } catch {
      // fallback
    }
  }

  private saveToStorage() {
    try {
      const payload = {
        memories: Array.from(this.memories.values()),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage quota or fallback
    }
  }

  private seedInitialMemories() {
    const defaultMemories: CreateMemoryInput[] = [
      {
        userId: 'default_user',
        projectId: 'navix_ai',
        type: 'project',
        layer: 'hot',
        title: 'Arsitektur NAVIX AI',
        content: 'NAVIX AI dibangun menggunakan React 18, Vite, TypeScript, dan Tailwind CSS dengan tema Cyber-Dark.',
        summary: 'Stack utama Navix: React + TypeScript + Cyber-Dark theme.',
        importance: 95,
        confidence: 100,
        tags: ['navix', 'react', 'typescript', 'architecture']
      },
      {
        userId: 'default_user',
        projectId: 'navix_ai',
        type: 'user_preference',
        layer: 'warm',
        title: 'Preferensi Desain',
        content: 'User menyukai antarmuka serba gelap (dark mode) dengan respons AI ringkas, elegan, dan aksen warna amber/cyan.',
        summary: 'Desain dark mode cyber dengan aksen amber/cyan.',
        importance: 85,
        confidence: 90,
        tags: ['preference', 'ui', 'darkmode']
      },
      {
        userId: 'default_user',
        projectId: 'navix_ai',
        type: 'decision',
        layer: 'warm',
        title: 'Security Policy',
        content: 'Semua API key dan rahasia aplikasi harus disimpan di backend (server-side) dan tidak pernah diekspos ke browser.',
        summary: 'API key wajib disimpan aman di backend.',
        importance: 100,
        confidence: 100,
        tags: ['security', 'backend', 'api_key']
      }
    ];

    defaultMemories.forEach(input => this.createMemorySync(input));
  }

  private createMemorySync(input: CreateMemoryInput): NavixMemory {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const memory: NavixMemory = {
      id,
      userId: input.userId,
      projectId: input.projectId,
      type: input.type,
      layer: input.layer || 'hot',
      title: input.title,
      content: input.content,
      summary: input.summary || input.content.slice(0, 100),
      importance: input.importance ?? 50,
      confidence: input.confidence ?? 80,
      status: 'active',
      version: 1,
      tags: input.tags || [],
      accessCount: 0,
      createdAt: now,
      updatedAt: now,
      expiresAt: input.expiresAt
    };

    this.memories.set(id, memory);
    this.saveToStorage();
    return memory;
  }

  async createMemory(input: CreateMemoryInput): Promise<NavixMemory> {
    return this.createMemorySync(input);
  }

  async getMemory(id: string): Promise<NavixMemory | null> {
    const mem = this.memories.get(id);
    if (!mem || mem.status === 'deleted') return null;

    // Update access count & last accessed
    mem.accessCount += 1;
    mem.lastAccessedAt = new Date();
    this.saveToStorage();

    return mem;
  }

  async updateMemory(id: string, updates: Partial<NavixMemory>): Promise<NavixMemory | null> {
    const existing = this.memories.get(id);
    if (!existing) return null;

    const updated: NavixMemory = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date()
    };

    this.memories.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  async getAllMemories(userId: string, projectId?: string): Promise<NavixMemory[]> {
    return Array.from(this.memories.values()).filter(m => {
      if (m.status === 'deleted') return false;
      if (m.userId !== userId && m.userId !== 'default_user') return false;
      if (projectId && m.projectId && m.projectId !== projectId) return false;
      return true;
    });
  }

  async recordEvent(event: Omit<MemoryEvent, 'id' | 'createdAt'>): Promise<void> {
    const newEvent: MemoryEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date()
    };
    this.events.push(newEvent);
  }
}

export const postgresDb = new LocalBrowserMemoryStore();
// Backward-compatible alias in case anything still imports the old name.
export { LocalBrowserMemoryStore as PostgresDatabase };
