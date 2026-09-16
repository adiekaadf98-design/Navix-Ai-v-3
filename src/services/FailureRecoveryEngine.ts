import { TaskType } from './ThinkingEngine';

export interface RecoveryPlan {
  action: 'RETRY' | 'ABORT' | 'ALTERNATIVE_ENGINE';
  reason: string;
  maxRetries: number;
  alternativeEngine?: string;
}

export class FailureRecoveryEngine {
  private retryCounts: Record<string, number> = {};

  public getAlternativeEngine(failedEngine: string, taskType: TaskType): string {
    const fallbacks: Record<string, string> = {
      'TradingViewService': 'CryptoEngine',
      'CryptoEngine': 'ForexFactoryService',
      'ForexFactoryService': 'TradingViewService',
      'CodingEngine': 'DefaultEngine',
      'ImageEngine': 'DefaultEngine',
      'VideoEngine': 'ImageEngine',
      'AudioEngine': 'DefaultEngine',
      'DocumentEngine': 'SearchEngine',
      'DataAnalysisEngine': 'DefaultEngine',
      'SearchEngine': 'DefaultEngine',
      'NavixShield': 'DefaultEngine'
    };

    if (fallbacks[failedEngine]) {
      return fallbacks[failedEngine];
    }

    if (taskType === 'code') return 'CodingEngine';
    if (taskType === 'trading') return 'CryptoEngine';
    if (taskType === 'research') return 'SearchEngine';
    return 'DefaultEngine';
  }

  public analyzeFailure(taskId: string, error: string, taskType: TaskType, failedEngine?: string): RecoveryPlan {
    const retries = this.retryCounts[taskId] || 0;
    
    if (retries >= 3) {
      return {
        action: 'ABORT',
        reason: 'Max retries exceeded.',
        maxRetries: 3
      };
    }

    this.retryCounts[taskId] = retries + 1;

    if (error.includes('timeout') || error.includes('network') || error.includes('ECONNRESET')) {
      return {
        action: 'RETRY',
        reason: 'Transient network failure detected. Retrying with exponential backoff.',
        maxRetries: 3
      };
    }

    if (error.includes('429') || error.includes('RESOURCE_EXHAUSTED')) {
      return {
        action: 'RETRY',
        reason: 'Rate limit / quota pressure. Retrying with backoff.',
        maxRetries: 3
      };
    }

    if (error.includes('engine not found') || error.includes('unsupported') || error.includes('503') || error.includes('502')) {
      const alt = failedEngine ? this.getAlternativeEngine(failedEngine, taskType) : 'DefaultEngine';
      return {
        action: 'ALTERNATIVE_ENGINE',
        reason: `Primary engine failure encountered. Routing to fallback engine [${alt}].`,
        maxRetries: 2,
        alternativeEngine: alt
      };
    }

    return {
      action: 'ABORT',
      reason: `Unrecoverable critical execution error: ${error}`,
      maxRetries: 1
    };
  }

  public resetTask(taskId: string) {
    delete this.retryCounts[taskId];
  }
}

export const globalFailureRecovery = new FailureRecoveryEngine();
