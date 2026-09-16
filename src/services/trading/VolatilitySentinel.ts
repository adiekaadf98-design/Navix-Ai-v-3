/**
 * NAVIX AI — VOLATILITY SENTINEL & BLACK SWAN SAFEGUARD ENGINE
 * 
 * Real-time market liquidity anomaly detection, flash crash circuit breaker,
 * high-spread spike protection, and dynamic risk-reward adjustment matrix.
 */

export interface MarketAnomalyAlert {
  id: string;
  symbol: string;
  timestamp: string;
  anomalyType: 'BLACK_SWAN_EVENT' | 'LIQUIDITY_COLLAPSE' | 'VOLATILITY_SURGE' | 'SPREAD_BLOWOUT' | 'UNUSUAL_ORDER_FLOW';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metricValue: number;
  baselineValue: number;
  deviationPercent: number;
  circuitBreakerActive: boolean;
  recommendation: 'STAND_DOWN_RISK_OFF' | 'TIGHTEN_STOP_LOSS' | 'REDUCE_LEVERAGE' | 'NORMAL_OPERATION';
  message: string;
}

export interface VolatilityMetrics {
  atrPercent: number;
  spreadBps: number;
  liquidityScore: number; // 0 - 100
  volatilityZScore: number;
  isBlackSwanRisk: boolean;
}

export interface CircuitBreakerState {
  active: boolean;
  trippedAt: number;
  durationMs: number;
  reason: string;
}

export class VolatilitySentinelEngine {
  private alertsHistory: MarketAnomalyAlert[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();

  /**
   * Evaluates real-time price, volume, and volatility telemetry for black swan events.
   */
  public evaluateMarketRisk(
    symbol: string,
    prices: number[],
    volumes: number[],
    currentSpread: number = 0.0002
  ): {
    metrics: VolatilityMetrics;
    alert: MarketAnomalyAlert | null;
    recommendedRiskMultiplier: number; // 0.0 to 1.0 (multiplier for position sizing)
    recommendedStopDistancePct: number; // Suggested adaptive stop loss buffer
  } {
    // Check if circuit breaker is already active and still in cooldown
    const existingBreaker = this.circuitBreakers.get(symbol);
    if (existingBreaker && existingBreaker.active) {
      if (Date.now() - existingBreaker.trippedAt < existingBreaker.durationMs) {
        // Still cooling down
        return {
          metrics: {
            atrPercent: 1.5,
            spreadBps: Number((currentSpread * 10000).toFixed(1)),
            liquidityScore: 30,
            volatilityZScore: 3.5,
            isBlackSwanRisk: true
          },
          alert: {
            id: `cb_active_${Date.now()}`,
            symbol,
            timestamp: new Date().toISOString(),
            anomalyType: 'BLACK_SWAN_EVENT',
            severity: 'CRITICAL',
            metricValue: 0,
            baselineValue: 0,
            deviationPercent: 0,
            circuitBreakerActive: true,
            recommendation: 'STAND_DOWN_RISK_OFF',
            message: `🔒 CIRCUIT BREAKER ACTIVE: ${symbol} is locked in defensive cooldown until ${new Date(existingBreaker.trippedAt + existingBreaker.durationMs).toLocaleTimeString()}. Reason: ${existingBreaker.reason}`
          },
          recommendedRiskMultiplier: 0.0,
          recommendedStopDistancePct: 3.5
        };
      } else {
        // Cooldown period expired, auto-reset circuit breaker
        this.circuitBreakers.delete(symbol);
      }
    }

    if (!prices || prices.length < 5) {
      return {
        metrics: {
          atrPercent: 0.5,
          spreadBps: 2,
          liquidityScore: 85,
          volatilityZScore: 0.2,
          isBlackSwanRisk: false
        },
        alert: null,
        recommendedRiskMultiplier: 1.0,
        recommendedStopDistancePct: 1.0
      };
    }

    const currentPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];
    const instantPctChange = Math.abs((currentPrice - prevPrice) / prevPrice) * 100;

    // Calculate rolling volatility (standard deviation of returns)
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.abs((prices[i] - prices[i - 1]) / prices[i - 1]) * 100);
    }
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance) || 0.1;
    const zScore = (instantPctChange - meanReturn) / stdDev;

    // Volume surge detection
    const currentVol = volumes && volumes.length > 0 ? volumes[volumes.length - 1] : 1000;
    const avgVol = volumes && volumes.length > 1 
      ? volumes.slice(0, -1).reduce((a, b) => a + b, 0) / (volumes.length - 1)
      : currentVol;
    const volumeRatio = currentVol / (avgVol || 1);

    // Compute Liquidity Score (0 - 100)
    let liquidityScore = 90;
    if (volumeRatio < 0.2) liquidityScore -= 40; // Liquidity dry-up
    if (currentSpread > 0.001) liquidityScore -= 30; // High spread penalty
    if (zScore > 3.0) liquidityScore -= 20;
    liquidityScore = Math.max(5, Math.min(100, liquidityScore));

    const isBlackSwanRisk = zScore > 4.5 || (instantPctChange > 5.0 && volumeRatio > 5.0) || liquidityScore < 20;

    let alert: MarketAnomalyAlert | null = null;
    let riskMultiplier = 1.0;

    // Dynamic stop distance scales with ATR and Z-Score
    let recommendedStopDistancePct = Math.max(0.8, Number((meanReturn * 1.8 * Math.max(1.0, zScore / 2)).toFixed(2)));

    if (isBlackSwanRisk || zScore > 3.0) {
      const isCritical = zScore > 4.5 || instantPctChange > 6.0;
      const anomalyType = isCritical ? 'BLACK_SWAN_EVENT' : (liquidityScore < 25 ? 'LIQUIDITY_COLLAPSE' : 'VOLATILITY_SURGE');

      alert = {
        id: `alert_${Date.now()}`,
        symbol,
        timestamp: new Date().toISOString(),
        anomalyType,
        severity: isCritical ? 'CRITICAL' : 'HIGH',
        metricValue: instantPctChange,
        baselineValue: meanReturn,
        deviationPercent: Number((zScore * 100).toFixed(1)),
        circuitBreakerActive: isCritical,
        recommendation: isCritical ? 'STAND_DOWN_RISK_OFF' : 'TIGHTEN_STOP_LOSS',
        message: isCritical
          ? `🚨 CRITICAL BLACK SWAN ANOMALY: Abnormal price shift (${instantPctChange.toFixed(2)}%) on ${symbol} with Z-Score of ${zScore.toFixed(2)}. Circuit breaker activated to prevent drawdown.`
          : `⚠️ HIGH VOLATILITY ALERT: Elevated price turbulence on ${symbol}. Volatility Z-Score: ${zScore.toFixed(2)}.`
      };

      this.alertsHistory.unshift(alert);
      if (this.alertsHistory.length > 50) this.alertsHistory.pop();
      
      if (isCritical) {
        // 15-minute cool down breaker
        this.circuitBreakers.set(symbol, {
          active: true,
          trippedAt: Date.now(),
          durationMs: 15 * 60 * 1000,
          reason: `Instant price move ${instantPctChange.toFixed(2)}% with Z-Score ${zScore.toFixed(2)}`
        });
        riskMultiplier = 0.0; // Complete stop
        recommendedStopDistancePct *= 2.0;
      } else {
        riskMultiplier = 0.35; // Reduce sizing by 65%
        recommendedStopDistancePct *= 1.5;
      }
    } else if (zScore > 1.8) {
      riskMultiplier = 0.65; // Moderate risk reduction
      recommendedStopDistancePct *= 1.25;
    }

    return {
      metrics: {
        atrPercent: Number(meanReturn.toFixed(2)),
        spreadBps: Number((currentSpread * 10000).toFixed(1)),
        liquidityScore,
        volatilityZScore: Number(zScore.toFixed(2)),
        isBlackSwanRisk
      },
      alert,
      recommendedRiskMultiplier: Number(riskMultiplier.toFixed(2)),
      recommendedStopDistancePct: Number(recommendedStopDistancePct.toFixed(2))
    };
  }

  public isCircuitBreakerActive(symbol: string): boolean {
    const breaker = this.circuitBreakers.get(symbol);
    if (!breaker || !breaker.active) return false;
    if (Date.now() - breaker.trippedAt > breaker.durationMs) {
      this.circuitBreakers.delete(symbol);
      return false;
    }
    return true;
  }

  public resetCircuitBreaker(symbol: string): void {
    this.circuitBreakers.delete(symbol);
  }

  public getCircuitBreakerDetails(symbol: string): CircuitBreakerState | null {
    const breaker = this.circuitBreakers.get(symbol);
    if (!breaker) return null;
    if (Date.now() - breaker.trippedAt > breaker.durationMs) {
      this.circuitBreakers.delete(symbol);
      return null;
    }
    return breaker;
  }

  /**
   * Assesses cross-market contagion risk from active high-severity alerts.
   */
  public evaluateContagionRisk(): {
    contagionLevel: 'NONE' | 'MODERATE' | 'SEVERE';
    activeBreakersCount: number;
    globalRiskScaling: number; // 0.2 to 1.0
    summaryMessage: string;
  } {
    let activeBreakers = 0;
    const now = Date.now();
    for (const [_, state] of this.circuitBreakers.entries()) {
      if (state.active && (now - state.trippedAt < state.durationMs)) {
        activeBreakers++;
      }
    }

    if (activeBreakers >= 3) {
      return {
        contagionLevel: 'SEVERE',
        activeBreakersCount: activeBreakers,
        globalRiskScaling: 0.25,
        summaryMessage: 'Systemic contagion warning: 3+ major assets currently tripped circuit breakers. Global risk scaling reduced to 25%.'
      };
    } else if (activeBreakers >= 1) {
      return {
        contagionLevel: 'MODERATE',
        activeBreakersCount: activeBreakers,
        globalRiskScaling: 0.65,
        summaryMessage: 'Correlated market turbulence detected. Protective exposure scaling active at 65%.'
      };
    }

    return {
      contagionLevel: 'NONE',
      activeBreakersCount: 0,
      globalRiskScaling: 1.0,
      summaryMessage: 'Market volatility baseline normal. No cross-asset contagion detected.'
    };
  }

  public getRecentAlerts(): MarketAnomalyAlert[] {
    return [...this.alertsHistory];
  }

  public getMetrics(symbol: string): VolatilityMetrics {
    const isBreaker = this.isCircuitBreakerActive(symbol);
    return {
      atrPercent: 1.25,
      spreadBps: 1.2,
      liquidityScore: isBreaker ? 20 : 94,
      volatilityZScore: isBreaker ? 3.8 : 0.65,
      isBlackSwanRisk: isBreaker
    };
  }
}

export const volatilitySentinel = new VolatilitySentinelEngine();
