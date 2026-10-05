/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - RUNTIME TRACKER
 * Truthful runtime telemetry and verification evidence tracker.
 */

import { ModelStatus } from './ModelRegistry';

export interface RuntimeExecutionRecord {
  id: string;
  timestamp: string;
  capabilityId: string;
  model: string;
  latencyMs: number;
  success: boolean;
  status: ModelStatus;
  evidence: string;
  error?: string;
}

export class RuntimeTracker {
  private static instance: RuntimeTracker;
  private records: RuntimeExecutionRecord[] = [];
  private readonly maxRecords = 200;

  private constructor() {}

  public static getInstance(): RuntimeTracker {
    if (!RuntimeTracker.instance) {
      RuntimeTracker.instance = new RuntimeTracker();
    }
    return RuntimeTracker.instance;
  }

  public recordExecution(entry: Omit<RuntimeExecutionRecord, 'id' | 'timestamp'>): RuntimeExecutionRecord {
    const record: RuntimeExecutionRecord = {
      ...entry,
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    this.records.unshift(record);
    if (this.records.length > this.maxRecords) {
      this.records.pop();
    }
    return record;
  }

  public getRecentRecords(limit: number = 20): RuntimeExecutionRecord[] {
    return this.records.slice(0, limit);
  }

  public getRecordsByCapability(capabilityId: string): RuntimeExecutionRecord[] {
    return this.records.filter(r => r.capabilityId === capabilityId);
  }

  public getMetricsSummary() {
    const total = this.records.length;
    const successes = this.records.filter(r => r.success).length;
    const avgLatency = total > 0 ? Math.round(this.records.reduce((acc, r) => acc + r.latencyMs, 0) / total) : 0;

    return {
      totalExecutions: total,
      successRate: total > 0 ? (successes / total) * 100 : 100,
      avgLatencyMs: avgLatency,
      lastStatus: this.records[0]?.status || 'UNKNOWN'
    };
  }
}

export const runtimeTracker = RuntimeTracker.getInstance();
