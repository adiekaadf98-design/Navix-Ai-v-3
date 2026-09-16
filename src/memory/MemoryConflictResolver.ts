import { NavixMemory, CreateMemoryInput } from '../types/memory';
import { postgresDb } from '../database/postgres';

export class MemoryConflictResolver {
  public async findDuplicate(
    content: string,
    existingMemories: NavixMemory[]
  ): Promise<{ memory: NavixMemory; similarity: number } | null> {
    const cleanContent = content.toLowerCase().trim();

    for (const mem of existingMemories) {
      const cleanMem = mem.content.toLowerCase().trim();
      if (cleanContent === cleanMem) {
        return { memory: mem, similarity: 1.0 };
      }

      // Check substring overlap
      if (cleanMem.length > 10 && (cleanContent.includes(cleanMem) || cleanMem.includes(cleanContent))) {
        return { memory: mem, similarity: 0.92 };
      }
    }

    return null;
  }

  public async mergeMemory(
    existing: NavixMemory,
    input: CreateMemoryInput
  ): Promise<NavixMemory> {
    const mergedContent = `${existing.content}\n[Update]: ${input.content}`;
    const updated = await postgresDb.updateMemory(existing.id, {
      content: mergedContent,
      importance: Math.max(existing.importance, input.importance ?? 50),
      confidence: Math.max(existing.confidence, input.confidence ?? 80),
      accessCount: existing.accessCount + 1,
      version: existing.version + 1,
      updatedAt: new Date()
    });

    await postgresDb.recordEvent({
      memoryId: existing.id,
      eventType: 'merged',
      oldValue: { content: existing.content, version: existing.version },
      newValue: { content: mergedContent, version: existing.version + 1 }
    });

    return updated || existing;
  }
}

export const memoryConflictResolver = new MemoryConflictResolver();
