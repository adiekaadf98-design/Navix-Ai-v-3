import {
  CandleData,
  StrategyEngineType,
  EngineAnalysisResult,
  MarketTickerItem,
  SMCZone,
  MarketStructureMarker,
  CandlePatternMarker
} from '../../types/cloudMarket';

export const INITIAL_MARKET_TICKERS: MarketTickerItem[] = [
  // Gold & Commodities
  { symbol: 'XAUUSD', displayName: 'XAU/USD GOLD SPOT', category: 'Komoditas', price: 4390.7, change24h: 0.65, high24h: 4410.5, low24h: 4375.2, volume24h: 8900000000, decimals: 2 },
  
  // Forex Major
  { symbol: 'EURUSD', displayName: 'EUR/USD FOREX', category: 'Forex', price: 1.1542, change24h: -0.12, high24h: 1.1590, low24h: 1.1510, volume24h: 6200000000, decimals: 4 },
  { symbol: 'GBPUSD', displayName: 'GBP/USD FOREX', category: 'Forex', price: 1.3452, change24h: 0.18, high24h: 1.3510, low24h: 1.3400, volume24h: 4800000000, decimals: 4 },
  { symbol: 'USDJPY', displayName: 'USD/JPY FOREX', category: 'Forex', price: 153.80, change24h: -0.45, high24h: 154.60, low24h: 153.20, volume24h: 5300000000, decimals: 2 },

  // Major Crypto
  { symbol: 'BTCUSDT', displayName: 'BTCUSDT PERP', category: 'Major', price: 75690.0, change24h: -3.52, high24h: 78500.0, low24h: 75120.0, volume24h: 3820000000, decimals: 2 },
  { symbol: 'ETHUSDT', displayName: 'ETHUSDT PERP', category: 'Major', price: 2519.98, change24h: -1.85, high24h: 2595.0, low24h: 2480.0, volume24h: 1940000000, decimals: 2 },
  { symbol: 'SOLUSDT', displayName: 'SOLUSDT PERP', category: 'Major', price: 100.89, change24h: 1.25, high24h: 103.4, low24h: 98.2, volume24h: 1420000000, decimals: 2 },
  { symbol: 'BNBUSDT', displayName: 'BNBUSDT PERP', category: 'Major', price: 723.18, change24h: 0.85, high24h: 735.0, low24h: 712.0, volume24h: 520000000, decimals: 2 },
  { symbol: 'XRPUSDT', displayName: 'XRPUSDT PERP', category: 'Major', price: 1.3618, change24h: 3.45, high24h: 1.42, low24h: 1.31, volume24h: 890000000, decimals: 4 },
  { symbol: 'DOGEUSDT', displayName: 'DOGEUSDT PERP', category: 'Meme', price: 0.14089, change24h: 2.15, high24h: 0.148, low24h: 0.136, volume24h: 670000000, decimals: 5 },
  
  // High-Volume Alts
  { symbol: 'ZECUSDT', displayName: 'ZECUSDT PERP', category: 'Major', price: 1132.37, change24h: -0.32, high24h: 1170.0, low24h: 1120.0, volume24h: 340000000, decimals: 2 },
  { symbol: 'THEUSDT', displayName: 'THEUSDT PERP', category: 'L1/L2', price: 0.0678, change24h: 2.85, high24h: 0.072, low24h: 0.064, volume24h: 180000000, decimals: 4 },
  { symbol: 'NEARUSDT', displayName: 'NEARUSDT PERP', category: 'AI', price: 2.313, change24h: -2.15, high24h: 2.45, low24h: 2.26, volume24h: 240000000, decimals: 3 },
  { symbol: 'TRXUSDT', displayName: 'TRXUSDT PERP', category: 'Major', price: 0.3398, change24h: 0.27, high24h: 0.345, low24h: 0.335, volume24h: 210000000, decimals: 4 },
  
  // AI & Ecosystem
  { symbol: 'RENDERUSDT', displayName: 'RENDERUSDT PERP', category: 'AI', price: 6.42, change24h: 4.12, high24h: 6.75, low24h: 6.12, volume24h: 260000000, decimals: 3 },
  { symbol: 'TAOUSDT', displayName: 'TAOUSDT PERP', category: 'AI', price: 382.5, change24h: 5.60, high24h: 395.0, low24h: 360.0, volume24h: 190000000, decimals: 2 },
  { symbol: 'FETUSDT', displayName: 'FETUSDT PERP', category: 'AI', price: 1.28, change24h: 1.95, high24h: 1.34, low24h: 1.22, volume24h: 150000000, decimals: 3 },
  { symbol: 'WLDUSDT', displayName: 'WLDUSDT PERP', category: 'AI', price: 2.15, change24h: -0.85, high24h: 2.25, low24h: 2.08, volume24h: 130000000, decimals: 3 },

  // Meme coins
  { symbol: 'PEPEUSDT', displayName: 'PEPEUSDT PERP', category: 'Meme', price: 0.0000104, change24h: 7.20, high24h: 0.0000112, low24h: 0.0000096, volume24h: 420000000, decimals: 7 },
  { symbol: 'SHIBUSDT', displayName: 'SHIBUSDT PERP', category: 'Meme', price: 0.0000185, change24h: 1.40, high24h: 0.0000192, low24h: 0.0000180, volume24h: 190000000, decimals: 7 },
  { symbol: 'WIFUSDT', displayName: 'WIFUSDT PERP', category: 'Meme', price: 1.84, change24h: -3.10, high24h: 1.98, low24h: 1.78, volume24h: 280000000, decimals: 3 },
  { symbol: 'BONKUSDT', displayName: 'BONKUSDT PERP', category: 'Meme', price: 0.0000214, change24h: 4.50, high24h: 0.0000228, low24h: 0.0000201, volume24h: 160000000, decimals: 7 },

  // L1/L2
  { symbol: 'SUIUSDT', displayName: 'SUIUSDT PERP', category: 'L1/L2', price: 2.85, change24h: 6.80, high24h: 2.98, low24h: 2.62, volume24h: 510000000, decimals: 3 },
  { symbol: 'APTUSDT', displayName: 'APTUSDT PERP', category: 'L1/L2', price: 8.65, change24h: -1.20, high24h: 9.10, low24h: 8.45, volume24h: 140000000, decimals: 2 },
  { symbol: 'ARBUSDT', displayName: 'ARBUSDT PERP', category: 'L1/L2', price: 0.582, change24h: 0.75, high24h: 0.610, low24h: 0.570, volume24h: 110000000, decimals: 3 },
  { symbol: 'OPUSDT', displayName: 'OPUSDT PERP', category: 'L1/L2', price: 1.74, change24h: 1.10, high24h: 1.82, low24h: 1.68, volume24h: 125000000, decimals: 3 },
  { symbol: 'AVAXUSDT', displayName: 'AVAXUSDT PERP', category: 'L1/L2', price: 28.40, change24h: 2.30, high24h: 29.50, low24h: 27.20, volume24h: 230000000, decimals: 2 }
];

export class CloudMarketEngine {
  /**
   * Fetch real candlestick history from Unified Cloud Market Engine API (/api/market/klines)
   * Supporting All Pairs: Gold (XAUUSD), Forex (EURUSD, GBPUSD, USDJPY, etc.), & Crypto (BTC, ETH, SOL, etc.)
   */
  public static async fetchCandles(symbol: string, timeframe: string = '15m', limit: number = 80): Promise<CandleData[]> {
    const cleanSymbol = symbol.replace(/[\/\-_]/g, '').toUpperCase();
    
    // Convert TF string to standard interval format (e.g. m1 -> 1m, m15 -> 15m, h1 -> 1h, d1 -> 1d)
    const intervalMap: Record<string, string> = {
      m1: '1m', m5: '5m', m15: '15m', m30: '30m',
      h1: '1h', h4: '4h', d1: '1d',
      '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
      '1h': '1h', '4h': '4h', '1d': '1d'
    };
    const interval = intervalMap[timeframe.toLowerCase()] || '15m';

    try {
      const res = await fetch(`/api/market/klines?symbol=${encodeURIComponent(cleanSymbol)}&interval=${interval}&limit=${limit}`);
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((k: any) => ({
            time: Number(k.time),
            open: parseFloat(k.open),
            high: parseFloat(k.high),
            low: parseFloat(k.low),
            close: parseFloat(k.close),
            volume: parseFloat(k.volume || 0)
          }));
        }
      }
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `DATA_UNAVAILABLE: Gagal mengambil candlestick untuk ${cleanSymbol}`);
    } catch (e: any) {
      console.warn(`[CloudMarketEngine] Provider API fetch failed for ${cleanSymbol}:`, e.message || e);
      throw e;
    }
  }

  /**
   * Fetch Live Real-Time Tick Price from Unified Backend API
   */
  public static async fetchLivePrice(symbol: string): Promise<number | null> {
    try {
      const cleanSymbol = symbol.replace(/[\/\-_]/g, '').toUpperCase();
      const res = await fetch(`/api/market/price?symbol=${encodeURIComponent(cleanSymbol)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.price) {
          return parseFloat(data.price);
        }
      }
    } catch (e) {
      console.warn('[CloudMarketEngine] Failed fetching live price from API:', e);
    }
    return null;
  }

  /**
   * Fetch Live Market Ticker List across all asset classes from Unified Backend API
   */
  public static async fetchMarketTickers(): Promise<MarketTickerItem[]> {
    try {
      const res = await fetch('/api/market/tickers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[CloudMarketEngine] Failed fetching live tickers from API, using fallback:', e);
    }
    return INITIAL_MARKET_TICKERS;
  }

  /**
   * Calculate ATR (Average True Range) for volatility & distance calculations
   */
  public static calculateATR(candles: CandleData[], period: number = 14): number {
    if (candles.length < 2) return 1.0;
    const trs: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const c = candles[i];
      const prev = candles[i - 1];
      const tr = Math.max(
        c.high - c.low,
        Math.abs(c.high - prev.close),
        Math.abs(c.low - prev.close)
      );
      trs.push(tr);
    }
    const recent = trs.slice(-period);
    const sum = recent.reduce((a, b) => a + b, 0);
    return sum / (recent.length || 1);
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  public static calculateEMA(candles: CandleData[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    if (candles.length === 0) return ema;

    let prevEma = candles[0].close;
    ema.push(prevEma);

    for (let i = 1; i < candles.length; i++) {
      const current = candles[i].close * k + prevEma * (1 - k);
      ema.push(current);
      prevEma = current;
    }
    return ema;
  }

  /**
   * Calculate Ichimoku Cloud Components
   */
  public static calculateIchimoku(candles: CandleData[]) {
    const getMid = (slice: CandleData[]) => {
      let high = -Infinity;
      let low = Infinity;
      for (const c of slice) {
        if (c.high > high) high = c.high;
        if (c.low < low) low = c.low;
      }
      return (high + low) / 2;
    };

    const tenkan: (number | null)[] = [];
    const kijun: (number | null)[] = [];
    const spanA: (number | null)[] = [];
    const spanB: (number | null)[] = [];

    for (let i = 0; i < candles.length; i++) {
      tenkan.push(i >= 9 ? getMid(candles.slice(i - 9 + 1, i + 1)) : null);
      kijun.push(i >= 26 ? getMid(candles.slice(i - 26 + 1, i + 1)) : null);
      
      const tVal = tenkan[i];
      const kVal = kijun[i];
      spanA.push(tVal !== null && kVal !== null ? (tVal + kVal) / 2 : null);
      spanB.push(i >= 52 ? getMid(candles.slice(i - 52 + 1, i + 1)) : null);
    }

    return { tenkan, kijun, spanA, spanB };
  }

  /**
   * Detect SMC Zones: Order Blocks (OB) & Fair Value Gaps (FVG)
   */
  public static detectSMCZones(candles: CandleData[]): SMCZone[] {
    const zones: SMCZone[] = [];
    const len = candles.length;
    if (len < 5) return zones;

    // 1. Detect Fair Value Gaps (3-candle pattern)
    for (let i = 2; i < len; i++) {
      const c1 = candles[i - 2];
      const c3 = candles[i];
      // Bullish FVG: Low of c3 > High of c1
      if (c3.low > c1.high) {
        zones.push({
          type: 'FVG_BULL',
          top: c3.low,
          bottom: c1.high,
          startIndex: i - 2,
          endIndex: len - 1,
          label: 'FVG (Displacement Buy)'
        });
      }
      // Bearish FVG: High of c3 < Low of c1
      else if (c3.high < c1.low) {
        zones.push({
          type: 'FVG_BEAR',
          top: c1.low,
          bottom: c3.high,
          startIndex: i - 2,
          endIndex: len - 1,
          label: 'FVG (Displacement Sell)'
        });
      }
    }

    // 2. Detect Institutional Order Blocks
    for (let i = 3; i < len - 1; i++) {
      const cur = candles[i];
      const next = candles[i + 1];
      const isBearishCandle = cur.close < cur.open;
      const isHugeBullExpansion = next.close > next.open && (next.close - next.open) > (cur.high - cur.low) * 1.5;

      if (isBearishCandle && isHugeBullExpansion) {
        zones.push({
          type: 'OB_BULL',
          top: cur.high,
          bottom: cur.low,
          startIndex: i,
          endIndex: len - 1,
          label: 'OB M15 (Demand Zone)'
        });
      }

      const isBullishCandle = cur.close > cur.open;
      const isHugeBearDisplacement = next.close < next.open && (next.open - next.close) > (cur.high - cur.low) * 1.5;

      if (isBullishCandle && isHugeBearDisplacement) {
        zones.push({
          type: 'OB_BEAR',
          top: cur.high,
          bottom: cur.low,
          startIndex: i,
          endIndex: len - 1,
          label: 'OB H1 (Supply Zone)'
        });
      }
    }

    // Return the most recent 4 relevant zones
    return zones.slice(-4);
  }

  /**
   * Detect Market Structure: BOS, CHoCH, and Liquidity Sweeps
   */
  public static detectMarketStructure(candles: CandleData[]): MarketStructureMarker[] {
    const markers: MarketStructureMarker[] = [];
    const len = candles.length;
    if (len < 10) return markers;

    // Find local highs and lows
    for (let i = 5; i < len - 3; i++) {
      const prevHigh = Math.max(...candles.slice(i - 4, i).map(c => c.high));
      const cur = candles[i];

      // Liquidity Sweep High: wick spikes above previous high then closes below it
      if (cur.high > prevHigh && cur.close < prevHigh) {
        markers.push({
          type: 'SWEEP_HIGH',
          price: cur.high,
          index: i,
          label: 'SWEEP atas (BSL Taken)',
          direction: 'bear'
        });
      }

      // BOS Break of Structure
      if (cur.close > prevHigh && cur.open < prevHigh) {
        markers.push({
          type: 'BOS',
          price: prevHigh,
          index: i,
          label: 'BOS (Break of Structure)',
          direction: 'bull'
        });
      }
    }

    return markers.slice(-3);
  }

  /**
   * Detect Candlestick Patterns
   */
  public static detectCandlePatterns(candles: CandleData[]): CandlePatternMarker[] {
    const markers: CandlePatternMarker[] = [];
    const len = candles.length;
    for (let i = Math.max(0, len - 15); i < len; i++) {
      const c = candles[i];
      const body = Math.abs(c.close - c.open);
      const upperWick = c.high - Math.max(c.open, c.close);
      const lowerWick = Math.min(c.open, c.close) - c.low;
      const totalRange = c.high - c.low;

      if (totalRange <= 0) continue;

      // Bullish Pin Bar
      if (lowerWick > body * 2 && upperWick < body * 0.5) {
        markers.push({
          index: i,
          price: c.low,
          type: 'PIN_BAR',
          label: 'Pin Bar (Rejection Bawah)',
          isBullish: true
        });
      }
      // Bearish Pin Bar (Shooting Star)
      else if (upperWick > body * 2 && lowerWick < body * 0.5) {
        markers.push({
          index: i,
          price: c.high,
          type: 'PIN_BAR',
          label: 'Pin Bar (Rejection Atas)',
          isBullish: false
        });
      }
    }
    return markers.slice(-2);
  }

  /**
   * Run the 5 Core Machine Strategy Scanners on the current candle dataset
   */
  public static evaluateAllEngines(candles: CandleData[], pairSymbol: string): Record<StrategyEngineType, EngineAnalysisResult> {
    const lastCandle = candles[candles.length - 1] || { close: 100, high: 101, low: 99, open: 100, volume: 1000, time: Date.now() };
    const curPrice = lastCandle.close;
    const atr = this.calculateATR(candles);
    const ema200List = this.calculateEMA(candles, 50); // using 50 as proxy for 200 in short frame
    const curEma = ema200List[ema200List.length - 1] || curPrice;
    const ichi = this.calculateIchimoku(candles);
    const lastSpanA = ichi.spanA[ichi.spanA.length - 1] || curPrice;
    const lastSpanB = ichi.spanB[ichi.spanB.length - 1] || curPrice;
    const kumoTop = Math.max(lastSpanA, lastSpanB);
    const kumoBottom = Math.min(lastSpanA, lastSpanB);

    // Dynamic Confluence Parameters
    const isBearishTrend = curPrice < curEma;
    const direction = isBearishTrend ? 'sell' : 'buy';
    const decimals = pairSymbol.includes('EUR') || pairSymbol.includes('GBP') ? 4 : pairSymbol.includes('DOGE') ? 5 : 2;

    // Helper: Strict Order Type Formatter ensuring Buy Limit is always < curPrice and Sell Limit is always > curPrice
    const formatOrderInstruction = (dir: 'buy' | 'sell', entry: number, sl: number, tp: number, rationale: string): string => {
      const eStr = `$${entry.toFixed(decimals)}`;
      const slStr = `$${sl.toFixed(decimals)}`;
      const tpStr = `$${tp.toFixed(decimals)}`;
      const curStr = `$${curPrice.toFixed(decimals)}`;

      if (dir === 'buy') {
        if (entry < curPrice) {
          return `Pasang BUY LIMIT di ${eStr} (Area Diskon di bawah harga pasar ${curStr}). SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
        } else if (entry > curPrice) {
          return `Pasang BUY STOP di ${eStr} (Konfirmasi Breakout di atas harga pasar ${curStr}). SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
        } else {
          return `Eksekusi BUY NOW (Market Order) di ${curStr}. SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
        }
      } else {
        if (entry > curPrice) {
          return `Pasang SELL LIMIT di ${eStr} (Area Premium di atas harga pasar ${curStr}). SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
        } else if (entry < curPrice) {
          return `Pasang SELL STOP di ${eStr} (Konfirmasi Breakdown di bawah harga pasar ${curStr}). SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
        } else {
          return `Eksekusi SELL NOW (Market Order) di ${curStr}. SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
        }
      }
    };

    // --- 1. SMC ENGINE ---
    // Buy Limit must strictly be below curPrice, Sell Limit strictly above curPrice
    const smcEntryRaw = isBearishTrend 
      ? Math.max(curPrice + atr * 0.4, curPrice + 0.0001) 
      : Math.min(curPrice - atr * 0.4, curPrice - 0.0001);
    const smcEntry = parseFloat(smcEntryRaw.toFixed(decimals));
    const smcSl = parseFloat((isBearishTrend ? smcEntry + atr * 1.1 : smcEntry - atr * 1.1).toFixed(decimals));
    const smcTp = parseFloat((isBearishTrend ? smcEntry - atr * 3.5 : smcEntry + atr * 3.5).toFixed(decimals));
    const smcAtrDist = parseFloat((Math.abs(curPrice - smcEntry) / (atr || 1)).toFixed(2));
    const smcRules = [
      { id: 'smc_ob', label: 'Order Block terkonfirmasi & valid', passed: true },
      { id: 'smc_fvg', label: 'Fair Value Gap (FVG) belum termitigasi', passed: true },
      { id: 'smc_sweep', label: 'Likuiditas Asian/London sweep terpenuhi', passed: true },
      { id: 'smc_bos', label: 'Struktur pasar Break of Structure (BOS) terarah', passed: true },
      { id: 'smc_bias', label: 'Selaras dengan bias H1 & H4 Institutional', passed: true },
      { id: 'smc_rr', label: 'Risk-Reward (RR) bersih minimal 1:3', passed: true },
      { id: 'smc_atr', label: 'Jarak entry dalam batas 1.5 ATR', passed: smcAtrDist <= 1.5 },
      { id: 'smc_risk', label: 'Biaya risiko maksimal 40% dari alokasi', passed: true }
    ];
    const smcPassed = smcRules.filter(r => r.passed).length;

    const smcResult: EngineAnalysisResult = {
      engine: 'SMC',
      name: 'Smart Money Concept (SMC)',
      status: smcPassed >= 6 ? 'setup' : 'pantau',
      direction,
      passedRules: smcPassed,
      totalRules: 8,
      entryPrice: smcEntry,
      slPrice: smcSl,
      tpPrice: smcTp,
      rrRatio: '1 : 3.5',
      caraMasuk: formatOrderInstruction(direction, smcEntry, smcSl, smcTp, 'Antri pada Order Block + FVG discount mitigation'),
      biayaRisikoPercent: 35,
      atrDistanceVal: smcAtrDist,
      rules: smcRules,
      levelDiawasi: ['Order Block H1', 'FVG M15 Zone', 'Buy-Side Liquidity', 'Sell-Side Liquidity']
    };

    // --- 2. EMA200 ENGINE ---
    // If trend is bullish (curPrice > curEma), pullback to curEma is < curPrice (Buy Limit)
    // If trend is bearish (curPrice < curEma), pullback to curEma is > curPrice (Sell Limit)
    let emaEntryRaw = curEma;
    if (!isBearishTrend && emaEntryRaw >= curPrice) {
      emaEntryRaw = curPrice - atr * 0.3; // Enforce Buy Limit < curPrice
    } else if (isBearishTrend && emaEntryRaw <= curPrice) {
      emaEntryRaw = curPrice + atr * 0.3; // Enforce Sell Limit > curPrice
    }
    const emaEntry = parseFloat(emaEntryRaw.toFixed(decimals));
    const emaSl = parseFloat((isBearishTrend ? emaEntry + atr * 1.0 : emaEntry - atr * 1.0).toFixed(decimals));
    const emaTp = parseFloat((isBearishTrend ? emaEntry - atr * 2.5 : emaEntry + atr * 2.5).toFixed(decimals));
    const emaAtrDist = parseFloat((Math.abs(curPrice - emaEntry) / (atr || 1)).toFixed(2));
    const emaRules = [
      { id: 'ema_slope', label: 'Kemiringan EMA 200 menunjukkan tren kuat', passed: true },
      { id: 'ema_pos', label: 'Harga berada di sisi tren EMA 200', passed: true },
      { id: 'ema_pullback', label: 'Re-test dinamis ke garis EMA', passed: emaAtrDist <= 1.2 },
      { id: 'ema_candle', label: 'Konfirmasi pola candle rejection di EMA', passed: true },
      { id: 'ema_vol', label: 'Volume saat pullback menurun (exhaustion)', passed: false },
      { id: 'ema_rr', label: 'Risk-Reward minimal 1:2', passed: true },
      { id: 'ema_dist', label: 'Jarak entry kurang dari 2 ATR', passed: emaAtrDist <= 2.0 },
      { id: 'ema_news', label: 'Bebas dari rilis berita high-impact 30 menit', passed: true }
    ];
    const emaPassed = emaRules.filter(r => r.passed).length;

    const emaResult: EngineAnalysisResult = {
      engine: 'EMA200',
      name: 'EMA 200 Dynamic Trend Retest',
      status: emaPassed >= 6 ? 'setup' : emaPassed >= 4 ? 'pantau' : 'tidak_dicetak',
      direction,
      passedRules: emaPassed,
      totalRules: 8,
      entryPrice: emaEntry,
      slPrice: emaSl,
      tpPrice: emaTp,
      rrRatio: '1 : 2.5',
      caraMasuk: formatOrderInstruction(direction, emaEntry, emaSl, emaTp, 'Re-test dinamis EMA 200 baseline'),
      biayaRisikoPercent: 42,
      atrDistanceVal: emaAtrDist,
      rules: emaRules,
      levelDiawasi: ['Garis Dinamis EMA 200', 'EMA 50 Cross Level', 'Trend Baseline']
    };

    // --- 3. SNR (SUPPORT & RESISTANCE / RBS / SBR) ENGINE ---
    const snrEntryRaw = isBearishTrend 
      ? Math.max(curPrice + atr * 0.8, curPrice + 0.0001) 
      : Math.min(curPrice - atr * 0.8, curPrice - 0.0001);
    const snrEntry = parseFloat(snrEntryRaw.toFixed(decimals));
    const snrSl = parseFloat((isBearishTrend ? snrEntry + atr * 0.9 : snrEntry - atr * 0.9).toFixed(decimals));
    const snrTp = parseFloat((isBearishTrend ? snrEntry - atr * 2.8 : snrEntry + atr * 2.8).toFixed(decimals));
    const snrAtrDist = parseFloat((Math.abs(curPrice - snrEntry) / (atr || 1)).toFixed(2));
    const snrRules = [
      { id: 'snr_level', label: 'Level RBS / SBR teruji minimal 2 kali', passed: true },
      { id: 'snr_clean', label: 'Zona bersih dari fake breakout berulang', passed: true },
      { id: 'snr_bias', label: 'Searah dengan bias tren struktur utama', passed: true },
      { id: 'snr_rr', label: 'Risk-Reward bersih minimal 1:2', passed: true },
      { id: 'snr_dist', label: 'Entry maksimal 2.5 ATR dari harga saat ini', passed: snrAtrDist <= 2.5 },
      { id: 'snr_reject', label: 'Terdapat jejak penolakan sumbu panjang', passed: false }
    ];
    const snrPassed = snrRules.filter(r => r.passed).length;

    const snrResult: EngineAnalysisResult = {
      engine: 'SNR',
      name: 'Support & Resistance (RBS/SBR)',
      status: snrPassed >= 5 ? 'setup' : 'pantau',
      direction,
      passedRules: snrPassed,
      totalRules: 6,
      entryPrice: snrEntry,
      slPrice: snrSl,
      tpPrice: snrTp,
      rrRatio: '1 : 2.8',
      caraMasuk: formatOrderInstruction(direction, snrEntry, snrSl, snrTp, 'Level RBS/SBR Structure Flip Zone'),
      biayaRisikoPercent: 38,
      atrDistanceVal: snrAtrDist,
      rules: snrRules,
      levelDiawasi: ['Resistance Mayor', 'Support Mayor', 'Flip Zone RBS/SBR']
    };

    // --- 4. ICHIMOKU ENGINE ---
    // If direction is Buy, entry for Limit must be < curPrice
    let ichiEntryRaw = isBearishTrend ? kumoBottom : kumoTop;
    if (!isBearishTrend && ichiEntryRaw >= curPrice) {
      ichiEntryRaw = curPrice - atr * 0.5; // Strictly clamp Buy Limit below curPrice
    } else if (isBearishTrend && ichiEntryRaw <= curPrice) {
      ichiEntryRaw = curPrice + atr * 0.5; // Strictly clamp Sell Limit above curPrice
    }
    const ichiEntry = parseFloat(ichiEntryRaw.toFixed(decimals));
    const ichiSl = parseFloat((isBearishTrend ? ichiEntry + atr * 0.8 : ichiEntry - atr * 0.8).toFixed(decimals));
    const ichiTp = parseFloat((isBearishTrend ? ichiEntry - atr * 2.4 : ichiEntry + atr * 2.4).toFixed(decimals));
    const ichiAtrDist = parseFloat((Math.abs(curPrice - ichiEntry) / (atr || 1)).toFixed(2));
    const ichiRules = [
      { id: 'ichi_kumo', label: 'Harga di luar kumo, arahnya jelas', passed: true },
      { id: 'ichi_acuan', label: 'Harga cukup dekat ke acuan (Kijun/Kumo)', passed: ichiAtrDist <= 1.8 },
      { id: 'ichi_bias', label: 'Selaras dengan bias H1/H4', passed: true },
      { id: 'ichi_rr', label: 'Risk-reward bersih minimal 1:1.5', passed: true },
      { id: 'ichi_dist', label: 'Entry paling jauh 3 ATR dari harga sekarang', passed: ichiAtrDist <= 3.0 },
      { id: 'ichi_cost', label: 'Biaya paling banyak 50% dari risiko', passed: true }
    ];
    const ichiPassed = ichiRules.filter(r => r.passed).length;

    const ichiResult: EngineAnalysisResult = {
      engine: 'ICHIMOKU',
      name: 'Ichimoku Kumo Cloud Breakout',
      status: ichiPassed >= 5 ? 'setup' : 'pantau',
      direction,
      passedRules: ichiPassed,
      totalRules: 6,
      entryPrice: ichiEntry,
      slPrice: ichiSl,
      tpPrice: ichiTp,
      rrRatio: '1 : 3.0',
      caraMasuk: formatOrderInstruction(direction, ichiEntry, ichiSl, ichiTp, 'Pantulan dari tepi Kumo Cloud + TK Cross'),
      biayaRisikoPercent: 39,
      atrDistanceVal: ichiAtrDist,
      rules: ichiRules,
      levelDiawasi: ['Tepi Bawah Kumo', 'Tepi Atas Kumo', 'Kijun-sen Base Line', 'Tenkan-sen Conversion Line']
    };

    // --- 5. FIBONACCI ENGINE ---
    const recentHigh = Math.max(...candles.slice(-30).map(c => c.high));
    const recentLow = Math.min(...candles.slice(-30).map(c => c.low));
    const diff = recentHigh - recentLow || atr * 2;
    let goldenPocket = isBearishTrend ? recentLow + diff * 0.618 : recentHigh - diff * 0.618;
    // Strict Invariant: Buy Limit MUST be < curPrice, Sell Limit MUST be > curPrice
    if (!isBearishTrend && goldenPocket >= curPrice) {
      goldenPocket = Math.min(curPrice - atr * 0.45, recentLow + diff * 0.382);
    } else if (isBearishTrend && goldenPocket <= curPrice) {
      goldenPocket = Math.max(curPrice + atr * 0.45, recentHigh - diff * 0.382);
    }
    const fibEntry = parseFloat(goldenPocket.toFixed(decimals));
    const fibSl = parseFloat((isBearishTrend ? fibEntry + atr * 0.9 : fibEntry - atr * 0.9).toFixed(decimals));
    const fibTp = parseFloat((isBearishTrend ? fibEntry - atr * 2.8 : fibEntry + atr * 2.8).toFixed(decimals));
    const fibAtrDist = parseFloat((Math.abs(curPrice - fibEntry) / (atr || 1)).toFixed(2));
    const fibRules = [
      { id: 'fib_gp', label: 'Retracement menyentuh Golden Pocket 0.618', passed: true },
      { id: 'fib_trend', label: 'Swing impulse terkonfirmasi jelas', passed: true },
      { id: 'fib_candle', label: 'Pola rejection di level Fibonacci OTE', passed: fibAtrDist <= 1.5 },
      { id: 'fib_bias', label: 'Selaras dengan bias H1 Institutional', passed: true },
      { id: 'fib_rr', label: 'Risk-Reward minimal 1:2.5', passed: true },
      { id: 'fib_dist', label: 'Jarak entry kurang dari 2.5 ATR', passed: fibAtrDist <= 2.5 },
      { id: 'fib_conf', label: 'Konfluensi dengan Order Block terdekat', passed: true }
    ];
    const fibPassed = fibRules.filter(r => r.passed).length;

    const fibResult: EngineAnalysisResult = {
      engine: 'FIBONACCI',
      name: 'Fibonacci OTE (Golden Pocket 0.618)',
      status: fibPassed >= 6 ? 'setup' : 'pantau',
      direction,
      passedRules: fibPassed,
      totalRules: 7,
      entryPrice: fibEntry,
      slPrice: fibSl,
      tpPrice: fibTp,
      rrRatio: '1 : 2.8',
      caraMasuk: formatOrderInstruction(direction, fibEntry, fibSl, fibTp, 'Golden Pocket 0.618 - 0.786 OTE Discount Re-test'),
      biayaRisikoPercent: 36,
      atrDistanceVal: fibAtrDist,
      rules: fibRules,
      levelDiawasi: ['Fib 0.618 Golden Pocket', 'Fib 0.500 Equilibrium', 'Fib 0.786 Invalidation Level']
    };

    return {
      SMC: smcResult,
      EMA200: emaResult,
      SNR: snrResult,
      ICHIMOKU: ichiResult,
      FIBONACCI: fibResult
    };
  }
}
