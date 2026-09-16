import { NavixMemory } from '../types/memory';

/**
 * NAVIX Redis Hot Memory Cache
 * Provides high-speed key-value cache with TTL & LRU eviction for 'hot' layer memories.
 */
class RedisCache {
  private cache = new Map<string, { value: NavixMemory; expiresAt?: number }>();
  private maxItems = 100;

  async get(key: string): Promise<NavixMemory | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: NavixMemory, ttlSeconds?: number): Promise<void> {
    if (this.cache.size >= this.maxItems) {
      // Simple LRU eviction
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    if (pattern === '*') return allKeys;
    const regex = new RegExp(pattern.replace('*', '.*'));
    return allKeys.filter(k => regex.test(k));
  }
}

export const redisClient = new RedisCache();
