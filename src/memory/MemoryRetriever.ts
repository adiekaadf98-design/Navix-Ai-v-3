import { NavixMemory, MemoryRetrievalQuery, MemoryRetrievalResponse } from '../types/memory';
import { postgresDb } from '../database/postgres';
import { redisClient } from '../database/redis';
import { vectorStore } from '../database/vectorStore';
import { memoryRanker } from './MemoryRanker';

export class MemoryRetriever {
  async retrieve(
    query: string,
    userId: string,
    projectId?: string
  ): Promise<NavixMemory[]> {
    // 1. Check Redis Hot Cache first
    const cacheKey = `hot_${userId}_${projectId || 'all'}_${query.toLowerCase().trim()}`;
    const cachedItem = await redisClient.get(cacheKey);
    if (cachedItem) {
      return [cachedItem];
    }

    // 2. Fetch candidate memories from Postgres
    const candidates = await postgresDb.getAllMemories(userId, projectId);
    if (candidates.length === 0) return [];

    // 3. Generate Vector Embedding for Query
    const queryVector = vectorStore.generateEmbedding(query);

    // 4. Vector Search
    const searchResults = vectorStore.search(queryVector, candidates, 30);
    const searchedMemories = searchResults.map(r => r.memory);

    // 5. Rank Candidates using NAVIX Ranker formula
    const ranked = memoryRanker.rank(searchedMemories, query);

    const resultMemories = ranked.slice(0, 10).map(r => r.memory);

    // Cache top result in Redis Hot Cache
    if (resultMemories.length > 0) {
      await redisClient.set(cacheKey, resultMemories[0], 300); // 5 min TTL
    }

    return resultMemories;
  }

  async retrieveStructured(options: MemoryRetrievalQuery): Promise<MemoryRetrievalResponse> {
    const memories = await this.retrieve(options.query, options.userId, options.projectId);
    
    const formatted = memories.map(mem => ({
      memory: mem,
      score: Math.min(100, Math.round((mem.vectorSimilarity || 0.75) * 100)),
      reason: `Relevan dengan ${mem.type} (${mem.title})`
    }));

    const context = memories
      .map(m => `[${m.type}]\n${m.summary || m.content}`)
      .join('\n\n');

    return {
      query: options.query,
      memories: formatted,
      context
    };
  }
}

export const memoryRetriever = new MemoryRetriever();
