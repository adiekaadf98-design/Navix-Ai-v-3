/**
 * NAVIX PRO AI - Sequential Monte Carlo (SMC) Quantitative Matrix Engine
 * 
 * Sistem Pemrosesan Data Kuantitatif Berbasis Sequential Monte Carlo (SMC) / Particle Filtering:
 * Mengestimasi distribusi posterior non-linear non-Gaussian, volatilitas stokastik,
 * probabilitas rezim likuiditas institusional, serta proyeksi kuantil deret data numerik & pasar real-time.
 */

export interface SmcParticle {
  state: number;        // Nilai state tersembunyi (Filtered State/Price)
  drift: number;        // Momentum tren instan (μ_t)
  volatility: number;   // Volatilitas stokastik lokal (σ_t)
  weight: number;       // Bobot partikel (w_t)
}

export interface SmcQuantileSet {
  q025: number;  // 2.5% Lower Bound (95% CI)
  q100: number;  // 10% Bound
  q250: number;  // 25% (Q1)
  median: number;// 50% (Median)
  q750: number;  // 75% (Q3)
  q900: number;  // 90% Bound
  q975: number;  // 97.5% Upper Bound (95% CI)
}

export interface SmcForecastStep {
  step: number;
  expectedValue: number;
  median: number;
  lower95: number;
  upper95: number;
  lower50: number;
  upper50: number;
  projectedVolatility: number;
}

export interface SmcRegimeProbabilities {
  bullishDrift: number;              // P(drift > 0)
  bearishDrift: number;              // P(drift < 0)
  volatilityExpansion: number;       // P(volatility > meanVol * 1.5)
  meanReversionRange: number;        // P(|drift| < threshold)
  institutionalSweepProbability: number; // P(jump/shock)
  dominantRegime: 'BULLISH_TREND' | 'BEARISH_TREND' | 'VOLATILITY_EXPANSION' | 'EQUILIBRIUM_CONSOLIDATION';
}

export interface SmcRiskMatrix {
  valueAtRisk95: number;         // VaR 95%
  valueAtRisk99: number;         // VaR 99%
  conditionalVaR95: number;      // CVaR / Expected Shortfall 95%
  conditionalVaR99: number;      // CVaR / Expected Shortfall 99%
  posteriorSkewness: number;
  posteriorKurtosis: number;
  tailRiskClassification: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface SmcMatrixResult {
  title: string;
  dataPointsProcessed: number;
  particleCount: number;
  filteredEstimate: number;
  filteredQuantiles: SmcQuantileSet;
  regimes: SmcRegimeProbabilities;
  riskMatrix: SmcRiskMatrix;
  forecastSteps: SmcForecastStep[];
  diagnostics: {
    effectiveSampleSize: number;
    degeneracyRatio: number;
    resamplingTriggered: number;
    weightEntropy: number;
  };
  formattedMatrixReport: string;
  executionTimeMs: number;
}

export class SmcQuantitativeMatrixEngine {
  public readonly id = 'SmcQuantitativeMatrix';
  public readonly name = 'Sequential Monte Carlo Quantitative Matrix';

  /**
   * Generates pseudo-random standard normal variable via Box-Muller transform
   */
  private gaussianRandom(mean = 0, stdDev = 1): number {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Computes quantile of weighted particle ensemble
   */
  private computeWeightedQuantile(particles: SmcParticle[], quantile: number): number {
    const sorted = [...particles].sort((a, b) => a.state - b.state);
    let cumulative = 0;
    for (const p of sorted) {
      cumulative += p.weight;
      if (cumulative >= quantile) {
        return p.state;
      }
    }
    return sorted[sorted.length - 1].state;
  }

  /**
   * Systematic Resampling algorithm to combat particle degeneracy
   */
  private systematicResample(particles: SmcParticle[]): SmcParticle[] {
    const N = particles.length;
    const resampled: SmcParticle[] = new Array(N);
    const cumulativeWeights = new Float64Array(N);

    cumulativeWeights[0] = particles[0].weight;
    for (let i = 1; i < N; i++) {
      cumulativeWeights[i] = cumulativeWeights[i - 1] + particles[i].weight;
    }

    const u0 = Math.random() / N;
    let j = 0;

    for (let i = 0; i < N; i++) {
      const u = u0 + i / N;
      while (j < N - 1 && u > cumulativeWeights[j]) {
        j++;
      }
      resampled[i] = {
        state: particles[j].state,
        drift: particles[j].drift,
        volatility: particles[j].volatility,
        weight: 1.0 / N
      };
    }

    return resampled;
  }

  /**
   * Runs Sequential Monte Carlo particle filter over a sequential dataset
   */
  public computeMatrix(
    data: number[],
    options?: {
      particleCount?: number;
      forecastHorizon?: number;
      label?: string;
      observationNoiseStd?: number;
    }
  ): SmcMatrixResult {
    const startTime = Date.now();
    const N = Math.max(50, Math.min(options?.particleCount || 200, 1000));
    const horizon = Math.max(3, Math.min(options?.forecastHorizon || 10, 30));
    const label = options?.label || 'Navix Numerical Stream';

    if (!data || data.length < 2) {
      throw new Error('SMC Quantitative Matrix memerlukan minimal 2 titik data numerik.');
    }

    const y0 = data[0];
    const dataRange = Math.max(...data) - Math.min(...data);
    const baselineVol = dataRange > 0 ? (dataRange / Math.sqrt(data.length)) : 1.0;
    const obsNoise = options?.observationNoiseStd || Math.max(baselineVol * 0.25, 0.001);

    // 1. Inisialisasi Partikel Awal
    let particles: SmcParticle[] = new Array(N);
    for (let i = 0; i < N; i++) {
      particles[i] = {
        state: y0 + this.gaussianRandom(0, obsNoise),
        drift: this.gaussianRandom(0, baselineVol * 0.1),
        volatility: Math.max(baselineVol * (0.8 + Math.random() * 0.4), 0.0001),
        weight: 1.0 / N
      };
    }

    let resamplingTriggered = 0;
    const NeffThreshold = N * 0.5;

    // 2. Sequential Filtering Loop (State Transition -> Likelihood Update -> Resample)
    for (let t = 1; t < data.length; t++) {
      const yt = data[t];
      let weightSum = 0;

      // A. State Transition Model: Random Walk Drift + Stochastic Volatility + Jump Impulse
      for (let i = 0; i < N; i++) {
        const p = particles[i];
        
        // Dynamic drift mean-reverting decay
        p.drift = 0.95 * p.drift + this.gaussianRandom(0, p.volatility * 0.15);
        
        // Volatility evolution (log-normal stochastic volatility)
        p.volatility = Math.max(p.volatility * Math.exp(this.gaussianRandom(0, 0.1)), 0.0001);

        // Poisson jump event (institutional liquidity impulse, 8% probability per step)
        const isJump = Math.random() < 0.08;
        const jumpImpact = isJump ? this.gaussianRandom(0, p.volatility * 2.5) : 0;

        // State update
        p.state = p.state + p.drift + this.gaussianRandom(0, p.volatility) + jumpImpact;

        // B. Likelihood Evaluation: p(y_t | state_t)
        const diff = yt - p.state;
        const likelihood = Math.exp(-0.5 * Math.pow(diff / obsNoise, 2)) / (Math.sqrt(2 * Math.PI) * obsNoise);
        p.weight = p.weight * (likelihood + 1e-12);
        weightSum += p.weight;
      }

      // Normalisasi Bobot
      for (let i = 0; i < N; i++) {
        particles[i].weight = weightSum > 0 ? (particles[i].weight / weightSum) : (1.0 / N);
      }

      // C. Evaluasi Effective Sample Size (Neff)
      let sumSqWeights = 0;
      for (let i = 0; i < N; i++) {
        sumSqWeights += Math.pow(particles[i].weight, 2);
      }
      const Neff = sumSqWeights > 0 ? (1.0 / sumSqWeights) : 0;

      // Resampling bila terjadi degenerasi partikel
      if (Neff < NeffThreshold) {
        particles = this.systematicResample(particles);
        resamplingTriggered++;
      }
    }

    // 3. Evaluasi State Terkini & Kuantil Posterior
    let filteredEstimate = 0;
    let driftSum = 0;
    let volSum = 0;

    for (let i = 0; i < N; i++) {
      filteredEstimate += particles[i].state * particles[i].weight;
      driftSum += particles[i].drift * particles[i].weight;
      volSum += particles[i].volatility * particles[i].weight;
    }

    const filteredQuantiles: SmcQuantileSet = {
      q025: Number(this.computeWeightedQuantile(particles, 0.025).toFixed(3)),
      q100: Number(this.computeWeightedQuantile(particles, 0.100).toFixed(3)),
      q250: Number(this.computeWeightedQuantile(particles, 0.250).toFixed(3)),
      median: Number(this.computeWeightedQuantile(particles, 0.500).toFixed(3)),
      q750: Number(this.computeWeightedQuantile(particles, 0.750).toFixed(3)),
      q900: Number(this.computeWeightedQuantile(particles, 0.900).toFixed(3)),
      q975: Number(this.computeWeightedQuantile(particles, 0.975).toFixed(3))
    };

    // 4. Analisis Rezim Pasar & Probabilitas
    let bullishDriftWeight = 0;
    let bearishDriftWeight = 0;
    let volExpansionWeight = 0;
    let meanReversionWeight = 0;

    const volExpansionThreshold = volSum * 1.35;
    const driftEpsilon = baselineVol * 0.05;

    for (let i = 0; i < N; i++) {
      const p = particles[i];
      if (p.drift > driftEpsilon) bullishDriftWeight += p.weight;
      else if (p.drift < -driftEpsilon) bearishDriftWeight += p.weight;
      else meanReversionWeight += p.weight;

      if (p.volatility > volExpansionThreshold) volExpansionWeight += p.weight;
    }

    let dominantRegime: SmcRegimeProbabilities['dominantRegime'] = 'EQUILIBRIUM_CONSOLIDATION';
    if (volExpansionWeight > 0.40) dominantRegime = 'VOLATILITY_EXPANSION';
    else if (bullishDriftWeight > 0.55) dominantRegime = 'BULLISH_TREND';
    else if (bearishDriftWeight > 0.55) dominantRegime = 'BEARISH_TREND';

    const regimes: SmcRegimeProbabilities = {
      bullishDrift: Number(bullishDriftWeight.toFixed(3)),
      bearishDrift: Number(bearishDriftWeight.toFixed(3)),
      volatilityExpansion: Number(volExpansionWeight.toFixed(3)),
      meanReversionRange: Number(meanReversionWeight.toFixed(3)),
      institutionalSweepProbability: Number(Math.min(1.0, volExpansionWeight * 1.25).toFixed(3)),
      dominantRegime
    };

    // 5. Matriks Risiko Kuantitatif (VaR & CVaR)
    const lastPrice = data[data.length - 1];
    const logReturns = particles.map(p => (p.state - lastPrice) / (lastPrice || 1));
    logReturns.sort((a, b) => a - b);

    const var95Idx = Math.floor(N * 0.05);
    const var99Idx = Math.floor(N * 0.01);

    const var95 = Math.abs(logReturns[var95Idx] || 0) * 100;
    const var99 = Math.abs(logReturns[var99Idx] || 0) * 100;

    const tail95Returns = logReturns.slice(0, var95Idx + 1);
    const tail99Returns = logReturns.slice(0, var99Idx + 1);

    const cvar95 = tail95Returns.length > 0 
      ? Math.abs(tail95Returns.reduce((a, b) => a + b, 0) / tail95Returns.length) * 100 
      : var95 * 1.15;
    const cvar99 = tail99Returns.length > 0 
      ? Math.abs(tail99Returns.reduce((a, b) => a + b, 0) / tail99Returns.length) * 100 
      : var99 * 1.15;

    // Moments
    const meanState = filteredEstimate;
    const m2 = particles.reduce((acc, p) => acc + p.weight * Math.pow(p.state - meanState, 2), 0);
    const m3 = particles.reduce((acc, p) => acc + p.weight * Math.pow(p.state - meanState, 3), 0);
    const m4 = particles.reduce((acc, p) => acc + p.weight * Math.pow(p.state - meanState, 4), 0);

    const sigma = Math.sqrt(m2) || 1e-6;
    const skewness = m3 / Math.pow(sigma, 3);
    const kurtosis = (m4 / Math.pow(sigma, 4)) - 3; // Excess kurtosis

    let tailRisk: SmcRiskMatrix['tailRiskClassification'] = 'MODERATE';
    if (var99 > 8.0 || kurtosis > 4.0) tailRisk = 'CRITICAL';
    else if (var99 > 4.5 || kurtosis > 2.0) tailRisk = 'HIGH';
    else if (var99 < 2.0 && kurtosis < 1.0) tailRisk = 'LOW';

    const riskMatrix: SmcRiskMatrix = {
      valueAtRisk95: Number(var95.toFixed(2)),
      valueAtRisk99: Number(var99.toFixed(2)),
      conditionalVaR95: Number(cvar95.toFixed(2)),
      conditionalVaR99: Number(cvar99.toFixed(2)),
      posteriorSkewness: Number(skewness.toFixed(3)),
      posteriorKurtosis: Number(kurtosis.toFixed(3)),
      tailRiskClassification: tailRisk
    };

    // 6. Proyeksi Multi-Step Forward Matrix (Fan-Chart Forecast)
    const forecastSteps: SmcForecastStep[] = [];
    const forecastParticles: SmcParticle[] = particles.map(p => ({ ...p }));

    for (let h = 1; h <= horizon; h++) {
      let stepSum = 0;
      let stepVolSum = 0;

      for (let i = 0; i < N; i++) {
        const fp = forecastParticles[i];
        fp.drift = 0.96 * fp.drift + this.gaussianRandom(0, fp.volatility * 0.1);
        fp.volatility = fp.volatility * Math.exp(this.gaussianRandom(0, 0.05));
        fp.state = fp.state + fp.drift + this.gaussianRandom(0, fp.volatility);
        stepSum += fp.state * fp.weight;
        stepVolSum += fp.volatility * fp.weight;
      }

      const fLower95 = this.computeWeightedQuantile(forecastParticles, 0.025);
      const fUpper95 = this.computeWeightedQuantile(forecastParticles, 0.975);
      const fLower50 = this.computeWeightedQuantile(forecastParticles, 0.250);
      const fUpper50 = this.computeWeightedQuantile(forecastParticles, 0.750);
      const fMedian = this.computeWeightedQuantile(forecastParticles, 0.500);

      forecastSteps.push({
        step: h,
        expectedValue: Number(stepSum.toFixed(3)),
        median: Number(fMedian.toFixed(3)),
        lower95: Number(fLower95.toFixed(3)),
        upper95: Number(fUpper95.toFixed(3)),
        lower50: Number(fLower50.toFixed(3)),
        upper50: Number(fUpper50.toFixed(3)),
        projectedVolatility: Number(stepVolSum.toFixed(4))
      });
    }

    // Diagnostics
    let entropy = 0;
    for (let i = 0; i < N; i++) {
      if (particles[i].weight > 0) {
        entropy -= particles[i].weight * Math.log(particles[i].weight);
      }
    }

    let finalSumSq = 0;
    for (let i = 0; i < N; i++) {
      finalSumSq += Math.pow(particles[i].weight, 2);
    }
    const finalNeff = finalSumSq > 0 ? (1.0 / finalSumSq) : N;

    const formattedMatrixReport = this.generateReportMarkdown(
      label,
      data.length,
      N,
      filteredEstimate,
      filteredQuantiles,
      regimes,
      riskMatrix,
      forecastSteps
    );

    return {
      title: label,
      dataPointsProcessed: data.length,
      particleCount: N,
      filteredEstimate: Number(filteredEstimate.toFixed(3)),
      filteredQuantiles,
      regimes,
      riskMatrix,
      forecastSteps,
      diagnostics: {
        effectiveSampleSize: Number(finalNeff.toFixed(1)),
        degeneracyRatio: Number((finalNeff / N).toFixed(2)),
        resamplingTriggered,
        weightEntropy: Number(entropy.toFixed(3))
      },
      formattedMatrixReport,
      executionTimeMs: Date.now() - startTime
    };
  }

  /**
   * Generates institutional markdown report matrix
   */
  private generateReportMarkdown(
    label: string,
    n: number,
    particleCount: number,
    estimate: number,
    q: SmcQuantileSet,
    regimes: SmcRegimeProbabilities,
    risk: SmcRiskMatrix,
    forecast: SmcForecastStep[]
  ): string {
    const f1 = forecast[0];
    const fEnd = forecast[forecast.length - 1];

    return `### 🔬 **NAVIX QUANTITATIVE MATRIX — SEQUENTIAL MONTE CARLO (SMC) FILTER**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 **Dataset / Instrument**: \`${label}\` (${n} data points | ${particleCount} active particles)
🎯 **Filtered State Mean (Posterior E[X_t])**: \`${estimate.toFixed(3)}\`
⚖️ **Median (Q50)**: \`${q.median}\` | **95% Credible Interval**: \`[${q.q025} s/d ${q.q975}]\`

---
#### 🌐 1. Matriks Kuantil Sebaran Probabilitas Posterior
| Kuantil | Nilai Proyeksi | Interpretasi Kuantitatif |
| :--- | :---: | :--- |
| **Q02.5 (Lower Tail 95%)** | \`${q.q025}\` | Batas bawah deviasi ekstrem |
| **Q25.0 (Kuartil Bawah)** | \`${q.q250}\` | Zona support akumulasi partikel |
| **Q50.0 (Median Terdistribusi)** | \`${q.median}\` | Estimasi nilai ekuilibrium sentral |
| **Q75.0 (Kuartil Atas)** | \`${q.q750}\` | Zona resistensi distribusi partikel |
| **Q97.5 (Upper Tail 95%)** | \`${q.q975}\` | Batas atas deviasi ekspansi |

---
#### 🧭 2. Matriks Rezim Pasar & Aliran Likuiditas Institusional
- **Dominant Regime**: \`🟢 ${regimes.dominantRegime}\`
- **Probabilitas Tren Bullish P(Drift > 0)**: \`${(regimes.bullishDrift * 100).toFixed(1)}%\`
- **Probabilitas Tren Bearish P(Drift < 0)**: \`${(regimes.bearishDrift * 100).toFixed(1)}%\`
- **Probabilitas Ekspansi Volatilitas**: \`${(regimes.volatilityExpansion * 100).toFixed(1)}%\`
- **Indeks Likuiditas Shock / Jump**: \`${(regimes.institutionalSweepProbability * 100).toFixed(1)}%\`

---
#### 🛡️ 3. Matriks Risiko Kuantitatif (Tail Risk & Value at Risk)
- **Value-at-Risk (VaR 95%)**: \`-${risk.valueAtRisk95}%\` (Potensi drawdown batas normal)
- **Value-at-Risk (VaR 99%)**: \`-${risk.valueAtRisk99}%\` (Potensi drawdown tail risk)
- **Conditional VaR / Expected Shortfall (CVaR 95%)**: \`-${risk.conditionalVaR95}%\`
- **Skewness & Kurtosis Posterior**: Skewness=\`${risk.posteriorSkewness}\` | Kurtosis=\`${risk.posteriorKurtosis}\`
- **Tingkat Risiko Ekor (Tail Risk)**: \`${risk.tailRiskClassification}\`

---
#### 🔮 4. Matriks Prediksi Multi-Langkah (Sequential Fan-Chart Horizon)
| Langkah (h) | Estimasi Rata-rata | 50% CI Range [Q25 - Q75] | 95% Fan Interval [Q02.5 - Q97.5] | Proyeksi Volatilitas |
| :---: | :---: | :---: | :---: | :---: |
| **h+1** | \`${f1.expectedValue}\` | [${f1.lower50} - ${f1.upper50}] | [${f1.lower95} - ${f1.upper95}] | \`${f1.projectedVolatility}\` |
| **h+${Math.floor(forecast.length / 2)}** | \`${forecast[Math.floor(forecast.length / 2)].expectedValue}\` | [${forecast[Math.floor(forecast.length / 2)].lower50} - ${forecast[Math.floor(forecast.length / 2)].upper50}] | [${forecast[Math.floor(forecast.length / 2)].lower95} - ${forecast[Math.floor(forecast.length / 2)].upper95}] | \`${forecast[Math.floor(forecast.length / 2)].projectedVolatility}\` |
| **h+${forecast.length}** | \`${fEnd.expectedValue}\` | [${fEnd.lower50} - ${fEnd.upper50}] | [${fEnd.lower95} - ${fEnd.upper95}] | \`${fEnd.projectedVolatility}\` |`;
  }
}

export const globalSmcQuantitativeMatrix = new SmcQuantitativeMatrixEngine();
