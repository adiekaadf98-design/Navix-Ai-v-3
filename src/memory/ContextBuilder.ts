import { NavixMemory } from '../types/memory';

export class ContextBuilder {
  build(memories: NavixMemory[]): string {
    if (!memories || memories.length === 0) return '';

    return memories
      .map(memory => `[${memory.type}]\n${memory.summary ?? memory.content}`)
      .join('\n\n');
  }

  buildPromptContext(memories: NavixMemory[]): string {
    const rawContext = this.build(memories);
    if (!rawContext) return '';

    return `\n--- [NAVIX COGNITIVE MEMORY CONTEXT] ---\n${rawContext}\n---------------------------------------\n`;
  }
}

export const contextBuilder = new ContextBuilder();
