/**
 * NAVIX AI — MOBILE EDGE STREAM & ADAPTIVE IMAGE/PAYLOAD TOKEN OPTIMIZER
 * 
 * Compresses chart screenshots, optimizes image tokens before cloud dispatch,
 * reduces mobile data consumption, and provides offline calculation fallbacks.
 */

export interface MobileNetworkQuality {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi';
  downlinkSpeedMbps: number;
  rttMs: number;
  saveDataMode: boolean;
  recommendedCompressionQuality: number; // 0.1 to 1.0
  maxImageDimension: number; // max width/height in px
}

export class MobileEdgeOptimizer {
  /**
   * Detects real-time mobile browser connection telemetry.
   */
  public getNetworkProfile(): MobileNetworkQuality {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const effectiveType = conn.effectiveType || '4g';
        const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g';
        const saveData = Boolean(conn.saveData);

        return {
          effectiveType,
          downlinkSpeedMbps: conn.downlink || 10,
          rttMs: conn.rtt || 100,
          saveDataMode: saveData,
          recommendedCompressionQuality: isSlow || saveData ? 0.45 : 0.85,
          maxImageDimension: isSlow || saveData ? 800 : 1600
        };
      }
    }

    return {
      effectiveType: '4g',
      downlinkSpeedMbps: 20,
      rttMs: 50,
      saveDataMode: false,
      recommendedCompressionQuality: 0.85,
      maxImageDimension: 1600
    };
  }

  /**
   * Intelligently downscales and compresses image base64 / blob for low-bandwidth environments.
   */
  public async optimizeImageForMobile(
    base64DataUrl: string,
    overrideQuality?: number
  ): Promise<{ optimizedDataUrl: string; compressionRatio: number; originalBytes: number; optimizedBytes: number }> {
    if (typeof window === 'undefined' || typeof document === 'undefined' || overrideQuality === 1 || overrideQuality === 1.0) {
      return {
        optimizedDataUrl: base64DataUrl,
        compressionRatio: 1.0,
        originalBytes: base64DataUrl ? base64DataUrl.length : 0,
        optimizedBytes: base64DataUrl ? base64DataUrl.length : 0
      };
    }

    const network = this.getNetworkProfile();
    const targetQuality = overrideQuality ?? network.recommendedCompressionQuality;
    const maxDim = network.maxImageDimension;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            optimizedDataUrl: base64DataUrl,
            compressionRatio: 1.0,
            originalBytes: base64DataUrl.length,
            optimizedBytes: base64DataUrl.length
          });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const optimized = canvas.toDataURL('image/jpeg', targetQuality);

        const origBytes = Math.round((base64DataUrl.length * 3) / 4);
        const optBytes = Math.round((optimized.length * 3) / 4);
        const ratio = Number((optBytes / (origBytes || 1)).toFixed(2));

        resolve({
          optimizedDataUrl: optimized,
          compressionRatio: ratio,
          originalBytes: origBytes,
          optimizedBytes: optBytes
        });
      };

      img.onerror = () => {
        resolve({
          optimizedDataUrl: base64DataUrl,
          compressionRatio: 1.0,
          originalBytes: base64DataUrl.length,
          optimizedBytes: base64DataUrl.length
        });
      };

      img.src = base64DataUrl;
    });
  }

  /**
   * Offline Fast Indicator Engine (Calculates RSI, SMA, EMA, Bollinger Bands, and SNR boundaries offline).
   */
  public calculateOfflineIndicators(closes: number[]): {
    sma20: number;
    ema20: number;
    ema50: number;
    rsi14: number;
    bollingerBands: { upper: number; middle: number; lower: number; bandwidthPct: number };
    supportResistance: { r2: number; r1: number; pivot: number; s1: number; s2: number };
    trend: 'STRONG_BULLISH' | 'BULLISH' | 'SIDEWAYS' | 'BEARISH' | 'STRONG_BEARISH';
  } {
    const current = closes && closes.length > 0 ? closes[closes.length - 1] : 0;

    if (!closes || closes.length < 20) {
      return {
        sma20: current,
        ema20: current,
        ema50: current,
        rsi14: 50,
        bollingerBands: { upper: current * 1.02, middle: current, lower: current * 0.98, bandwidthPct: 4.0 },
        supportResistance: { r2: current * 1.04, r1: current * 1.02, pivot: current, s1: current * 0.98, s2: current * 0.96 },
        trend: 'SIDEWAYS'
      };
    }

    // SMA 20
    const last20 = closes.slice(-20);
    const sma20 = last20.reduce((a, b) => a + b, 0) / 20;

    // EMA helper function
    const calcEMA = (data: number[], period: number): number => {
      if (data.length < period) return data[data.length - 1];
      const k = 2 / (period + 1);
      let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
      }
      return ema;
    };

    const ema20 = calcEMA(closes, 20);
    const ema50 = calcEMA(closes, 50);

    // Standard Deviation for Bollinger Bands
    const variance = last20.reduce((sum, val) => sum + Math.pow(val - sma20, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    const bbUpper = Number((sma20 + (2 * stdDev)).toFixed(4));
    const bbLower = Number((sma20 - (2 * stdDev)).toFixed(4));
    const bandwidthPct = Number((((bbUpper - bbLower) / (sma20 || 1)) * 100).toFixed(2));

    // RSI 14
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - 14; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14 || 0.0001;
    const rs = avgGain / avgLoss;
    const rsi14 = Number((100 - (100 / (1 + rs))).toFixed(2));

    // Support and Resistance Pivots (from recent 20-candle high/low)
    const high20 = Math.max(...last20);
    const low20 = Math.min(...last20);
    const pivot = (high20 + low20 + current) / 3;
    const r1 = (2 * pivot) - low20;
    const s1 = (2 * pivot) - high20;
    const r2 = pivot + (high20 - low20);
    const s2 = pivot - (high20 - low20);

    // Trend Evaluation
    let trend: 'STRONG_BULLISH' | 'BULLISH' | 'SIDEWAYS' | 'BEARISH' | 'STRONG_BEARISH' = 'SIDEWAYS';
    if (current > ema20 && ema20 > ema50 && rsi14 > 60) {
      trend = 'STRONG_BULLISH';
    } else if (current > sma20 && rsi14 > 52) {
      trend = 'BULLISH';
    } else if (current < ema20 && ema20 < ema50 && rsi14 < 40) {
      trend = 'STRONG_BEARISH';
    } else if (current < sma20 && rsi14 < 48) {
      trend = 'BEARISH';
    }

    return {
      sma20: Number(sma20.toFixed(4)),
      ema20: Number(ema20.toFixed(4)),
      ema50: Number(ema50.toFixed(4)),
      rsi14,
      bollingerBands: {
        upper: bbUpper,
        middle: Number(sma20.toFixed(4)),
        lower: bbLower,
        bandwidthPct
      },
      supportResistance: {
        r2: Number(r2.toFixed(4)),
        r1: Number(r1.toFixed(4)),
        pivot: Number(pivot.toFixed(4)),
        s1: Number(s1.toFixed(4)),
        s2: Number(s2.toFixed(4))
      },
      trend
    };
  }

  /**
   * Optimizes prompt or context string for low-memory mobile viewports.
   */
  public optimizeMobileContext(text: string, maxChars: number = 3500): string {
    if (!text || text.length <= maxChars) return text;
    // Strip redundant multiple newlines and spaces
    const cleaned = text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ');
    if (cleaned.length <= maxChars) return cleaned;
    return cleaned.substring(0, maxChars) + '\n...[Truncked for mobile bandwidth efficiency]';
  }
}

export const mobileEdgeOptimizer = new MobileEdgeOptimizer();
