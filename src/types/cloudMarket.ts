export interface CandleData {
  time: number; // epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type StrategyEngineType = 'SMC' | 'SNR' | 'RBS' | 'FIBONACCI' | 'CRT';

export type MachineStatus = 'setup' | 'pantau' | 'tidak_dicetak';

export type MethodState = 'INACTIVE' | 'WATCH' | 'ACTIVE' | 'TRIGGERED' | 'INVALID' | 'EXECUTED';

export type ObserverMethodState = 'PASS' | 'NEUTRAL' | 'WATCH' | 'INVALID' | 'NOT_ACTIVE';

export type MarketEventType = 
  | 'SMC_EVENT' 
  | 'SNR_EVENT' 
  | 'RBS_EVENT' 
  | 'SBR_EVENT' 
  | 'FIB_EVENT' 
  | 'CRT_EVENT' 
  | 'NO_EVENT';

export interface StrategyRule {
  id: string;
  label: string;
  passed: boolean;
  note?: string;
}

export interface StructureReference {
  swingIndex?: number;
  swingPrice?: number;
  swingHigh?: { index: number; price: number };
  swingLow?: { index: number; price: number };
  breakoutLevel?: number;
  breakoutCandleIndex?: number;
  retestZone?: { top: number; bottom: number };
  retestCandleIndex?: number;
  retestPrice?: number;
  flipLevel?: number;
  triggerCondition?: string;
  triggerCandleIndex?: number;
  invalidationLevel: number;
  targetReference: { level: number; description: string };
  evidence: string[];
}

export interface CandidateEvaluationInfo {
  status: 'candidate_valid' | 'candidate_invalid';
  rejectionReason?: string;
  passedRules?: string;
}

export type ExecutionState = 
  | 'SETUP_DETECTED' 
  | 'WAITING_FOR_TRIGGER' 
  | 'TRIGGER_CONFIRMED' 
  | 'ENTRY_READY' 
  | 'EXECUTED' 
  | 'INVALIDATED' 
  | 'NO_VALID_SETUP';

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
  // Strict Single-Method Entry Lineage & Structure Contract (Audit Trail)
  marketCondition?: string;
  setupType?: string;
  setupSource?: string;
  entrySource?: string;
  invalidation?: string;
  selectionReason?: string;
  structureReference?: StructureReference;
  entryType?: 'MARKET_EXECUTION' | 'LIMIT' | 'STOP';
  entryZone?: { top: number; bottom: number };
  triggerCondition?: string;
  invalidationLevel?: number;
  targetReference?: { level: number; description: string };
  evidence?: string[];
  entryDistanceFromStructure?: number;
  entryDistanceFromCurrentPrice?: number;
  distanceFromRetestZone?: number;
  rejectionReason?: string;
  // Forensic Entry & Execution State Contract
  executionState?: ExecutionState;
  methodState?: MethodState;
  methodEvent?: MarketEventType;
  observerStatus?: ObserverMethodState;
  crossMethodContamination?: boolean;
  entryRuleUsed?: string;
  marketZone?: 'UPPER' | 'MIDDLE' | 'LOWER';
  structureTrend?: 'BULLISH' | 'BEARISH' | 'STRUCTURE_NOT_VALID';
  setupDetected?: boolean;
  setupZone?: { top: number; bottom: number };
  triggerRequired?: string;
  triggerDetected?: boolean;
  triggerPrice?: number;
  invalidReason?: string;
  runtimeTrace?: {
    selectedMethod: StrategyEngineType;
    structure: 'BULLISH' | 'BEARISH' | 'STRUCTURE_NOT_VALID';
    direction: 'BUY' | 'SELL' | 'NEUTRAL';
    marketZone: 'UPPER' | 'MIDDLE' | 'LOWER';
    setupDetected: boolean;
    setupZone?: string;
    triggerRequired: string;
    triggerDetected: boolean;
    triggerPrice?: number;
    entryType: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    status: ExecutionState;
    rejectionReason?: string;
    invalidReason?: string;
  };
}

export interface MethodSelectionResult {
  selectedMethod: StrategyEngineType;
  activeMethod?: StrategyEngineType;
  marketCondition: string;
  selectionReason: string;
  result: EngineAnalysisResult;
  candidates: Record<StrategyEngineType, 'candidate_valid' | 'candidate_invalid'>;
  candidateDetails?: Record<StrategyEngineType, CandidateEvaluationInfo>;
  marketEvent?: MarketEventType;
  observerStates?: Record<StrategyEngineType, ObserverMethodState>;
  executionTrace?: {
    activeMethod: StrategyEngineType;
    methodEvent: MarketEventType;
    direction: 'BUY' | 'SELL' | 'NEUTRAL';
    entry: number;
    sl: number;
    tp: number;
    entryRuleUsed: string;
    entrySource: string;
    slSource: string;
    tpSource: string;
    crossMethodEntryContamination: boolean;
    reasonCodes: string[];
    observerBreakdown: Record<StrategyEngineType, ObserverMethodState>;
  };
}

export interface ChartOverlayToggles {
  volume: boolean;
  smc: boolean;         // Order Blocks (OB) & Fair Value Gaps (FVG)
  snr: boolean;         // Major Support & Resistance key levels
  rbs: boolean;         // RBS (Resistance Become Support) & SBR Flip Zones
  fibonacci: boolean;   // Fibonacci Retracement & Golden Pocket (0.618)
  crt: boolean;         // Candle Range Theory (RH, RL, 50% Mid, Judas Sweep)
  polaLilin: boolean;   // Candlestick Pattern identification
}

export interface SNRLevel {
  price: number;
  type: 'SUPPORT' | 'RESISTANCE';
  strength: number; // 1 to 5
  testCount: number;
  lastTestedIndex: number;
  label: string;
}

export interface RBSFlipZone {
  type: 'RBS' | 'SBR'; // RBS = Resistance Become Support (Bullish), SBR = Support Become Resistance (Bearish)
  price: number;
  swingIndex?: number;
  swingPrice?: number;
  breakoutIndex: number;
  breakoutPrice?: number;
  retested: boolean;
  retestIndex?: number;
  retestPrice?: number;
  retestLow?: number;
  retestHigh?: number;
  isConfirmedRejection?: boolean;
  triggerCandleIndex?: number;
  triggerPrice?: number;
  distanceFromRetestZone?: number;
  label: string;
  direction: 'bull' | 'bear';
}

export interface FibonacciLevelItem {
  ratio: number;
  price: number;
  label: string;
  isGoldenPocket?: boolean;
  isOTE?: boolean;
}

export interface FibonacciSetup {
  swingHigh: number;
  swingLow: number;
  isBullish: boolean;
  levels: FibonacciLevelItem[];
  isImpulseValid?: boolean;
  impulseInvalidReason?: string;
  impulseSeparation?: number;
}

export interface CRTRangeSetup {
  rangeHigh: number; // RH
  rangeLow: number;  // RL
  midRange: number;  // 50% Equilibrium
  judasSweepPrice?: number; // Manipulation wick beyond RH or RL
  manipulationType?: 'BULL_TRAP_HIGH' | 'BEAR_TRAP_LOW' | 'NONE';
  targetExpansion: number; // Measured 1.5x / 2.0x range expansion target
  isConfirmed: boolean;
  isSweepClosedOutside?: boolean;
  sweepCandleClose?: number;
  label: string;
}

export interface MarketTickerItem {
  symbol: string;         // e.g. BTCUSDT, SOLUSDT, XAUUSD, EURUSD, US30, NVDA
  displayName: string;    // e.g. BTC/USDT PERP, SOL/USDT PERP, XAU/USD, EUR/USD
  category: 'Semua' | 'Major' | 'AI' | 'Meme' | 'L1/L2' | 'Komoditas' | 'Forex' | 'Indeks Global' | 'Saham' | 'Saham IDX' | 'Saham US';
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
  isFresh?: boolean;
  status?: 'FRESH' | 'TESTED' | 'MITIGATED' | 'LIQUIDITY_TARGET';
  testCount?: number;
  mitigatedIndex?: number;
  volumeStrength?: number;
  candleTime?: number;
}

export interface MarketStructureMarker {
  type: 'BOS' | 'CHOCH' | 'SWEEP_HIGH' | 'SWEEP_LOW';
  price: number;
  index: number;
  originIndex?: number;
  label: string;
  direction: 'bull' | 'bear';
  swingType?: 'HH' | 'HL' | 'LH' | 'LL';
  isConfirmed?: boolean;
}

export interface StructureSwingPoint {
  index: number;
  price: number;
  type: 'HH' | 'HL' | 'LH' | 'LL';
  time?: number;
}

export interface MarketStructureVerification {
  structureBias: 'BULLISH' | 'BEARISH' | 'CHoCH_REVERSAL' | 'RANGING';
  isSignalAlignedWithBOS: boolean;
  isSignalFromFreshOB: boolean;
  isSlProtectedFromSweep: boolean;
  historicalOBCount: number;
  historicalBOSCount: number;
  confidenceScore: number;
  summaryText: string;
}

export interface CandlePatternMarker {
  index: number;
  price: number;
  type: 'PIN_BAR' | 'ENGULFING' | 'DOJI' | 'REJECTION';
  label: string;
  isBullish: boolean;
}
