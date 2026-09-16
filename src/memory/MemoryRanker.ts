import { MemoryScore, NavixMemory } from '../types/memory';

export function calculateMemoryScore(score: MemoryScore): number {
  return (
    score.relevance * 0.45 +
    score.importance * 0.25 +
    score.recency * 0.15 +
    score.confidence * 0.10 +
    score.usage * 0.05
  );
}

export function getRecencyScore(updatedAt: Date): number {
  const now = new Date().getTime();
  const memoryTime = new Date(updatedAt).getTime();
  const diffHours = (now - memoryTime) / (1000 * 60 * 60);

  if (diffHours <= 1) return 100;
  if (diffHours <= 24) return 90;
  if (diffHours <= 168) return 70; // 1 week
  if (diffHours <= 720) return 50; // 1 month
  return 30;
}

export function getUsageScore(accessCount: number): number {
  if (accessCount >= 20) return 100;
  if (accessCount >= 10) return 80;
  if (accessCount >= 5) return 60;
  if (accessCount >= 1) return 40;
  return 20;
}

export class MemoryRanker {
  public rank(memories: NavixMemory[], query: string): Array<{ memory: NavixMemory; score: number }> {
    return memories
      .map(memory => {
        const relevance = Math.min(100, Math.round((memory.vectorSimilarity || 0.5) * 100));
        const importance = memory.importance;
        const recency = getRecencyScore(memory.updatedAt);
        const confidence = memory.confidence;
        const usage = getUsageScore(memory.accessCount);

        const finalScore = calculateMemoryScore({
          relevance,
          importance,
          recency,
          confidence,
          usage
        });

        return {
          memory,
          score: Math.round(finalScore * 10) / 10
        };
      })
      .filter(item => item.score >= 50)
      .sort((a, b) => b.score - a.score);
  }
}

export const memoryRanker = new MemoryRanker();
