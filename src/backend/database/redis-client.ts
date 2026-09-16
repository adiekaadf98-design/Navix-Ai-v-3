import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        showFriendlyErrorStack: true
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Connected to Redis (Cache Layer)');
      });

      this.client.on('error', (err) => {
        logger.error('Redis Connection Error:', err);
        this.isConnected = false;
      });
    } else {
      logger.warn('REDIS_URL not set. Redis cache is unavailable; cache operations will fail closed.');
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.client && this.isConnected) {
        return await this.client.get(key);
      }
      return null;
    } catch (err) {
      logger.error(`Redis GET error for key ${key}`, err);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
      } else {
        // Cache is optional; without Redis the request continues without persistence.
      }
    } catch (err) {
      logger.error(`Redis SET error for key ${key}`, err);
    }
  }
}

export const redisClient = new RedisCache();
