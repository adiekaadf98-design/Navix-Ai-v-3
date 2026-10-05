import { NavixMemory } from '../types/memory';
import { memoryCompressor } from './MemoryCompressor';
import { IEngine, EngineResult } from '../types/engine';

export class ContextBuilder implements IEngine {
  public name = 'ContextBuilderEngine';
  public description = 'Engine for scoped context engineering, relevance filtering, token compression, and preservation of critical facts.';
  public category: 'general' = 'general';
  public capabilities = ['context', 'context_builder', 'context_engineering', 'relevance_filtering'];

  build(memories: NavixMemory[], maxChars: number = 2500): string {
    if (!memories || memories.length === 0) return '';

    // Sort by importance / recency if available
    const sorted = [...memories].sort((a, b) => (b.importance || 50) - (a.importance || 50));

    let accumulatedLength = 0;
    const formattedBlocks: string[] = [];

    for (const memory of sorted) {
      let text = memory.summary ?? memory.content;
      if (accumulatedLength + text.length > maxChars) {
        text = memoryCompressor.compress(memory.title || memory.type, text);
      }

      if (accumulatedLength + text.length <= maxChars) {
        formattedBlocks.push(`[${memory.type} | ${memory.title || 'Memory'}]\n${text}`);
        accumulatedLength += text.length + 10;
      }
    }

    return formattedBlocks.join('\n\n');
  }

  buildPromptContext(memories: NavixMemory[], maxChars: number = 2500): string {
    const rawContext = this.build(memories, maxChars);
    if (!rawContext) return '';

    return `\n--- [NAVIX COGNITIVE MEMORY CONTEXT] ---\n${rawContext}\n---------------------------------------\n`;
  }

  /**
   * Scopes context specifically to the target machine domain,
   * preventing irrelevant data from polluting specialist engine prompts.
   */
  buildMachineScopedContext(
    targetMachine: string,
    requiredCapability: string,
    memories: NavixMemory[],
    criticalFacts: string[] = []
  ): { scopedContext: string; factCount: number; matchedMemories: number } {
    const target = targetMachine.toLowerCase();
    const cap = requiredCapability.toLowerCase();

    // Filter memories strictly relevant to target machine domain
    const filteredMemories = memories.filter(m => {
      const type = (m.type || '').toLowerCase();
      const content = (m.content || '').toLowerCase();
      const title = (m.title || '').toLowerCase();

      if (target.includes('trade') || target.includes('signal') || cap.includes('market')) {
        return type.includes('trading') || content.includes('sl') || content.includes('tp') || content.includes('lot');
      }
      if (target.includes('code') || cap.includes('code') || cap.includes('repo')) {
        return type.includes('code') || content.includes('function') || content.includes('import') || content.includes('typescript');
      }
      if (target.includes('image') || target.includes('video') || cap.includes('visual')) {
        return type.includes('visual') || type.includes('media') || content.includes('aspect') || content.includes('style');
      }
      return true;
    });

    const memoryText = this.build(filteredMemories, 1500);
    const factsText = criticalFacts.length > 0 ? `\nCRITICAL FACTS:\n- ${criticalFacts.join('\n- ')}` : '';

    const scopedContext = `${memoryText}${factsText}`.trim();
    return {
      scopedContext,
      factCount: criticalFacts.length,
      matchedMemories: filteredMemories.length
    };
  }

  /**
   * Preserves critical empirical constraints (e.g. Risk, Symbols, Stop Loss) across pipeline handoffs.
   */
  preserveCriticalFacts(rawText: string): string[] {
    const facts: string[] = [];
    const symbolMatch = rawText.match(/\b([A-Z]{3,6}(?:USDT|USD|\.JK))\b/i);
    if (symbolMatch) facts.push(`Target Symbol: ${symbolMatch[1].toUpperCase()}`);

    const numberMatch = rawText.match(/\b(\d+(?:\.\d+)?)\s*(%|USD|\$|lot|RR)\b/i);
    if (numberMatch) facts.push(`Numeric Constraint: ${numberMatch[0]}`);

    return facts;
  }

  public async execute(input: any, _signal?: AbortSignal): Promise<EngineResult> {
    const rawMemories: NavixMemory[] = input?.memories || [];
    const targetMachine = input?.targetMachine || input?.engineName || 'general';
    const capability = input?.capability || 'general';
    const criticalFacts = input?.criticalFacts || this.preserveCriticalFacts(input?.text || input?.query || '');

    const result = this.buildMachineScopedContext(targetMachine, capability, rawMemories, criticalFacts);

    return {
      status: 'SUCCESS',
      source: 'ContextBuilderEngine',
      data: result,
      realOutput: result,
      output: result.scopedContext || 'Scoped context generated successfully.'
    };
  }
}

export const contextBuilder = new ContextBuilder();
export const globalContextBuilderEngine = contextBuilder;
