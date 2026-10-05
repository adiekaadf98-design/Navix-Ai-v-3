export interface CompressedMemoryReport {
  originalLength: number;
  compressedLength: number;
  compressionRatio: number;
  keyEntities: string[];
  compressedText: string;
}

export class MemoryCompressor {
  public compress(title: string, content: string): string {
    if (!content) return title;
    if (content.length <= 120) return content;

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) {
      return content.trim();
    }
    
    // Extract key declarative statements
    const keyStatements = sentences.filter(s => {
      const low = s.toLowerCase();
      return low.includes('adalah') || low.includes('menggunakan') || low.includes('preferensi') || 
             low.includes('strategi') || low.includes('aturan') || low.includes('rule') ||
             low.includes('wajib') || low.includes('target') || low.includes('status');
    });

    if (keyStatements.length > 0) {
      return keyStatements.slice(0, 3).join('. ').trim() + '.';
    }

    return sentences.slice(0, 2).join('. ').trim() + '.';
  }

  public consolidateEpisodicMemories(memories: Array<{ title: string; content: string; tags?: string[] }>): CompressedMemoryReport {
    const rawTotal = memories.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    const allTags = new Set<string>();
    const entityMap = new Map<string, string[]>();

    memories.forEach(m => {
      (m.tags || []).forEach(t => allTags.add(t));
      const key = m.title || 'General';
      if (!entityMap.has(key)) entityMap.set(key, []);
      entityMap.get(key)!.push(this.compress(m.title, m.content));
    });

    const consolidatedLines: string[] = [];
    entityMap.forEach((statements, title) => {
      consolidatedLines.push(`[${title}]: ${statements.join(' | ')}`);
    });

    const compressedText = consolidatedLines.join('\n');
    const compTotal = compressedText.length;
    const ratio = rawTotal > 0 ? Number((1 - compTotal / rawTotal).toFixed(2)) : 0;

    return {
      originalLength: rawTotal,
      compressedLength: compTotal,
      compressionRatio: ratio,
      keyEntities: Array.from(allTags),
      compressedText
    };
  }
}

export const memoryCompressor = new MemoryCompressor();

