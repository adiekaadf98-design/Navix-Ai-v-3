export interface BenchmarkRecord {
  id: string;
  taskType: string;
  component: string; // Model name, engine name, or tool name
  version: string;
  successRate: number;
  failureRate: number;
  averageLatencyMs: number;
  testCount: number;
  lastTestedAt: number;
}

export class CapabilityBenchmarkEngine {
  private benchmarks: Record<string, BenchmarkRecord> = {};

  constructor() {
    this.seedBaselines();
  }

  private seedBaselines() {
    const baselines: Array<{ comp: string; task: string; success: number; latency: number }> = [
      { comp: 'CodingEngine', task: 'code', success: 0.98, latency: 120 },
      { comp: 'NavixShield', task: 'security', success: 0.99, latency: 45 },
      { comp: 'ImageEngine', task: 'image', success: 0.97, latency: 350 },
      { comp: 'VideoEngine', task: 'video', success: 0.94, latency: 650 },
      { comp: 'AudioEngine', task: 'audio', success: 0.96, latency: 220 },
      { comp: 'DocumentEngine', task: 'document', success: 0.98, latency: 90 },
      { comp: 'DocumentEngine', task: 'file_analysis', success: 0.97, latency: 110 },
      { comp: 'DataAnalysisEngine', task: 'data_analysis', success: 0.99, latency: 85 },
      { comp: 'SearchEngine', task: 'research', success: 0.96, latency: 180 },
      { comp: 'TradingViewService', task: 'trading', success: 0.97, latency: 140 },
      { comp: 'CryptoEngine', task: 'trading', success: 0.98, latency: 110 },
      { comp: 'SignalEngine', task: 'trading', success: 0.99, latency: 30 },
      { comp: 'DefaultEngine', task: 'chat', success: 0.99, latency: 40 }
    ];

    for (const b of baselines) {
      const key = `${b.comp}_${b.task}`;
      this.benchmarks[key] = {
        id: `bench_seed_${b.comp}_${b.task}`,
        taskType: b.task,
        component: b.comp,
        version: '1.0',
        successRate: b.success,
        failureRate: 1 - b.success,
        averageLatencyMs: b.latency,
        testCount: 25,
        lastTestedAt: Date.now()
      };
    }
  }

  public recordExecution(component: string, taskType: string, success: boolean, latencyMs: number) {
    const key = `${component}_${taskType}`;
    if (!this.benchmarks[key]) {
      this.benchmarks[key] = {
        id: 'bench_' + Date.now(),
        taskType,
        component,
        version: '1.0',
        successRate: success ? 1 : 0,
        failureRate: success ? 0 : 1,
        averageLatencyMs: latencyMs,
        testCount: 1,
        lastTestedAt: Date.now()
      };
    } else {
      const b = this.benchmarks[key];
      b.testCount++;
      const currentSuccesses = (b.successRate * (b.testCount - 1)) + (success ? 1 : 0);
      b.successRate = currentSuccesses / b.testCount;
      b.failureRate = 1 - b.successRate;
      b.averageLatencyMs = ((b.averageLatencyMs * (b.testCount - 1)) + latencyMs) / b.testCount;
      b.lastTestedAt = Date.now();
    }
  }

  public getBestComponentForTask(taskType: string, availableComponents: string[]): string | null {
    let best: string | null = null;
    let highestSuccess = -1;

    for (const comp of availableComponents) {
      const key = `${comp}_${taskType}`;
      const record = this.benchmarks[key];
      if (record && record.successRate > highestSuccess) {
        highestSuccess = record.successRate;
        best = comp;
      }
    }

    return best || (availableComponents.length > 0 ? availableComponents[0] : null);
  }

  public getAllBenchmarks(): Record<string, BenchmarkRecord> {
    return { ...this.benchmarks };
  }
}

export const globalCapabilityBenchmark = new CapabilityBenchmarkEngine();
