import { CreateMemoryInput, NavixMemory, MemoryRetrievalResponse } from '../types/memory';
import { memoryRetriever } from './MemoryRetriever';
import { memoryWriter } from './MemoryWriter';
import { contextBuilder } from './ContextBuilder';
import { memoryLifecycle } from './MemoryLifecycle';
import { postgresDb } from '../database/postgres';

/**
 * NAVIX Cognitive Memory Engine v2
 * High-performance, vector-search powered cognitive memory system.
 */
export class MemoryEngine {
  /**
   * Retrieves relevant memory items and formats them as structured prompt context.
   */
  async retrieveContext(
    query: string,
    userId: string = 'default_user',
    projectId: string = 'navix_ai'
  ): Promise<{ promptContext: string; memories: NavixMemory[] }> {
    const memories = await memoryRetriever.retrieve(query, userId, projectId);
    const promptContext = contextBuilder.buildPromptContext(memories);
    return { promptContext, memories };
  }

  /**
   * Queries structured memory details with scores & reasons.
   */
  async queryMemory(
    query: string,
    userId: string = 'default_user',
    projectId: string = 'navix_ai'
  ): Promise<MemoryRetrievalResponse> {
    return memoryRetriever.retrieveStructured({
      userId,
      projectId,
      query
    });
  }

  /**
   * Saves a new memory or merges duplicate facts automatically.
   */
  async saveMemory(input: CreateMemoryInput): Promise<NavixMemory> {
    return memoryWriter.save(input);
  }

  /**
   * Fetches memory statistics for dashboard visualization.
   */
  async getMemoryStats(userId: string = 'default_user') {
    const all = await postgresDb.getAllMemories(userId);
    const hotCount = all.filter(m => m.layer === 'hot').length;
    const warmCount = all.filter(m => m.layer === 'warm').length;
    const coldCount = all.filter(m => m.layer === 'cold').length;

    return {
      total: all.length,
      hot: hotCount,
      warm: warmCount,
      cold: coldCount,
      types: {
        project: all.filter(m => m.type === 'project').length,
        user_preference: all.filter(m => m.type === 'user_preference').length,
        decision: all.filter(m => m.type === 'decision').length,
        knowledge: all.filter(m => m.type === 'knowledge').length,
        experience: all.filter(m => m.type === 'experience').length,
        session: all.filter(m => m.type === 'session').length,
        error_solution: all.filter(m => m.type === 'error_solution').length,
      }
    };
  }

  /**
   * Runs background lifecycle sweep (demotions & archiving).
   */
  async maintenance(userId: string = 'default_user') {
    return memoryLifecycle.processLifecycle(userId);
  }
}

export const navixMemoryEngine = new MemoryEngine();
