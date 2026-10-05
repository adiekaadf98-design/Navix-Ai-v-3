import { TaskType } from './ThinkingEngine';
import { globalFailureIntelligence } from './FailureIntelligenceEngine';

export interface RecoveryPlan {
  action: 'RETRY' | 'ABORT' | 'ALTERNATIVE_ENGINE';
  reason: string;
  maxRetries: number;
  alternativeEngine?: string;
}

export class FailureRecoveryEngine {
  private retryCounts: Record<string, number> = {};

  public getAlternativeEngine(failedEngine: string, taskType: TaskType): string {
    // HARD RULE: MathEngine must NEVER fallback to LLM or approximation
    if (taskType === 'math' || failedEngine === 'MathEngine') {
      return 'ENGINE_UNAVAILABLE';
    }

    const fallbacks: Record<string, string> = {
      'SignalEngine': 'RetailTraderGitHubEngine',
      'RetailTraderGitHubEngine': 'TradingViewService',
      'TradingViewService': 'CryptoEngine',
      'CryptoEngine': 'StockEngine',
      'StockEngine': 'SignalEngine',
      'ForexFactoryService': 'TradingViewService',
      'CodingEngine': 'OpenHandsEngine',
      'OpenHandsEngine': 'GitHubOpenSourceEngine',
      'GitHubOpenSourceEngine': 'CodingEngine',
      'ImageEngine': 'LocalDreamImageEngine',
      'LocalDreamImageEngine': 'PhotorealismEngine',
      'PhotorealismEngine': 'ImageEngine',
      'VideoEngine': 'NmfInferenceEngine',
      'AudioEngine': 'FasterWhisperEngine',
      'FasterWhisperEngine': 'AudioEngine',
      'DocumentEngine': 'DoclingEngine',
      'DoclingEngine': 'DocumentEngine',
      'DataAnalysisEngine': 'DuckDbAnalyticsEngine',
      'DuckDbAnalyticsEngine': 'DataAnalysisEngine',
      'SearchEngine': 'Crawl4AiEngine',
      'Crawl4AiEngine': 'SearchEngine',
      'NavixShield': 'SecurityShield'
    };

    if (fallbacks[failedEngine]) {
      return fallbacks[failedEngine];
    }

    if (taskType === 'code') return 'CodingEngine';
    if (taskType === 'trading') return 'SignalEngine';
    if (taskType === 'research') return 'SearchEngine';
    if (taskType === 'document') return 'DocumentEngine';
    if (taskType === 'data_analysis') return 'DataAnalysisEngine';
    if (taskType === 'image') return 'ImageEngine';
    if (taskType === 'audio') return 'AudioEngine';
    return 'DefaultEngine';
  }

  public analyzeFailure(taskId: string, error: string, taskType: TaskType, failedEngine?: string): RecoveryPlan {
    // HARD RULE: Zero simulation & zero LLM fallback for numerical / math calculations
    if (taskType === 'math' || failedEngine === 'MathEngine') {
      const plan: RecoveryPlan = {
        action: 'ABORT',
        reason: `ENGINE_UNAVAILABLE: Navix Math Engine deterministik presisi tinggi mengalami kendala: ${error}. Dilarang keras melakukan kalkulasi aproksimasi numerik via model LLM.`,
        maxRetries: 0
      };
      try {
        globalFailureIntelligence.logFailure({
          taskId,
          category: 'TOOL_FAILURE',
          rootCause: error,
          failedComponent: 'MathEngine',
          recovered: false,
          correctionStrategy: 'STOP_NUMERIC_RESPONSE'
        });
      } catch (e) {}
      return plan;
    }

    // HARD RULE: Zero simulation & zero fallback to fake price on trading provider failure
    if (taskType === 'trading' && (error.includes('MARKET_DATA_UNAVAILABLE') || error.includes('PROVIDER_NON_JSON') || error.includes('bursa'))) {
      const plan: RecoveryPlan = {
        action: 'ABORT',
        reason: `MARKET_DATA_UNAVAILABLE: Feed bursa tidak dapat diakses atau mengembalikan format non-JSON. Dilarang keras merekayasa harga pasar palsu.`,
        maxRetries: 0
      };
      try {
        globalFailureIntelligence.logFailure({
          taskId,
          category: 'TOOL_FAILURE',
          rootCause: error,
          failedComponent: 'SignalEngine',
          recovered: false,
          correctionStrategy: 'FAIL_CLOSED_HONEST_STATE'
        });
      } catch (e) {}
      return plan;
    }

    const retries = this.retryCounts[taskId] || 0;
    
    if (retries >= 3) {
      const plan: RecoveryPlan = {
        action: 'ABORT',
        reason: 'Max retries exceeded.',
        maxRetries: 3
      };
      try {
        globalFailureIntelligence.logFailure({
          taskId,
          category: 'SYSTEM_FAILURE',
          rootCause: error,
          failedComponent: failedEngine || 'SystemCore',
          recovered: false,
          correctionStrategy: 'CIRCUIT_BREAKER_ABORT'
        });
      } catch (e) {}
      return plan;
    }

    this.retryCounts[taskId] = retries + 1;

    if (error.includes('timeout') || error.includes('network') || error.includes('ECONNRESET')) {
      const plan: RecoveryPlan = {
        action: 'RETRY',
        reason: 'Transient network failure detected. Retrying with exponential backoff.',
        maxRetries: 3
      };
      try {
        globalFailureIntelligence.logFailure({
          taskId,
          category: 'NETWORK_FAILURE',
          rootCause: error,
          failedComponent: failedEngine || 'NetworkFeed',
          recovered: true,
          correctionStrategy: 'EXPONENTIAL_BACKOFF_RETRY'
        });
      } catch (e) {}
      return plan;
    }

    if (error.includes('429') || error.includes('RESOURCE_EXHAUSTED')) {
      const plan: RecoveryPlan = {
        action: 'RETRY',
        reason: 'Rate limit / quota pressure. Retrying with backoff.',
        maxRetries: 3
      };
      try {
        globalFailureIntelligence.logFailure({
          taskId,
          category: 'SYSTEM_FAILURE',
          rootCause: error,
          failedComponent: failedEngine || 'RateLimiter',
          recovered: true,
          correctionStrategy: 'RATE_LIMIT_BACKOFF'
        });
      } catch (e) {}
      return plan;
    }

    if (error.includes('engine not found') || error.includes('unsupported') || error.includes('503') || error.includes('502') || error.toLowerCase().includes('verification') || error.toLowerCase().includes('failed') || error.toLowerCase().includes('gagal')) {
      const alt = failedEngine ? this.getAlternativeEngine(failedEngine, taskType) : this.getAlternativeEngine('', taskType);
      if (alt && alt !== 'ENGINE_UNAVAILABLE' && alt !== 'DefaultEngine' && alt !== failedEngine) {
        const plan: RecoveryPlan = {
          action: 'ALTERNATIVE_ENGINE',
          reason: `Kendala terdeteksi pada mesin [${failedEngine || 'Primary'}]. Mengalihkan tugas ke mesin alternatif terverifikasi [${alt}].`,
          maxRetries: 2,
          alternativeEngine: alt
        };
        try {
          globalFailureIntelligence.logFailure({
            taskId,
            category: 'TOOL_FAILURE',
            rootCause: error,
            failedComponent: failedEngine || 'PrimaryEngine',
            recovered: true,
            correctionStrategy: `ALTERNATIVE_ENGINE_${alt}`
          });
        } catch (e) {}
        return plan;
      }
    }

    const defaultPlan: RecoveryPlan = {
      action: 'ABORT',
      reason: `Unrecoverable critical execution error: ${error}`,
      maxRetries: 1
    };
    try {
      globalFailureIntelligence.logFailure({
        taskId,
        category: 'SYSTEM_FAILURE',
        rootCause: error,
        failedComponent: failedEngine || 'Unknown',
        recovered: false,
        correctionStrategy: 'ABORT_WITH_LOG'
      });
    } catch (e) {}
    return defaultPlan;
  }

  public resetTask(taskId: string) {
    delete this.retryCounts[taskId];
  }
}

export const globalFailureRecovery = new FailureRecoveryEngine();
