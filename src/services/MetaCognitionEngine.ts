import { KnowledgeClaim } from './KnowledgeLab';

export class MetaCognitionEngine {
  public evaluateKnowledgeState(claim: KnowledgeClaim): 'KNOWN' | 'SUPPORTED' | 'PROBABLE' | 'UNCERTAIN' | 'CONFLICTED' | 'UNKNOWN' {
    if (!claim) return 'UNKNOWN';
    if (claim.status === 'TRUSTED') return 'KNOWN';
    if (claim.status === 'SUPPORTED') return 'SUPPORTED';
    if (claim.status === 'PARTIALLY_SUPPORTED') return 'PROBABLE';
    if (claim.status === 'CONFLICTED') return 'CONFLICTED';
    if (claim.status === 'UNCERTAIN') return 'UNCERTAIN';
    return 'UNKNOWN';
  }

  public identifyGaps(taskGoal: string, availableKnowledge: KnowledgeClaim[]): string[] {
    const gaps: string[] = [];

    if (!availableKnowledge || availableKnowledge.length === 0) {
      gaps.push('Zero active knowledge claims available. Full contextual discovery or tool execution required.');
      return gaps;
    }
    
    // Check if we have high confidence knowledge
    const hasHighConfidence = availableKnowledge.some(k => k.confidence === 'HIGH');
    if (!hasHighConfidence) {
       gaps.push('Lacking HIGH confidence evidence for the given task goal.');
    }
    
    // Check for contradictions that haven't been resolved
    const hasUnresolvedConflicts = availableKnowledge.some(k => k.status === 'CONFLICTED' || k.status === 'UNCERTAIN');
    if (hasUnresolvedConflicts) {
       gaps.push('Existing knowledge has unresolved contradictions or uncertainties.');
    }
    
    // Check recency (older than 30 days requires re-verification)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const hasOutdated = availableKnowledge.some(k => k.verifiedAt && k.verifiedAt < thirtyDaysAgo);
    if (hasOutdated) {
       gaps.push('Some supporting knowledge might be outdated and requires re-verification.');
    }

    // Concept coverage check against taskGoal keywords
    const goalTokens = taskGoal
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3 && !['untuk', 'dengan', 'pada', 'yang', 'dan', 'dari', 'this', 'that', 'with', 'from'].includes(w));

    const allKnowledgeText = availableKnowledge
      .map(k => `${k.text} ${(k.relatedConcepts || []).join(' ')}`)
      .join(' ')
      .toLowerCase();

    const missingTokens = goalTokens.filter(token => !allKnowledgeText.includes(token));
    if (missingTokens.length > 0) {
      const sampleMissing = missingTokens.slice(0, 4).join(', ');
      gaps.push(`Uncovered conceptual domains in active goal: [${sampleMissing}].`);
    }

    return gaps;
  }

  public assessReadiness(taskGoal: string, availableKnowledge: KnowledgeClaim[]): {
    readinessScore: number; // 0 - 100
    isReadyToExecute: boolean;
    recommendedAction: string;
  } {
    const gaps = this.identifyGaps(taskGoal, availableKnowledge);
    const gapPenalty = gaps.length * 20;
    const readinessScore = Math.max(10, Math.min(100, 100 - gapPenalty));

    let recommendedAction = 'Proceed with execution using current verified knowledge base.';
    if (readinessScore < 50) {
      recommendedAction = 'Trigger dynamic web research or specialized engine scan before commitment.';
    } else if (readinessScore < 80) {
      recommendedAction = 'Execute with verification checkpoints and defensive fallback.';
    }

    return {
      readinessScore,
      isReadyToExecute: readinessScore >= 60,
      recommendedAction
    };
  }
}

export const globalMetaCognition = new MetaCognitionEngine();
