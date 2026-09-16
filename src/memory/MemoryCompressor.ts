export class MemoryCompressor {
  public compress(title: string, content: string): string {
    if (!content) return title;
    if (content.length <= 120) return content;

    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      return sentences[0].trim() + '.';
    }
    return content.slice(0, 120) + '...';
  }
}

export const memoryCompressor = new MemoryCompressor();
