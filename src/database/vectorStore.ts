import { NavixMemory } from '../types/memory';

export interface VectorSearchResult {
  memory: NavixMemory;
  similarity: number;
}

/**
 * NAVIX pgvector Store Emulator / Engine
 * Generates semantic feature vectors and performs cosine similarity search.
 */
export class VectorStore {
  private embeddings = new Map<string, number[]>();

  /**
   * Simple TF-IDF & Character N-gram feature vectorizer for client-side / runtime vector search.
   */
  public generateEmbedding(text: string): number[] {
    const vectorSize = 128;
    const vector = new Array(vectorSize).fill(0);
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
    const tokens = cleaned.split(/\s+/).filter(Boolean);

    tokens.forEach((token) => {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % vectorSize;
      vector[index] += 1;
    });

    // L2 Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  public storeEmbedding(memoryId: string, embedding: number[]): void {
    this.embeddings.set(memoryId, embedding);
  }

  public getEmbedding(memoryId: string): number[] | undefined {
    return this.embeddings.get(memoryId);
  }

  /**
   * Cosine Similarity calculation
   */
  public calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search vector embeddings across memory items
   */
  public search(
    queryVector: number[],
    memories: NavixMemory[],
    limit: number = 30
  ): VectorSearchResult[] {
    const results: VectorSearchResult[] = [];

    for (const memory of memories) {
      let emb = this.embeddings.get(memory.id);
      if (!emb) {
        emb = this.generateEmbedding(`${memory.title} ${memory.content} ${memory.summary || ''} ${memory.tags.join(' ')}`);
        this.storeEmbedding(memory.id, emb);
      }

      const similarity = this.calculateCosineSimilarity(queryVector, emb);
      results.push({
        memory: {
          ...memory,
          vectorSimilarity: similarity
        },
        similarity
      });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

export const vectorStore = new VectorStore();
