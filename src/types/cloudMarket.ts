export interface CandleData {
  time: number; // epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type StrategyEngineType = 'SMC' | 'EMA200' | 'SNR' | 'ICHIMOKU' | 'FIBONACCI';

export type MachineStatus = 'setup' | 'pantau' | 'tidak_dicetak';

export interface StrategyRule {
  id: string;
  label: string;
  passed: boolean;
  note?: string;
}

export interface EngineAnalysisResult {
  engine: StrategyEngineType;
  name: string;
  status: MachineStatus;
  direction: 'buy' | 'sell' | 'neutral';
  passedRules: number;
  totalRules: number;
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  rrRatio: string;
  caraMasuk: string;
  biayaRisikoPercent: number;
  atrDistanceVal: number; // in units of ATR from current price
  rules: StrategyRule[];
  levelDiawasi: string[];
}

export interface ChartOverlayToggles {
  volume: boolean;
  zona: boolean;        // Fair Value Gaps & Order Blocks
  garisMesin: boolean;  // Dynamic EMA lines & trend slopes
  struktur: boolean;    // BOS, CHoCH, Liquidity Sweeps
  level: boolean;       // Key SNR & Horizontal levels
  polaLilin: boolean;   // Candlestick Pattern identification
}

export interface MarketTickerItem {
  symbol: string;         // e.g. BTCUSDT, SOLUSDT, XAUUSD, EURUSD
  displayName: string;    // e.g. BTC/USDT PERP, SOL/USDT PERP, XAU/USD, EUR/USD
  category: 'Semua' | 'Major' | 'AI' | 'Meme' | 'L1/L2' | 'Komoditas' | 'Forex';
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  decimals: number;
  isFavorite?: boolean;
}

export interface SMCZone {
  type: 'OB_BULL' | 'OB_BEAR' | 'FVG_BULL' | 'FVG_BEAR';
  top: number;
  bottom: number;
  startIndex: number;
  endIndex: number;
  label: string;
}

export interface MarketStructureMarker {
  type: 'BOS' | 'CHOCH' | 'SWEEP_HIGH' | 'SWEEP_LOW';
  price: number;
  index: number;
  label: string;
  direction: 'bull' | 'bear';
}

export interface CandlePatternMarker {
  index: number;
  price: number;
  type: 'PIN_BAR' | 'ENGULFING' | 'DOJI' | 'REJECTION';
  label: string;
  isBullish: boolean;
}
