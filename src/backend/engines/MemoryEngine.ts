import { pgClient } from '../database/pg-client';
import { redisClient } from '../database/redis-client';
import { pineconeClient } from '../database/pinecone-client';
import { logger } from '../utils/logger';

export class BackendMemoryEngine {
  
  async saveMemory(userId: string, type: string, content: string, vector?: number[]) {
    try {
      // 1. Save structured data to PostgreSQL
      const query = `
        INSERT INTO memories (user_id, type, content, importance, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id
      `;
      const result = await pgClient.query(query, [userId, type, content, 50]);
      const memoryId = result[0]?.id || `mem_${Date.now()}`;

      // 2. Clear cache
      await redisClient.set(`memories_${userId}`, '', 1); // expire immediately

      // 3. Upsert to Pinecone if vector provided
      if (vector && vector.length > 0) {
         await pineconeClient.upsert(memoryId, vector, { userId, type, content });
      }

      logger.info(`Saved new memory for user ${userId}`, { memoryId });
      return { success: true, id: memoryId };
    } catch (error) {
      logger.error('Failed to save memory', { error });
      return { success: false, error: 'Database error' };
    }
  }

  async retrieveContext(userId: string, queryVector?: number[]): Promise<any[]> {
    try {
      // 1. Check Cache
      const cached = await redisClient.get(`memories_${userId}`);
      if (cached) {
         logger.debug('Memory context retrieved from Redis Cache');
         return JSON.parse(cached);
      }

      // 2. If vector provided, search Pinecone
      let results: any[] = [];
      if (queryVector) {
         const matches = await pineconeClient.query(queryVector, 5);
         results = matches.map(m => m.metadata);
      } else {
         // Fallback to recent Postgres memories
         const query = `
           SELECT type, content FROM memories
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 10
         `;
         results = await pgClient.query(query, [userId]);
      }

      // 3. Set Cache
      if (results.length > 0) {
         await redisClient.set(`memories_${userId}`, JSON.stringify(results), 3600);
      }

      return results;
    } catch (error) {
      logger.error('Failed to retrieve memory context', { error });
      return [];
    }
  }
}

export const memoryEngine = new BackendMemoryEngine();
