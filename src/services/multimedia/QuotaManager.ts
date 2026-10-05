/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - QUOTA MANAGER
 * Coordinates tier rates, cooldown tracking, and model degradation.
 */

export interface QuotaStatus {
  modelId: string;
  isAvailable: boolean;
  cooldownUntil?: number;
  failureCount: number;
}

export class QuotaManager {
  private static instance: QuotaManager;
  private quotaMap: Map<string, QuotaStatus> = new Map();

  private constructor() {}

  public static getInstance(): QuotaManager {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  public recordSuccess(modelId: string): void {
    const current = this.quotaMap.get(modelId) || {
      modelId,
      isAvailable: true,
      failureCount: 0
    };
    current.isAvailable = true;
    current.failureCount = 0;
    current.cooldownUntil = undefined;
    this.quotaMap.set(modelId, current);
  }

  public recordQuotaExhausted(modelId: string, cooldownDurationMs: number = 60000): void {
    const current = this.quotaMap.get(modelId) || {
      modelId,
      isAvailable: false,
      failureCount: 0
    };
    current.failureCount += 1;
    current.isAvailable = false;
    current.cooldownUntil = Date.now() + cooldownDurationMs;
    this.quotaMap.set(modelId, current);
  }

  public isModelAvailable(modelId: string): boolean {
    const status = this.quotaMap.get(modelId);
    if (!status) return true;
    if (!status.isAvailable && status.cooldownUntil) {
      if (Date.now() > status.cooldownUntil) {
        status.isAvailable = true;
        status.cooldownUntil = undefined;
        return true;
      }
      return false;
    }
    return status.isAvailable;
  }

  public getAvailableFallback(preferredModel: string, candidates: string[]): string {
    if (this.isModelAvailable(preferredModel)) {
      return preferredModel;
    }
    for (const c of candidates) {
      if (this.isModelAvailable(c)) {
        return c;
      }
    }
    return candidates[0] || preferredModel;
  }
}

export const quotaManager = QuotaManager.getInstance();
