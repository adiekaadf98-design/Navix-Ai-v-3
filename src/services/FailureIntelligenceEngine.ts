export interface FailureReport {
  id: string;
  taskId: string;
  timestamp: number;
  category: 'MODEL_FAILURE' | 'TOOL_FAILURE' | 'DATA_FAILURE' | 'SOURCE_FAILURE' | 'REASONING_FAILURE' | 'ROUTING_FAILURE' | 'MEMORY_FAILURE' | 'NETWORK_FAILURE' | 'SYSTEM_FAILURE';
  rootCause: string;
  failedComponent: string;
  recovered: boolean;
  correctionStrategy?: string;
}

export class FailureIntelligenceEngine {
  private patterns: FailureReport[] = [];
  private readonly maxReports = 250;

  public logFailure(report: Omit<FailureReport, 'id' | 'timestamp'>): FailureReport {
    const fullReport: FailureReport = {
      ...report,
      id: 'fail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };
    this.patterns.unshift(fullReport);
    if (this.patterns.length > this.maxReports) {
      this.patterns.pop();
    }
    return fullReport;
  }

  public getFailurePatterns(component: string): FailureReport[] {
    return this.patterns.filter(p => p.failedComponent === component);
  }

  public analyzeFailureRisk(component: string): { 
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; 
    failureCount: number;
    recentFailureCount: number;
    recommendedMitigation: string;
  } {
    const failures = this.getFailurePatterns(component);
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    const recentFailures = failures.filter(f => f.timestamp > fifteenMinutesAgo);
    
    const count = failures.length;
    const recentCount = recentFailures.length;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let mitigation = 'Component operating within stable failure tolerance limits.';

    if (recentCount >= 3 || count > 10) {
      riskLevel = 'HIGH';
      mitigation = `High failure frequency detected on ${component}. Shift execution to redundant fallback engine and activate circuit breaker.`;
    } else if (recentCount >= 1 || count > 3) {
      riskLevel = 'MEDIUM';
      mitigation = `Transient errors observed on ${component}. Apply rate-limiting backoff and verify input payloads.`;
    }

    return { 
      riskLevel, 
      failureCount: count,
      recentFailureCount: recentCount,
      recommendedMitigation: mitigation
    };
  }

  public getSystemDiagnostics(): {
    totalFailuresLogged: number;
    mostFragileComponents: Array<{ component: string; failures: number }>;
    systemStabilityScore: number; // 0 - 100
  } {
    const counts: Record<string, number> = {};
    for (const p of this.patterns) {
      counts[p.failedComponent] = (counts[p.failedComponent] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .map(([component, failures]) => ({ component, failures }))
      .sort((a, b) => b.failures - a.failures);

    const recentFailures = this.patterns.filter(p => p.timestamp > Date.now() - 30 * 60 * 1000).length;
    const stabilityScore = Math.max(20, Math.min(100, 100 - (recentFailures * 8)));

    return {
      totalFailuresLogged: this.patterns.length,
      mostFragileComponents: sorted.slice(0, 5),
      systemStabilityScore: stabilityScore
    };
  }
}

export const globalFailureIntelligence = new FailureIntelligenceEngine();
