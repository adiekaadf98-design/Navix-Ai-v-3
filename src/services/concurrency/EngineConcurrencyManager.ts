/**
 * NAVIX PRO AI — CONCURRENCY & PERFORMANCE ENGINE (MACHINE 26)
 * 
 * Manages concurrent engine executions, backpressure, queueing, and latency
 * metrics to protect system stability during complex, multi-agent pipelines.
 */

import { IEngine, EngineResult } from '../../types/engine';

export interface ConcurrencyLimitConfig {
  maxConcurrent: number;
  currentActive: number;
  queueDepth: number;
}

export class EngineConcurrencyManager implements IEngine {
  public name = 'EngineConcurrencyManager';
  public description = 'Regulates concurrent engine operations, enforces category throughput limits, and monitors execution latency.';
  public category: 'general' = 'general';
  public capabilities = ['concurrency', 'performance', 'queue_management', 'backpressure'];

  private limits: Map<string, ConcurrencyLimitConfig> = new Map([
    ['media', { maxConcurrent: 2, currentActive: 0, queueDepth: 0 }],
    ['network', { maxConcurrent: 4, currentActive: 0, queueDepth: 0 }],
    ['coding', { maxConcurrent: 4, currentActive: 0, queueDepth: 0 }],
    ['math', { maxConcurrent: 16, currentActive: 0, queueDepth: 0 }],
    ['trading', { maxConcurrent: 2, currentActive: 0, queueDepth: 0 }],
    ['general', { maxConcurrent: 8, currentActive: 0, queueDepth: 0 }]
  ]);

  private latencyHistory: Map<string, number[]> = new Map();

  /**
   * Acquires an execution slot for the specified category.
   * If slot is occupied beyond limit, tracks backpressure.
   */
  public async acquireSlot(category: string): Promise<() => void> {
    const key = this.limits.has(category) ? category : 'general';
    const config = this.limits.get(key)!;

    if (config.currentActive >= config.maxConcurrent) {
      config.queueDepth++;
      // Wait for availability (max 5000ms before soft dispatch)
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (config.currentActive < config.maxConcurrent) {
            clearInterval(interval);
            config.queueDepth = Math.max(0, config.queueDepth - 1);
            resolve();
          }
        }, 20);
        setTimeout(() => {
          clearInterval(interval);
          config.queueDepth = Math.max(0, config.queueDepth - 1);
          resolve();
        }, 5000);
      });
    }

    config.currentActive++;

    let released = false;
    return () => {
      if (!released) {
        released = true;
        config.currentActive = Math.max(0, config.currentActive - 1);
      }
    };
  }

  /**
   * Records execution latency for performance telemetry.
   */
  public recordLatency(engineName: string, durationMs: number): void {
    const list = this.latencyHistory.get(engineName) || [];
    list.push(durationMs);
    if (list.length > 50) list.shift();
    this.latencyHistory.set(engineName, list);
  }

  /**
   * Returns average latency for an engine.
   */
  public getAverageLatency(engineName: string): number {
    const list = this.latencyHistory.get(engineName);
    if (!list || list.length === 0) return 25;
    return Math.round(list.reduce((a, b) => a + b, 0) / list.length);
  }

  /**
   * Returns current health and backpressure metrics across categories.
   */
  public getMetrics(): Record<string, ConcurrencyLimitConfig & { avgLatencyMs: number }> {
    const res: Record<string, any> = {};
    for (const [cat, cfg] of this.limits.entries()) {
      res[cat] = {
        ...cfg,
        avgLatencyMs: this.getAverageLatency(cat)
      };
    }
    return res;
  }

  public async execute(input: any, _signal?: AbortSignal): Promise<EngineResult> {
    const action = input?.action || 'get_metrics';

    if (action === 'record') {
      this.recordLatency(input.engineName || 'general', Number(input.durationMs) || 10);
      return {
        status: 'SUCCESS',
        source: 'EngineConcurrencyManager',
        data: { recorded: true }
      };
    }

    const metrics = this.getMetrics();
    return {
      status: 'SUCCESS',
      source: 'EngineConcurrencyManager',
      data: metrics,
      realOutput: metrics,
      output: `Concurrency manager active. Total tracked categories: ${this.limits.size}`
    };
  }
}

export const globalConcurrencyManager = new EngineConcurrencyManager();
