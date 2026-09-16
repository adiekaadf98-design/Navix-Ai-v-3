import { CreateMemoryInput, NavixMemory } from '../types/memory';
import { validateMemory } from './MemoryValidator';
import { postgresDb } from '../database/postgres';
import { memoryConflictResolver } from './MemoryConflictResolver';
import { memoryCompressor } from './MemoryCompressor';
import { vectorStore } from '../database/vectorStore';

export class MemoryWriter {
  async save(input: CreateMemoryInput): Promise<NavixMemory> {
    const validation = validateMemory(input);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Sintaks memori tidak valid');
    }

    const existingMemories = await postgresDb.getAllMemories(input.userId, input.projectId);
    const duplicate = await memoryConflictResolver.findDuplicate(input.content, existingMemories);

    if (duplicate && duplicate.similarity > 0.90) {
      return memoryConflictResolver.mergeMemory(duplicate.memory, input);
    }

    const summary = input.summary || memoryCompressor.compress(input.title, input.content);
    const memory = await postgresDb.createMemory({
      ...input,
      summary
    });

    // Generate & store vector embedding
    const embedding = vectorStore.generateEmbedding(`${memory.title} ${memory.content} ${summary} ${memory.tags.join(' ')}`);
    vectorStore.storeEmbedding(memory.id, embedding);

    await postgresDb.recordEvent({
      memoryId: memory.id,
      eventType: 'created',
      newValue: { title: memory.title, type: memory.type, layer: memory.layer }
    });

    return memory;
  }
}

export const memoryWriter = new MemoryWriter();
