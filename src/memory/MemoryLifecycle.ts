import { NavixMemory } from '../types/memory';
import { postgresDb } from '../database/postgres';
import { redisClient } from '../database/redis';

export class MemoryLifecycle {
  public async processLifecycle(userId: string): Promise<{ archived: number; demoted: number }> {
    const memories = await postgresDb.getAllMemories(userId);
    const now = new Date().getTime();
    let archived = 0;
    let demoted = 0;

    for (const mem of memories) {
      // 1. Check expiration
      if (mem.expiresAt && now > new Date(mem.expiresAt).getTime()) {
        await postgresDb.updateMemory(mem.id, { status: 'archived' });
        await redisClient.del(`hot_${mem.userId}_${mem.projectId || 'all'}_${mem.id}`);
        archived++;
        continue;
      }

      // 2. Transition layers based on access frequency & age
      const ageHours = (now - new Date(mem.updatedAt).getTime()) / (1000 * 60 * 60);

      if (mem.layer === 'hot' && ageHours > 48 && mem.accessCount < 5) {
        await postgresDb.updateMemory(mem.id, { layer: 'warm' });
        demoted++;
      } else if (mem.layer === 'warm' && ageHours > 720 && mem.accessCount < 2) {
        await postgresDb.updateMemory(mem.id, { layer: 'cold' });
        demoted++;
      }
    }

    return { archived, demoted };
  }
}

export const memoryLifecycle = new MemoryLifecycle();
