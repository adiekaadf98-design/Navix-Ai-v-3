import {
  CandleData,
  StrategyEngineType,
  EngineAnalysisResult,
  MarketTickerItem,
  SMCZone,
  MarketStructureMarker,
  CandlePatternMarker,
  StructureSwingPoint,
  MarketStructureVerification,
  SNRLevel,
  RBSFlipZone,
  FibonacciSetup,
  CRTRangeSetup,
  MethodSelectionResult,
  StructureReference,
  CandidateEvaluationInfo,
  MarketEventType,
  MethodState,
  ObserverMethodState,
  ReasonCode,
  StandardizedTradingSignalSchema
} from '../../types/cloudMarket';

export const INITIAL_MARKET_TICKERS: MarketTickerItem[] = [
  // 🌟 1. Gold, Metals & Commodities Spot
  { symbol: 'XAUUSD', displayName: 'XAU/USD GOLD SPOT', category: 'Komoditas', price: 4368.50, change24h: 0.65, high24h: 4385.0, low24h: 4350.0, volume24h: 8900000000, decimals: 2 },
  { symbol: 'XAGUSD', displayName: 'XAG/USD SILVER SPOT', category: 'Komoditas', price: 66.20, change24h: 1.25, high24h: 67.5, low24h: 65.0, volume24h: 3500000000, decimals: 2 },
  { symbol: 'USOIL', displayName: 'WTI CRUDE OIL SPOT', category: 'Komoditas', price: 100.70, change24h: -0.45, high24h: 102.5, low24h: 99.0, volume24h: 4200000000, decimals: 2 },
  { symbol: 'UKOIL', displayName: 'BRENT CRUDE OIL SPOT', category: 'Komoditas', price: 104.20, change24h: -0.38, high24h: 105.8, low24h: 102.8, volume24h: 3800000000, decimals: 2 },
  { symbol: 'NATGAS', displayName: 'NATURAL GAS SPOT', category: 'Komoditas', price: 2.854, change24h: 1.80, high24h: 2.94, low24h: 2.78, volume24h: 1200000000, decimals: 3 },
  { symbol: 'COPPER', displayName: 'COPPER SPOT', category: 'Komoditas', price: 4.452, change24h: 0.40, high24h: 4.52, low24h: 4.38, volume24h: 850000000, decimals: 3 },
  { symbol: 'PLATINUM', displayName: 'PLATINUM SPOT', category: 'Komoditas', price: 985.00, change24h: 0.75, high24h: 996.0, low24h: 978.0, volume24h: 620000000, decimals: 2 },
  
  // 🌟 2. Forex Major & Cross Pairs
  { symbol: 'EURUSD', displayName: 'EUR/USD FOREX', category: 'Forex', price: 1.1493, change24h: -0.12, high24h: 1.1530, low24h: 1.1460, volume24h: 6200000000, decimals: 4 },
  { symbol: 'GBPUSD', displayName: 'GBP/USD FOREX', category: 'Forex', price: 1.3374, change24h: 0.18, high24h: 1.3420, low24h: 1.3330, volume24h: 4800000000, decimals: 4 },
  { symbol: 'USDJPY', displayName: 'USD/JPY FOREX', category: 'Forex', price: 155.65, change24h: -0.35, high24h: 156.20, low24h: 155.10, volume24h: 5300000000, decimals: 2 },
  { symbol: 'GBPJPY', displayName: 'GBP/JPY FOREX', category: 'Forex', price: 209.90, change24h: 0.22, high24h: 210.50, low24h: 209.20, volume24h: 3900000000, decimals: 2 },
  { symbol: 'EURJPY', displayName: 'EUR/JPY FOREX', category: 'Forex', price: 164.85, change24h: -0.18, high24h: 165.40, low24h: 164.20, volume24h: 3400000000, decimals: 2 },
  { symbol: 'AUDUSD', displayName: 'AUD/USD FOREX', category: 'Forex', price: 0.6540, change24h: 0.15, high24h: 0.6580, low24h: 0.6510, volume24h: 2900000000, decimals: 4 },
  { symbol: 'USDCAD', displayName: 'USD/CAD FOREX', category: 'Forex', price: 1.3980, change24h: -0.10, high24h: 1.4020, low24h: 1.3940, volume24h: 2700000000, decimals: 4 },
  { symbol: 'USDCHF', displayName: 'USD/CHF FOREX', category: 'Forex', price: 0.8870, change24h: 0.08, high24h: 0.8910, low24h: 0.8840, volume24h: 2300000000, decimals: 4 },
  { symbol: 'NZDUSD', displayName: 'NZD/USD FOREX', category: 'Forex', price: 0.5920, change24h: -0.22, high24h: 0.5960, low24h: 0.5890, volume24h: 1900000000, decimals: 4 },
  { symbol: 'EURGBP', displayName: 'EUR/GBP FOREX', category: 'Forex', price: 0.8590, change24h: -0.05, high24h: 0.8620, low24h: 0.8560, volume24h: 2100000000, decimals: 4 },
  { symbol: 'AUDJPY', displayName: 'AUD/JPY FOREX', category: 'Forex', price: 101.80, change24h: 0.30, high24h: 102.30, low24h: 101.20, volume24h: 1800000000, decimals: 2 },
  { symbol: 'CADJPY', displayName: 'CAD/JPY FOREX', category: 'Forex', price: 111.35, change24h: -0.15, high24h: 111.90, low24h: 110.80, volume24h: 1600000000, decimals: 2 },
  { symbol: 'CHFJPY', displayName: 'CHF/JPY FOREX', category: 'Forex', price: 175.40, change24h: 0.28, high24h: 176.10, low24h: 174.80, volume24h: 1400000000, decimals: 2 },
  { symbol: 'EURAUD', displayName: 'EUR/AUD FOREX', category: 'Forex', price: 1.7570, change24h: -0.25, high24h: 1.7630, low24h: 1.7510, volume24h: 1500000000, decimals: 4 },
  { symbol: 'GBPAUD', displayName: 'GBP/AUD FOREX', category: 'Forex', price: 2.0450, change24h: 0.12, high24h: 2.0520, low24h: 2.0380, volume24h: 1700000000, decimals: 4 },

  // 🌟 3. Global Indices & CFD
  { symbol: 'US30', displayName: 'DOW JONES 30 (US30)', category: 'Indeks Global', price: 51780.0, change24h: 0.45, high24h: 52000.0, low24h: 51600.0, volume24h: 15000000000, decimals: 1 },
  { symbol: 'NAS100', displayName: 'NASDAQ 100 (NAS100)', category: 'Indeks Global', price: 26330.0, change24h: 0.85, high24h: 26500.0, low24h: 26200.0, volume24h: 22000000000, decimals: 1 },
  { symbol: 'SPX500', displayName: 'S&P 500 (SPX500)', category: 'Indeks Global', price: 7620.0, change24h: 0.52, high24h: 7660.0, low24h: 7590.0, volume24h: 18000000000, decimals: 1 },
  { symbol: 'GER40', displayName: 'DAX 40 GERMANY (GER40)', category: 'Indeks Global', price: 19350.0, change24h: 0.35, high24h: 19480.0, low24h: 19280.0, volume24h: 8500000000, decimals: 1 },
  { symbol: 'UK100', displayName: 'FTSE 100 UK (UK100)', category: 'Indeks Global', price: 8240.0, change24h: 0.15, high24h: 8290.0, low24h: 8210.0, volume24h: 5200000000, decimals: 1 },
  { symbol: 'JP225', displayName: 'NIKKEI 225 JAPAN (JP225)', category: 'Indeks Global', price: 38900.0, change24h: -0.60, high24h: 39300.0, low24h: 38650.0, volume24h: 9800000000, decimals: 0 },
  { symbol: 'HK50', displayName: 'HANG SENG HONGKONG (HK50)', category: 'Indeks Global', price: 20450.0, change24h: 1.10, high24h: 20700.0, low24h: 20200.0, volume24h: 7400000000, decimals: 1 },
  { symbol: 'DXY', displayName: 'US DOLLAR INDEX (DXY)', category: 'Indeks Global', price: 104.25, change24h: 0.12, high24h: 104.60, low24h: 103.90, volume24h: 4100000000, decimals: 2 },

  // 🌟 4. Saham Bursa Efek Indonesia (IDX / IHSG Blue Chips)
  { symbol: 'BBCA.JK', displayName: 'BANK CENTRAL ASIA (BBCA)', category: 'Saham IDX', price: 6225.0, change24h: 0.80, high24h: 6300.0, low24h: 6175.0, volume24h: 950000000000, decimals: 0 },
  { symbol: 'BBRI.JK', displayName: 'BANK RAKYAT INDONESIA (BBRI)', category: 'Saham IDX', price: 4480.0, change24h: -0.44, high24h: 4530.0, low24h: 4450.0, volume24h: 820000000000, decimals: 0 },
  { symbol: 'BMRI.JK', displayName: 'BANK MANDIRI (BMRI)', category: 'Saham IDX', price: 6350.0, change24h: 0.40, high24h: 6425.0, low24h: 6300.0, volume24h: 680000000000, decimals: 0 },
  { symbol: 'BBNI.JK', displayName: 'BANK NEGARA INDONESIA (BBNI)', category: 'Saham IDX', price: 4980.0, change24h: 0.60, high24h: 5050.0, low24h: 4940.0, volume24h: 430000000000, decimals: 0 },
  { symbol: 'TLKM.JK', displayName: 'TELKOM INDONESIA (TLKM)', category: 'Saham IDX', price: 2820.0, change24h: -0.70, high24h: 2860.0, low24h: 2800.0, volume24h: 410000000000, decimals: 0 },
  { symbol: 'ASII.JK', displayName: 'ASTRA INTERNATIONAL (ASII)', category: 'Saham IDX', price: 4950.0, change24h: 0.20, high24h: 5025.0, low24h: 4920.0, volume24h: 350000000000, decimals: 0 },
  { symbol: 'GOTO.JK', displayName: 'GOTO GOJEK TOKOPEDIA (GOTO)', category: 'Saham IDX', price: 72.0, change24h: 1.41, high24h: 75.0, low24h: 70.0, volume24h: 280000000000, decimals: 0 },
  { symbol: 'UNVR.JK', displayName: 'UNILEVER INDONESIA (UNVR)', category: 'Saham IDX', price: 2180.0, change24h: -0.90, high24h: 2220.0, low24h: 2160.0, volume24h: 180000000000, decimals: 0 },
  { symbol: 'ICBP.JK', displayName: 'INDOFOOD CBP (ICBP)', category: 'Saham IDX', price: 11450.0, change24h: 0.44, high24h: 11600.0, low24h: 11350.0, volume24h: 210000000000, decimals: 0 },
  { symbol: 'AMMN.JK', displayName: 'AMMAN MINERAL (AMMN)', category: 'Saham IDX', price: 9250.0, change24h: 2.20, high24h: 9450.0, low24h: 9100.0, volume24h: 490000000000, decimals: 0 },
  { symbol: 'BRIS.JK', displayName: 'BANK SYARIAH INDONESIA (BRIS)', category: 'Saham IDX', price: 2890.0, change24h: 1.75, high24h: 2950.0, low24h: 2840.0, volume24h: 260000000000, decimals: 0 },
  { symbol: 'BREN.JK', displayName: 'BARITO RENEWABLES (BREN)', category: 'Saham IDX', price: 6700.0, change24h: -1.45, high24h: 6900.0, low24h: 6625.0, volume24h: 380000000000, decimals: 0 },
  { symbol: 'TPIA.JK', displayName: 'CHANDRA ASRI PACIFIC (TPIA)', category: 'Saham IDX', price: 7125.0, change24h: 0.35, high24h: 7250.0, low24h: 7050.0, volume24h: 240000000000, decimals: 0 },
  { symbol: 'ADRO.JK', displayName: 'ADARO ENERGY INDONESIA (ADRO)', category: 'Saham IDX', price: 3680.0, change24h: 1.10, high24h: 3740.0, low24h: 3620.0, volume24h: 310000000000, decimals: 0 },
  { symbol: 'ANTM.JK', displayName: 'ANEKA TAMBANG (ANTM)', category: 'Saham IDX', price: 1590.0, change24h: 2.55, high24h: 1630.0, low24h: 1560.0, volume24h: 290000000000, decimals: 0 },
  { symbol: 'INCO.JK', displayName: 'VALE INDONESIA (INCO)', category: 'Saham IDX', price: 3880.0, change24h: -0.50, high24h: 3950.0, low24h: 3840.0, volume24h: 170000000000, decimals: 0 },
  { symbol: 'PTBA.JK', displayName: 'BUKIT ASAM (PTBA)', category: 'Saham IDX', price: 2740.0, change24h: 0.74, high24h: 2780.0, low24h: 2710.0, volume24h: 140000000000, decimals: 0 },
  { symbol: 'MDKA.JK', displayName: 'MERDEKA COPPER GOLD (MDKA)', category: 'Saham IDX', price: 2150.0, change24h: 1.90, high24h: 2200.0, low24h: 2110.0, volume24h: 190000000000, decimals: 0 },
  { symbol: 'KLBF.JK', displayName: 'KALBE FARMA (KLBF)', category: 'Saham IDX', price: 1460.0, change24h: -0.34, high24h: 1485.0, low24h: 1445.0, volume24h: 120000000000, decimals: 0 },
  { symbol: 'PGAS.JK', displayName: 'PERUSAHAAN GAS NEGARA (PGAS)', category: 'Saham IDX', price: 1530.0, change24h: 0.65, high24h: 1560.0, low24h: 1515.0, volume24h: 160000000000, decimals: 0 },

  // 🌟 5. Major US Stocks (Wall Street Blue Chips & Big Tech)
  { symbol: 'NVDA', displayName: 'NVIDIA CORP (NVDA)', category: 'Saham US', price: 219.0, change24h: 1.85, high24h: 222.5, low24h: 216.0, volume24h: 14000000000, decimals: 2 },
  { symbol: 'TSLA', displayName: 'TESLA INC (TSLA)', category: 'Saham US', price: 369.6, change24h: -0.95, high24h: 375.0, low24h: 365.0, volume24h: 9800000000, decimals: 2 },
  { symbol: 'AAPL', displayName: 'APPLE INC (AAPL)', category: 'Saham US', price: 330.8, change24h: 0.35, high24h: 334.0, low24h: 328.0, volume24h: 8200000000, decimals: 2 },
  { symbol: 'MSFT', displayName: 'MICROSOFT CORP (MSFT)', category: 'Saham US', price: 500.6, change24h: 0.45, high24h: 504.0, low24h: 497.0, volume24h: 7900000000, decimals: 2 },
  { symbol: 'AMZN', displayName: 'AMAZON.COM INC (AMZN)', category: 'Saham US', price: 215.4, change24h: 1.10, high24h: 218.0, low24h: 213.0, volume24h: 6800000000, decimals: 2 },
  { symbol: 'GOOGL', displayName: 'ALPHABET / GOOGLE (GOOGL)', category: 'Saham US', price: 195.2, change24h: 0.65, high24h: 198.0, low24h: 193.0, volume24h: 6200000000, decimals: 2 },
  { symbol: 'META', displayName: 'META PLATFORMS (META)', category: 'Saham US', price: 685.0, change24h: 1.35, high24h: 692.0, low24h: 678.0, volume24h: 5800000000, decimals: 2 },
  { symbol: 'AMD', displayName: 'ADVANCED MICRO DEVICES (AMD)', category: 'Saham US', price: 148.5, change24h: 2.10, high24h: 152.0, low24h: 145.0, volume24h: 5400000000, decimals: 2 },
  { symbol: 'COIN', displayName: 'COINBASE GLOBAL (COIN)', category: 'Saham US', price: 295.0, change24h: 3.50, high24h: 305.0, low24h: 288.0, volume24h: 4200000000, decimals: 2 },
  { symbol: 'MSTR', displayName: 'MICROSTRATEGY (MSTR)', category: 'Saham US', price: 420.0, change24h: 4.80, high24h: 435.0, low24h: 405.0, volume24h: 5100000000, decimals: 2 },
  { symbol: 'PLTR', displayName: 'PALANTIR TECHNOLOGIES (PLTR)', category: 'Saham US', price: 68.4, change24h: 2.20, high24h: 70.5, low24h: 66.8, volume24h: 3600000000, decimals: 2 },
  { symbol: 'NFLX', displayName: 'NETFLIX INC (NFLX)', category: 'Saham US', price: 860.0, change24h: 1.20, high24h: 872.0, low24h: 852.0, volume24h: 3100000000, decimals: 2 },
  { symbol: 'AVGO', displayName: 'BROADCOM INC (AVGO)', category: 'Saham US', price: 185.0, change24h: 2.45, high24h: 189.0, low24h: 181.5, volume24h: 3700000000, decimals: 2 },
  { symbol: 'ORCL', displayName: 'ORACLE CORP (ORCL)', category: 'Saham US', price: 178.5, change24h: 0.85, high24h: 182.0, low24h: 176.0, volume24h: 2500000000, decimals: 2 },
  { symbol: 'INTC', displayName: 'INTEL CORP (INTC)', category: 'Saham US', price: 22.40, change24h: -1.25, high24h: 23.10, low24h: 22.10, volume24h: 2800000000, decimals: 2 },
  { symbol: 'BABA', displayName: 'ALIBABA GROUP (BABA)', category: 'Saham US', price: 88.50, change24h: 1.60, high24h: 90.20, low24h: 87.10, volume24h: 2200000000, decimals: 2 },
  { symbol: 'DIS', displayName: 'WALT DISNEY CO (DIS)', category: 'Saham US', price: 112.0, change24h: 0.45, high24h: 114.2, low24h: 110.8, volume24h: 1800000000, decimals: 2 },
  { symbol: 'JPM', displayName: 'JPMORGAN CHASE (JPM)', category: 'Saham US', price: 245.0, change24h: 0.55, high24h: 248.5, low24h: 242.0, volume24h: 2100000000, decimals: 2 },
  { symbol: 'V', displayName: 'VISA INC (V)', category: 'Saham US', price: 310.0, change24h: 0.25, high24h: 314.0, low24h: 307.0, volume24h: 1600000000, decimals: 2 },
  { symbol: 'PYPL', displayName: 'PAYPAL HOLDINGS (PYPL)', category: 'Saham US', price: 84.50, change24h: 1.80, high24h: 86.20, low24h: 83.10, volume24h: 1900000000, decimals: 2 },

  // 🌟 6. Major Crypto & High Cap
  { symbol: 'BTCUSDT', displayName: 'BTCUSDT PERP', category: 'Major', price: 76690.0, change24h: -1.52, high24h: 77800.0, low24h: 75900.0, volume24h: 3820000000, decimals: 2 },
  { symbol: 'ETHUSDT', displayName: 'ETHUSDT PERP', category: 'Major', price: 2519.98, change24h: -1.85, high24h: 2595.0, low24h: 2480.0, volume24h: 1940000000, decimals: 2 },
  { symbol: 'SOLUSDT', displayName: 'SOLUSDT PERP', category: 'Major', price: 100.89, change24h: 1.25, high24h: 103.4, low24h: 98.2, volume24h: 1420000000, decimals: 2 },
  { symbol: 'BNBUSDT', displayName: 'BNBUSDT PERP', category: 'Major', price: 723.18, change24h: 0.85, high24h: 735.0, low24h: 712.0, volume24h: 520000000, decimals: 2 },
  { symbol: 'XRPUSDT', displayName: 'XRPUSDT PERP', category: 'Major', price: 1.3618, change24h: 3.45, high24h: 1.42, low24h: 1.31, volume24h: 890000000, decimals: 4 },
  { symbol: 'ADAUSDT', displayName: 'ADAUSDT PERP', category: 'Major', price: 0.2366, change24h: 1.15, high24h: 0.245, low24h: 0.230, volume24h: 420000000, decimals: 4 },
  { symbol: 'LINKUSDT', displayName: 'LINKUSDT PERP', category: 'Major', price: 14.85, change24h: 2.40, high24h: 15.30, low24h: 14.40, volume24h: 360000000, decimals: 3 },
  { symbol: 'DOTUSDT', displayName: 'DOTUSDT PERP', category: 'Major', price: 5.65, change24h: -0.80, high24h: 5.85, low24h: 5.50, volume24h: 240000000, decimals: 3 },
  { symbol: 'AVAXUSDT', displayName: 'AVAXUSDT PERP', category: 'Major', price: 28.40, change24h: 2.30, high24h: 29.50, low24h: 27.20, volume24h: 230000000, decimals: 2 },
  { symbol: 'TRXUSDT', displayName: 'TRXUSDT PERP', category: 'Major', price: 0.3398, change24h: 0.27, high24h: 0.345, low24h: 0.335, volume24h: 210000000, decimals: 4 },
  { symbol: 'LTCUSDT', displayName: 'LTCUSDT PERP', category: 'Major', price: 88.40, change24h: 1.45, high24h: 91.20, low24h: 86.80, volume24h: 280000000, decimals: 2 },
  { symbol: 'BCHUSDT', displayName: 'BCHUSDT PERP', category: 'Major', price: 345.0, change24h: -0.65, high24h: 356.0, low24h: 338.0, volume24h: 190000000, decimals: 2 },
  { symbol: 'ATOMUSDT', displayName: 'ATOMUSDT PERP', category: 'Major', price: 4.85, change24h: 0.40, high24h: 5.05, low24h: 4.70, volume24h: 150000000, decimals: 3 },
  { symbol: 'ETCUSDT', displayName: 'ETCUSDT PERP', category: 'Major', price: 22.60, change24h: -1.10, high24h: 23.40, low24h: 22.10, volume24h: 160000000, decimals: 2 },
  { symbol: 'XLMUSDT', displayName: 'XLMUSDT PERP', category: 'Major', price: 0.2150, change24h: 2.10, high24h: 0.228, low24h: 0.208, volume24h: 180000000, decimals: 4 },
  { symbol: 'FILUSDT', displayName: 'FILUSDT PERP', category: 'Major', price: 4.20, change24h: -0.45, high24h: 4.38, low24h: 4.10, volume24h: 130000000, decimals: 3 },
  { symbol: 'ZECUSDT', displayName: 'ZECUSDT PERP', category: 'Major', price: 1132.37, change24h: -0.32, high24h: 1170.0, low24h: 1120.0, volume24h: 340000000, decimals: 2 },

  // 🌟 7. AI & DePIN Web3 Tokens
  { symbol: 'RENDERUSDT', displayName: 'RENDERUSDT PERP', category: 'AI', price: 6.42, change24h: 4.12, high24h: 6.75, low24h: 6.12, volume24h: 260000000, decimals: 3 },
  { symbol: 'TAOUSDT', displayName: 'TAOUSDT PERP', category: 'AI', price: 382.5, change24h: 5.60, high24h: 395.0, low24h: 360.0, volume24h: 190000000, decimals: 2 },
  { symbol: 'FETUSDT', displayName: 'FETUSDT PERP', category: 'AI', price: 1.28, change24h: 1.95, high24h: 1.34, low24h: 1.22, volume24h: 150000000, decimals: 3 },
  { symbol: 'WLDUSDT', displayName: 'WLDUSDT PERP', category: 'AI', price: 2.15, change24h: -0.85, high24h: 2.25, low24h: 2.08, volume24h: 130000000, decimals: 3 },
  { symbol: 'NEARUSDT', displayName: 'NEARUSDT PERP', category: 'AI', price: 2.313, change24h: -2.15, high24h: 2.45, low24h: 2.26, volume24h: 240000000, decimals: 3 },
  { symbol: 'ICPUSDT', displayName: 'ICPUSDT PERP', category: 'AI', price: 9.85, change24h: 1.45, high24h: 10.30, low24h: 9.50, volume24h: 180000000, decimals: 3 },
  { symbol: 'GRTUSDT', displayName: 'GRTUSDT PERP', category: 'AI', price: 0.185, change24h: 2.80, high24h: 0.194, low24h: 0.178, volume24h: 110000000, decimals: 4 },
  { symbol: 'ARUSDT', displayName: 'ARUSDT PERP', category: 'AI', price: 16.40, change24h: 3.20, high24h: 17.20, low24h: 15.80, volume24h: 140000000, decimals: 3 },
  { symbol: 'THETAUSDT', displayName: 'THETAUSDT PERP', category: 'AI', price: 1.45, change24h: 0.90, high24h: 1.52, low24h: 1.40, volume24h: 95000000, decimals: 3 },
  { symbol: 'AKTUSDT', displayName: 'AKTUSDT PERP', category: 'AI', price: 2.95, change24h: 4.80, high24h: 3.12, low24h: 2.80, volume24h: 75000000, decimals: 3 },
  { symbol: 'RLCUSDT', displayName: 'RLCUSDT PERP', category: 'AI', price: 1.85, change24h: 1.15, high24h: 1.94, low24h: 1.78, volume24h: 45000000, decimals: 3 },
  { symbol: 'IOSTUSDT', displayName: 'IOSTUSDT PERP', category: 'AI', price: 0.0062, change24h: -0.80, high24h: 0.0065, low24h: 0.0060, volume24h: 35000000, decimals: 5 },
  { symbol: 'OCEANUSDT', displayName: 'OCEANUSDT PERP', category: 'AI', price: 0.58, change24h: 1.30, high24h: 0.61, low24h: 0.56, volume24h: 40000000, decimals: 4 },

  // 🌟 8. Meme Coins & Community Tokens
  { symbol: 'DOGEUSDT', displayName: 'DOGEUSDT PERP', category: 'Meme', price: 0.14089, change24h: 2.15, high24h: 0.148, low24h: 0.136, volume24h: 670000000, decimals: 5 },
  { symbol: 'SHIBUSDT', displayName: 'SHIBUSDT PERP', category: 'Meme', price: 0.0000185, change24h: 1.40, high24h: 0.0000192, low24h: 0.0000180, volume24h: 190000000, decimals: 7 },
  { symbol: 'PEPEUSDT', displayName: 'PEPEUSDT PERP', category: 'Meme', price: 0.0000104, change24h: 7.20, high24h: 0.0000112, low24h: 0.0000096, volume24h: 420000000, decimals: 7 },
  { symbol: 'WIFUSDT', displayName: 'WIFUSDT PERP', category: 'Meme', price: 1.84, change24h: -3.10, high24h: 1.98, low24h: 1.78, volume24h: 280000000, decimals: 3 },
  { symbol: 'BONKUSDT', displayName: 'BONKUSDT PERP', category: 'Meme', price: 0.0000214, change24h: 4.50, high24h: 0.0000228, low24h: 0.0000201, volume24h: 160000000, decimals: 7 },
  { symbol: 'FLOKIUSDT', displayName: 'FLOKIUSDT PERP', category: 'Meme', price: 0.000142, change24h: 3.80, high24h: 0.000152, low24h: 0.000135, volume24h: 140000000, decimals: 6 },
  { symbol: 'BOMEUSDT', displayName: 'BOMEUSDT PERP', category: 'Meme', price: 0.00685, change24h: 1.90, high24h: 0.0072, low24h: 0.0065, volume24h: 90000000, decimals: 5 },
  { symbol: 'POPCATUSDT', displayName: 'POPCATUSDT PERP', category: 'Meme', price: 1.24, change24h: 5.40, high24h: 1.35, low24h: 1.15, volume24h: 120000000, decimals: 3 },
  { symbol: 'MEMEUSDT', displayName: 'MEMEUSDT PERP', category: 'Meme', price: 0.0125, change24h: -1.40, high24h: 0.0132, low24h: 0.0121, volume24h: 65000000, decimals: 4 },
  { symbol: 'MEWUSDT', displayName: 'MEWUSDT PERP', category: 'Meme', price: 0.0084, change24h: 2.30, high24h: 0.0089, low24h: 0.0080, volume24h: 55000000, decimals: 5 },
  { symbol: '1000SATSUSDT', displayName: '1000SATSUSDT PERP', category: 'Meme', price: 0.000215, change24h: 1.10, high24h: 0.000228, low24h: 0.000205, volume24h: 80000000, decimals: 6 },

  // 🌟 9. Layer 1 & Layer 2 Ecosystems
  { symbol: 'SUIUSDT', displayName: 'SUIUSDT PERP', category: 'L1/L2', price: 2.85, change24h: 6.80, high24h: 2.98, low24h: 2.62, volume24h: 510000000, decimals: 3 },
  { symbol: 'APTUSDT', displayName: 'APTUSDT PERP', category: 'L1/L2', price: 8.65, change24h: -1.20, high24h: 9.10, low24h: 8.45, volume24h: 140000000, decimals: 2 },
  { symbol: 'ARBUSDT', displayName: 'ARBUSDT PERP', category: 'L1/L2', price: 0.582, change24h: 0.75, high24h: 0.610, low24h: 0.570, volume24h: 110000000, decimals: 3 },
  { symbol: 'OPUSDT', displayName: 'OPUSDT PERP', category: 'L1/L2', price: 1.74, change24h: 1.10, high24h: 1.82, low24h: 1.68, volume24h: 125000000, decimals: 3 },
  { symbol: 'SEIUSDT', displayName: 'SEIUSDT PERP', category: 'L1/L2', price: 0.455, change24h: 3.20, high24h: 0.478, low24h: 0.435, volume24h: 95000000, decimals: 4 },
  { symbol: 'TIAUSDT', displayName: 'TIAUSDT PERP', category: 'L1/L2', price: 4.65, change24h: -2.10, high24h: 4.90, low24h: 4.50, volume24h: 115000000, decimals: 3 },
  { symbol: 'INJUSDT', displayName: 'INJUSDT PERP', category: 'L1/L2', price: 18.80, change24h: 1.80, high24h: 19.50, low24h: 18.10, volume24h: 85000000, decimals: 2 },
  { symbol: 'STXUSDT', displayName: 'STXUSDT PERP', category: 'L1/L2', price: 1.68, change24h: 0.95, high24h: 1.75, low24h: 1.62, volume24h: 70000000, decimals: 3 },
  { symbol: 'POLUSDT', displayName: 'POL (MATIC) PERP', category: 'L1/L2', price: 0.412, change24h: 1.40, high24h: 0.430, low24h: 0.400, volume24h: 90000000, decimals: 4 },
  { symbol: 'THEUSDT', displayName: 'THEUSDT PERP', category: 'L1/L2', price: 0.0678, change24h: 2.85, high24h: 0.072, low24h: 0.064, volume24h: 180000000, decimals: 4 },
  { symbol: 'FTMUSDT', displayName: 'FTMUSDT (SONIC) PERP', category: 'L1/L2', price: 0.685, change24h: 4.10, high24h: 0.720, low24h: 0.650, volume24h: 130000000, decimals: 4 },
  { symbol: 'MANTAUSDT', displayName: 'MANTAUSDT PERP', category: 'L1/L2', price: 0.745, change24h: 0.60, high24h: 0.780, low24h: 0.720, volume24h: 45000000, decimals: 4 },
  { symbol: 'STRKUSDT', displayName: 'STRKUSDT PERP', category: 'L1/L2', price: 0.385, change24h: -1.20, high24h: 0.405, low24h: 0.370, volume24h: 55000000, decimals: 4 },
  { symbol: 'ZKUSDT', displayName: 'ZKUSDT PERP', category: 'L1/L2', price: 0.138, change24h: 1.80, high24h: 0.145, low24h: 0.132, volume24h: 60000000, decimals: 4 },

  // 🌟 10. DeFi & Perpetual Protocols
  { symbol: 'UNIUSDT', displayName: 'UNISWAP (UNI) PERP', category: 'DeFi', price: 8.45, change24h: 1.70, high24h: 8.80, low24h: 8.20, volume24h: 180000000, decimals: 3 },
  { symbol: 'AAVEUSDT', displayName: 'AAVE PERP', category: 'DeFi', price: 182.5, change24h: 3.40, high24h: 190.0, low24h: 175.0, volume24h: 140000000, decimals: 2 },
  { symbol: 'MKRUSDT', displayName: 'MAKER (MKR) PERP', category: 'DeFi', price: 1420.0, change24h: 0.80, high24h: 1460.0, low24h: 1390.0, volume24h: 65000000, decimals: 1 },
  { symbol: 'PENDLEUSDT', displayName: 'PENDLE PERP', category: 'DeFi', price: 4.15, change24h: 5.20, high24h: 4.38, low24h: 3.90, volume24h: 110000000, decimals: 3 },
  { symbol: 'JUPUSDT', displayName: 'JUPITER (JUP) PERP', category: 'DeFi', price: 0.945, change24h: 2.10, high24h: 0.985, low24h: 0.910, volume24h: 135000000, decimals: 4 },
  { symbol: 'RAYUSDT', displayName: 'RAYDIUM (RAY) PERP', category: 'DeFi', price: 4.85, change24h: 6.40, high24h: 5.20, low24h: 4.50, volume24h: 95000000, decimals: 3 },
  { symbol: 'LDOUSDT', displayName: 'LIDO DAO (LDO) PERP', category: 'DeFi', price: 1.12, change24h: -0.40, high24h: 1.18, low24h: 1.08, volume24h: 75000000, decimals: 3 },
  { symbol: 'CRVUSDT', displayName: 'CURVE DAO (CRV) PERP', category: 'DeFi', price: 0.385, change24h: 1.90, high24h: 0.405, low24h: 0.365, volume24h: 60000000, decimals: 4 },
  { symbol: 'SNXUSDT', displayName: 'SYNTHETIX (SNX) PERP', category: 'DeFi', price: 1.45, change24h: 0.50, high24h: 1.52, low24h: 1.40, volume24h: 40000000, decimals: 3 },
  { symbol: 'DYDXUSDT', displayName: 'DYDX PERP', category: 'DeFi', price: 1.05, change24h: -1.10, high24h: 1.10, low24h: 1.01, volume24h: 50000000, decimals: 3 },
  { symbol: 'RUNEUSDT', displayName: 'THORCHAIN (RUNE) PERP', category: 'DeFi', price: 4.65, change24h: 3.80, high24h: 4.90, low24h: 4.40, volume24h: 80000000, decimals: 3 },
  { symbol: 'GMXUSDT', displayName: 'GMX PERP', category: 'DeFi', price: 24.8, change24h: 0.90, high24h: 25.6, low24h: 24.1, volume24h: 35000000, decimals: 2 },
  { symbol: 'CAKEUSDT', displayName: 'PANCAKESWAP (CAKE) PERP', category: 'DeFi', price: 1.85, change24h: 1.20, high24h: 1.94, low24h: 1.78, volume24h: 45000000, decimals: 3 }
];

const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') return '';
  return (typeof process !== 'undefined' && process.env?.NAVIX_INTERNAL_BASE_URL) || 'http://127.0.0.1:3000';
};

export class CloudMarketEngine {
  /**
   * Get duration of a timeframe in milliseconds for bucket aggregation and countdown
   */
  public static getTimeframeDurationMs(timeframe: string): number {
    const tf = timeframe.toLowerCase();
    switch (tf) {
      case '1m':
      case 'm1':
        return 60 * 1000;
      case '3m':
      case 'm3':
        return 3 * 60 * 1000;
      case '5m':
      case 'm5':
        return 5 * 60 * 1000;
      case '15m':
      case 'm15':
        return 15 * 60 * 1000;
      case '30m':
      case 'm30':
        return 30 * 60 * 1000;
      case '1h':
      case 'h1':
        return 60 * 60 * 1000;
      case '2h':
      case 'h2':
        return 2 * 60 * 60 * 1000;
      case '4h':
      case 'h4':
        return 4 * 60 * 60 * 1000;
      case '1d':
      case 'd1':
        return 24 * 60 * 60 * 1000;
      case '1w':
      case 'w1':
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000;
    }
  }

  /**
   * Normalize timeframe string to standard format (e.g. 1m, 5m, 15m, 30m, 1h, 4h, 1d)
   */
  public static normalizeTimeframe(timeframe: string): string {
    const map: Record<string, string> = {
      m1: '1m', m5: '5m', m15: '15m', m30: '30m',
      h1: '1h', h4: '4h', d1: '1d',
      '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
      '1h': '1h', '4h': '4h', '1d': '1d'
    };
    return map[timeframe.toLowerCase()] || '15m';
  }

  /**
   * Fetch real candlestick history from Unified Cloud Market Engine API (/api/market/klines)
   * Supporting All Pairs: Gold (XAUUSD), Forex (EURUSD, GBPUSD, USDJPY, etc.), & Crypto (BTC, ETH, SOL, etc.)
   */
  public static async fetchCandles(symbol: string, timeframe: string = '15m', limit: number = 80, signal?: AbortSignal): Promise<CandleData[]> {
    const cleanSymbol = symbol.replace(/[\/\-_]/g, '').toUpperCase();
    const interval = this.normalizeTimeframe(timeframe);

    // Primary: Query backend Unified Market API Proxy
    try {
      const res = await fetch(`${getBaseApiUrl()}/api/market/klines?symbol=${encodeURIComponent(cleanSymbol)}&interval=${interval}&limit=${limit}`, { signal });
      const contentType = res.headers?.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
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
    } catch (e: any) {
      console.warn(`[CloudMarketEngine] Unified API /api/market/klines failed for ${cleanSymbol}:`, e.message || e);
    }

    // Fallback 1: Direct Binance Public API / Proxy for Crypto pairs
    const isCrypto = !cleanSymbol.includes('EUR') && !cleanSymbol.includes('GBP') && !cleanSymbol.includes('JPY') &&
                     !cleanSymbol.includes('AUD') && !cleanSymbol.includes('XAU') && !cleanSymbol.includes('GOLD') &&
                     !cleanSymbol.includes('.JK');

    if (isCrypto) {
      try {
        const directRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${interval}&limit=${limit}`, { signal });
        if (directRes.ok) {
          const raw = await directRes.json();
          if (Array.isArray(raw) && raw.length > 0) {
            return raw.map((k: any) => ({
              time: Number(k[0]),
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5] || 0)
            }));
          }
        }
      } catch (e: any) {
        console.warn(`[CloudMarketEngine] Direct Binance fallback failed for ${cleanSymbol}:`, e.message || e);
      }
    }

    throw new Error(`DATA_UNAVAILABLE: Gagal mengambil candlestick real dari bursa untuk pair ${cleanSymbol}`);
  }

  public static MAX_PRICE_AGE_SECONDS = 30;
  public static priceCacheMap: Map<string, { price: number; timestamp: number; fetched_at: string; source: string }> = new Map();
  public static fetchPromiseMap: Map<string, Promise<{ price: number; fetched_at: string; timestamp: number; source: string } | null>> = new Map();

  /**
   * PERBAIKAN 1 — CONSTRAINT-BASED LOGIC GATE (Pure Function)
   * Fail-Closed Rules:
   * BUY  → OrderType wajib BUY_LIMIT  → valid jika EntryPrice < LivePrice
   * SELL → OrderType wajib SELL_LIMIT → valid jika EntryPrice > LivePrice
   * Entry == LivePrice dianggap INVALID.
   * OrderType selain BUY_LIMIT/SELL_LIMIT (termasuk BUY_STOP/SELL_STOP) = REJECT.
   */
  public static validateConstraintLogicGate(
    direction: string,
    orderType: string,
    entryPrice: number,
    livePrice: number,
    decimals: number = 2
  ): {
    valid: boolean;
    orderType: 'BUY_LIMIT' | 'SELL_LIMIT' | 'REJECT';
    reasonCode?: ReasonCode;
    reasonNote?: string;
  } {
    const normDir = (direction || '').toUpperCase();
    const normOrder = (orderType || '').toUpperCase().replace(/\s+/g, '_');

    // Rule: STOP orders are strictly forbidden as per Perbaikan 1
    if (normOrder.includes('STOP')) {
      return {
        valid: false,
        orderType: 'REJECT',
        reasonCode: 'STOP_ORDER_FORBIDDEN',
        reasonNote: `Order type '${orderType}' (STOP order) is strictly forbidden. Only BUY_LIMIT and SELL_LIMIT are allowed.`
      };
    }

    if (normOrder !== 'BUY_LIMIT' && normOrder !== 'SELL_LIMIT' && normOrder !== 'BUY_LIMIT' && normOrder !== 'SELL_LIMIT') {
      return {
        valid: false,
        orderType: 'REJECT',
        reasonCode: 'INVALID_ORDER_TYPE',
        reasonNote: `Order type '${orderType}' is invalid. OrderType must be BUY_LIMIT or SELL_LIMIT.`
      };
    }

    // Precision threshold for equality
    const precisionThreshold = Math.pow(10, -decimals) * 0.1;
    if (Math.abs(entryPrice - livePrice) < precisionThreshold) {
      return {
        valid: false,
        orderType: 'REJECT',
        reasonCode: 'ENTRY_EQUAL_TO_LIVE',
        reasonNote: `Entry price ($${entryPrice}) equals live price ($${livePrice}). Instant market execution is prohibited.`
      };
    }

    if (normDir === 'BUY') {
      if (normOrder !== 'BUY_LIMIT') {
        return {
          valid: false,
          orderType: 'REJECT',
          reasonCode: 'INVALID_ORDER_TYPE',
          reasonNote: `Direction BUY requires order type BUY_LIMIT, got ${orderType}.`
        };
      }
      if (entryPrice >= livePrice) {
        return {
          valid: false,
          orderType: 'REJECT',
          reasonCode: 'ENTRY_NOT_BELOW_LIVE',
          reasonNote: `BUY_LIMIT entry price ($${entryPrice}) must be strictly lower than live price ($${livePrice}).`
        };
      }
      return { valid: true, orderType: 'BUY_LIMIT' };
    } else if (normDir === 'SELL') {
      if (normOrder !== 'SELL_LIMIT') {
        return {
          valid: false,
          orderType: 'REJECT',
          reasonCode: 'INVALID_ORDER_TYPE',
          reasonNote: `Direction SELL requires order type SELL_LIMIT, got ${orderType}.`
        };
      }
      if (entryPrice <= livePrice) {
        return {
          valid: false,
          orderType: 'REJECT',
          reasonCode: 'ENTRY_NOT_ABOVE_LIVE',
          reasonNote: `SELL_LIMIT entry price ($${entryPrice}) must be strictly higher than live price ($${livePrice}).`
        };
      }
      return { valid: true, orderType: 'SELL_LIMIT' };
    }

    return {
      valid: false,
      orderType: 'REJECT',
      reasonCode: 'INVALID_ORDER_TYPE',
      reasonNote: `Unknown direction ${direction}`
    };
  }

  /**
   * PERBAIKAN 4 — TIMESTAMP-BASED CACHE INVALIDATION
   * On new signal request:
   * NEW SIGNAL REQUEST → INVALIDATE STALE PRICE CACHE → FETCH CURRENT MARKET DATA → UPDATE TIMESTAMP → CONTINUE ANALYSIS
   */
  public static async fetchLivePriceObj(
    symbol: string, 
    forceFresh: boolean = true,
    signal?: AbortSignal
  ): Promise<{ price: number; fetched_at: string; timestamp: number; source: string } | null> {
    const cleanSymbol = symbol.replace(/[\/\-_]/g, '').toUpperCase();
    const now = Date.now();

    // Check cache if not forcing fresh fetch
    if (!forceFresh) {
      const cached = this.priceCacheMap.get(cleanSymbol);
      if (cached && (now - cached.timestamp) / 1000 <= this.MAX_PRICE_AGE_SECONDS) {
        return { price: cached.price, fetched_at: cached.fetched_at, timestamp: cached.timestamp, source: cached.source };
      }
    }

    // Coalesce concurrent requests (avoiding race conditions & duplicate HTTP calls)
    let inProgress = this.fetchPromiseMap.get(cleanSymbol);
    if (inProgress) {
      return inProgress;
    }

    const fetchPromise = (async () => {
      // Always invalidate stale price cache for new requests
      this.priceCacheMap.delete(cleanSymbol);

      try {
        const res = await fetch(`${getBaseApiUrl()}/api/market/price?symbol=${encodeURIComponent(cleanSymbol)}`, { signal });
        const contentType = res.headers?.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error(`PROVIDER_NON_JSON: Response bursa non-JSON (${contentType || 'unknown'})`);
        }
        if (res.ok) {
          const data = await res.json();
          if (data && data.price && !isNaN(parseFloat(data.price)) && parseFloat(data.price) > 0) {
            const p = parseFloat(data.price);
            const src = data.marketSource || 'Global Feed';
            const iso = new Date().toISOString();
            const entry = {
              price: p,
              timestamp: Date.now(),
              fetched_at: iso,
              source: src
            };
            this.priceCacheMap.set(cleanSymbol, entry);
            return { price: p, fetched_at: iso, timestamp: entry.timestamp, source: src };
          }
        }
      } catch (e) {
        console.warn('[CloudMarketEngine] Failed fetching live price from API:', e);
      } finally {
        this.fetchPromiseMap.delete(cleanSymbol);
      }
      return null;
    })();

    this.fetchPromiseMap.set(cleanSymbol, fetchPromise);
    return fetchPromise;
  }

  public static async fetchLivePrice(symbol: string, forceFresh: boolean = false): Promise<number | null> {
    const obj = await this.fetchLivePriceObj(symbol, forceFresh);
    return obj ? obj.price : null;
  }

  /**
   * Fetch Live Market Ticker List across all asset classes from Unified Backend API
   */
  public static async fetchMarketTickers(): Promise<MarketTickerItem[]> {
    try {
      const res = await fetch(`${getBaseApiUrl()}/api/market/tickers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[CloudMarketEngine] Failed fetching live tickers from API:', e);
    }
    return [];
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
   * Rigorously audits historical zones with exact candle start/end origins,
   * tracking whether each area is FRESH (Area Baru), TESTED, or MITIGATED (Area Lama).
   */
  public static detectSMCZones(candles: CandleData[]): SMCZone[] {
    const rawZones: SMCZone[] = [];
    const len = candles.length;
    if (len < 5) return rawZones;

    // 1. Detect Fair Value Gaps (3-candle imbalance pattern)
    for (let i = 2; i < len; i++) {
      const c1 = candles[i - 2];
      const c2 = candles[i - 1];
      const c3 = candles[i];
      const atr = Math.max(c2.high - c2.low, 0.0001);

      // Bullish FVG: Low of c3 > High of c1 with significant displacement in c2
      if (c3.low > c1.high && (c2.close - c2.open) > atr * 0.5) {
        rawZones.push({
          type: 'FVG_BULL',
          top: c3.low,
          bottom: c1.high,
          startIndex: i - 2,
          endIndex: len - 1,
          candleTime: c2.time,
          volumeStrength: c2.volume,
          label: 'FVG Demand (Bullish Imbalance)'
        });
      }
      // Bearish FVG: High of c3 < Low of c1 with significant displacement in c2
      else if (c3.high < c1.low && (c2.open - c2.close) > atr * 0.5) {
        rawZones.push({
          type: 'FVG_BEAR',
          top: c1.low,
          bottom: c3.high,
          startIndex: i - 2,
          endIndex: len - 1,
          candleTime: c2.time,
          volumeStrength: c2.volume,
          label: 'FVG Supply (Bearish Imbalance)'
        });
      }
    }

    // 2. Detect Institutional Order Blocks (The decisive candle before an impulsive displacement)
    for (let i = 2; i < len - 1; i++) {
      const cur = candles[i];
      const next = candles[i + 1];
      const isBearishCandle = cur.close < cur.open;
      const isHugeBullExpansion = next.close > next.open && (next.close - next.open) > (cur.high - cur.low) * 1.3;

      if (isBearishCandle && isHugeBullExpansion) {
        rawZones.push({
          type: 'OB_BULL',
          top: cur.high,
          bottom: cur.low,
          startIndex: i,
          endIndex: len - 1,
          candleTime: cur.time,
          volumeStrength: next.volume,
          label: 'Bullish Order Block (Demand)'
        });
      }

      const isBullishCandle = cur.close > cur.open;
      const isHugeBearDisplacement = next.close < next.open && (next.open - next.close) > (cur.high - cur.low) * 1.3;

      if (isBullishCandle && isHugeBearDisplacement) {
        rawZones.push({
          type: 'OB_BEAR',
          top: cur.high,
          bottom: cur.low,
          startIndex: i,
          endIndex: len - 1,
          candleTime: cur.time,
          volumeStrength: next.volume,
          label: 'Bearish Order Block (Supply)'
        });
      }
    }

    // 3. Audit each historical zone against subsequent price action for mitigation & testing
    const auditedZones: SMCZone[] = rawZones.map(zone => {
      let testCount = 0;
      let isMitigated = false;
      let mitigatedIndex: number | undefined = undefined;
      const isBull = zone.type.includes('BULL');

      for (let k = zone.startIndex + 2; k < len; k++) {
        const c = candles[k];
        if (isBull) {
          // If price taps into the demand zone
          if (c.low <= zone.top && c.high >= zone.bottom) {
            testCount++;
          }
          // If candle body closes below demand zone, it is fully mitigated/invalidated
          if (c.close < zone.bottom) {
            isMitigated = true;
            mitigatedIndex = k;
            break;
          }
        } else {
          // If price taps into the supply zone
          if (c.high >= zone.bottom && c.low <= zone.top) {
            testCount++;
          }
          // If candle body closes above supply zone, it is fully mitigated/invalidated
          if (c.close > zone.top) {
            isMitigated = true;
            mitigatedIndex = k;
            break;
          }
        }
      }

      let status: 'FRESH' | 'TESTED' | 'MITIGATED' | 'LIQUIDITY_TARGET' = 'FRESH';
      let enrichedLabel = zone.label;

      if (isMitigated) {
        status = 'MITIGATED';
        enrichedLabel = isBull ? 'Breaker Block (Supply Flipped to Demand)' : 'Breaker Block (Demand Flipped to Supply)';
      } else if (testCount === 0) {
        status = 'FRESH';
        enrichedLabel = isBull ? 'Bullish Order Block [FRESH - Unmitigated Area Emas]' : 'Bearish Order Block [FRESH - Unmitigated Area Emas]';
      } else if (testCount === 1) {
        status = 'TESTED';
        enrichedLabel = isBull ? 'Bullish Order Block [TESTED 1x - Wajib Konfirmasi Reversal]' : 'Bearish Order Block [TESTED 1x - Wajib Konfirmasi Reversal]';
      } else {
        status = 'LIQUIDITY_TARGET'; // Weak/old zone with resting liquidity
        enrichedLabel = isBull ? 'Demand Lama [OVER-TESTED 2x+ - Rawan Sweep Likuiditas]' : 'Supply Lama [OVER-TESTED 2x+ - Rawan Sweep Likuiditas]';
      }

      return {
        ...zone,
        label: enrichedLabel,
        endIndex: mitigatedIndex || len - 1,
        mitigatedIndex,
        testCount,
        isFresh: status === 'FRESH',
        status
      };
    });

    // Retain up to 8 most relevant historical & fresh zones
    return auditedZones.slice(-8);
  }

  /**
   * Detect Swing Points (Higher Highs, Higher Lows, Lower Highs, Lower Lows)
   */
  public static detectSwingPoints(candles: CandleData[]): StructureSwingPoint[] {
    const points: StructureSwingPoint[] = [];
    const len = candles.length;
    if (len < 8) return points;

    let lastHigh: number | null = null;
    let lastLow: number | null = null;

    for (let i = 2; i < len - 2; i++) {
      const cur = candles[i];
      const isPeak = cur.high >= candles[i - 1].high &&
                     cur.high >= candles[i - 2].high &&
                     cur.high >= candles[i + 1].high &&
                     cur.high >= candles[i + 2].high;

      const isTrough = cur.low <= candles[i - 1].low &&
                       cur.low <= candles[i - 2].low &&
                       cur.low <= candles[i + 1].low &&
                       cur.low <= candles[i + 2].low;

      if (isPeak) {
        let type: 'HH' | 'LH' = 'HH';
        if (lastHigh !== null) {
          type = cur.high > lastHigh ? 'HH' : 'LH';
        }
        lastHigh = cur.high;
        points.push({ index: i, price: cur.high, type, time: cur.time });
      }

      if (isTrough) {
        let type: 'HL' | 'LL' = 'HL';
        if (lastLow !== null) {
          type = cur.low > lastLow ? 'HL' : 'LL';
        }
        lastLow = cur.low;
        points.push({ index: i, price: cur.low, type, time: cur.time });
      }
    }

    return points.slice(-10);
  }

  /**
   * Detect Market Structure: BOS, CHoCH, and Liquidity Sweeps
   * Evaluates historical swing points across candles to accurately flag origin and breakout indices.
   */
  public static detectMarketStructure(candles: CandleData[]): MarketStructureMarker[] {
    const markers: MarketStructureMarker[] = [];
    const len = candles.length;
    if (len < 12) return markers;

    // Track swing highs and lows
    const swingHighs: { index: number; price: number; high: number }[] = [];
    const swingLows: { index: number; price: number; low: number }[] = [];

    // Identify local swing fractals (window = 3)
    for (let i = 3; i < len - 2; i++) {
      const cur = candles[i];
      const isHigh = cur.high >= candles[i - 1].high &&
                     cur.high >= candles[i - 2].high &&
                     cur.high >= candles[i + 1].high &&
                     cur.high >= candles[i + 2].high;

      const isLow = cur.low <= candles[i - 1].low &&
                    cur.low <= candles[i - 2].low &&
                    cur.low <= candles[i + 1].low &&
                    cur.low <= candles[i + 2].low;

      if (isHigh) swingHighs.push({ index: i, price: cur.high, high: cur.high });
      if (isLow) swingLows.push({ index: i, price: cur.low, low: cur.low });
    }

    // Evaluate structural transitions across recent candles
    for (let i = 5; i < len; i++) {
      const cur = candles[i];
      const prevSlice = candles.slice(Math.max(0, i - 15), i);
      if (prevSlice.length < 4) continue;

      const localHigh = Math.max(...prevSlice.map(c => c.high));
      const localLow = Math.min(...prevSlice.map(c => c.low));

      // 1. Bearish Liquidity Sweep (BSL Taken / Sweep High)
      if (cur.high > localHigh && cur.close < localHigh) {
        markers.push({
          type: 'SWEEP_HIGH',
          price: cur.high,
          index: i,
          originIndex: Math.max(0, i - 5),
          label: 'SWEEP Atas (BSL Taken / Bearish Trap)',
          direction: 'bear',
          isConfirmed: true
        });
      }

      // 2. Bullish Liquidity Sweep (SSL Taken / Sweep Low)
      if (cur.low < localLow && cur.close > localLow) {
        markers.push({
          type: 'SWEEP_LOW',
          price: cur.low,
          index: i,
          originIndex: Math.max(0, i - 5),
          label: 'SWEEP Bawah (SSL Taken / Bullish Trap)',
          direction: 'bull',
          isConfirmed: true
        });
      }

      // 3. CHoCH & BOS Detection based on validated swing points
      const recentSwingHigh = swingHighs.filter(s => s.index < i).slice(-1)[0];
      const recentSwingLow = swingLows.filter(s => s.index < i).slice(-1)[0];

      if (recentSwingHigh && cur.close > recentSwingHigh.price && cur.open < recentSwingHigh.price) {
        const isReversal = markers.some(m => m.direction === 'bear' && m.index > i - 12);
        markers.push({
          type: isReversal ? 'CHOCH' : 'BOS',
          price: recentSwingHigh.price,
          index: i,
          originIndex: recentSwingHigh.index,
          label: isReversal ? 'CHoCH (Bullish Reversal)' : 'BOS (Bullish Continuation)',
          direction: 'bull',
          swingType: 'HH',
          isConfirmed: true
        });
      }

      if (recentSwingLow && cur.close < recentSwingLow.price && cur.open > recentSwingLow.price) {
        const isReversal = markers.some(m => m.direction === 'bull' && m.index > i - 12);
        markers.push({
          type: isReversal ? 'CHOCH' : 'BOS',
          price: recentSwingLow.price,
          index: i,
          originIndex: recentSwingLow.index,
          label: isReversal ? 'CHoCH (Bearish Reversal)' : 'BOS (Bearish Continuation)',
          direction: 'bear',
          swingType: 'LL',
          isConfirmed: true
        });
      }
    }

    // Keep unique markers by index and return the 6 most recent historical markers
    const seen = new Set<string>();
    const uniqueMarkers: MarketStructureMarker[] = [];
    for (let j = markers.length - 1; j >= 0; j--) {
      const key = `${markers[j].index}-${markers[j].type}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMarkers.unshift(markers[j]);
      }
      if (uniqueMarkers.length >= 6) break;
    }

    return uniqueMarkers;
  }

  /**
   * Verify whether a signal aligns with actual market structure
   */
  public static verifySignalWithMarketStructure(
    engineResult: EngineAnalysisResult,
    structMarkers: MarketStructureMarker[],
    zones: SMCZone[],
    curPrice: number
  ): MarketStructureVerification {
    const latestCHoCH = structMarkers.filter(m => m.type === 'CHOCH').slice(-1)[0];
    const latestBOS = structMarkers.filter(m => m.type === 'BOS').slice(-1)[0];
    const latestSweep = structMarkers.filter(m => m.type === 'SWEEP_HIGH' || m.type === 'SWEEP_LOW').slice(-1)[0];

    let structureBias: 'BULLISH' | 'BEARISH' | 'CHoCH_REVERSAL' | 'RANGING' = 'RANGING';
    if (latestCHoCH) {
      structureBias = 'CHoCH_REVERSAL';
    } else if (latestBOS) {
      structureBias = latestBOS.direction === 'bull' ? 'BULLISH' : 'BEARISH';
    }

    const isBullSignal = engineResult.direction === 'buy';
    const isBearSignal = engineResult.direction === 'sell';

    // 1. Structure Alignment Check
    const isSignalAlignedWithBOS = latestBOS 
      ? (isBullSignal && latestBOS.direction === 'bull') || (isBearSignal && latestBOS.direction === 'bear')
      : true;

    // 2. Method-Specific Structure Validity Check
    let isSignalFromFreshOB = false;
    let methodValidationPassed = false;
    let methodDetail = '';

    if (engineResult.engine === 'SMC') {
      const matchingOB = zones.find(z => 
        isBullSignal ? z.type.includes('BULL') : z.type.includes('BEAR')
      );
      isSignalFromFreshOB = !!matchingOB && (matchingOB.isFresh || matchingOB.status === 'FRESH');
      methodValidationPassed = isSignalFromFreshOB && (engineResult.status === 'setup');
      methodDetail = isSignalFromFreshOB ? 'Order Block Fresh Belum Termitigasi' : 'Order Block Telah Diuji';
    } else if (engineResult.engine === 'RBS') {
      // RBS validation: confirmed flip level retest with confirmed rejection
      methodValidationPassed = (engineResult.status === 'setup') && Boolean(engineResult.structureReference?.breakoutLevel);
      isSignalFromFreshOB = methodValidationPassed;
      methodDetail = methodValidationPassed ? 'Level Flip RBS/SBR Terkonfirmasi Retest Valid' : 'Menunggu Pullback/Retest Flip RBS/SBR';
    } else if (engineResult.engine === 'SNR') {
      // SNR validation: horizontal level with proven rejection touch
      methodValidationPassed = (engineResult.status === 'setup') && (engineResult.passedRules >= 4);
      isSignalFromFreshOB = methodValidationPassed;
      methodDetail = 'Key Horizontal SNR Rejection Teruji';
    } else if (engineResult.engine === 'FIBONACCI') {
      // Fibonacci validation: entry within golden pocket
      methodValidationPassed = (engineResult.status === 'setup') && (engineResult.passedRules >= 5);
      isSignalFromFreshOB = methodValidationPassed;
      methodDetail = 'Retracement Golden Pocket 0.618 OTE Sesuai Aturan';
    } else if (engineResult.engine === 'CRT') {
      // CRT validation: Judas manipulation wick confirmed inside range
      methodValidationPassed = (engineResult.status === 'setup') && (engineResult.passedRules >= 5);
      isSignalFromFreshOB = methodValidationPassed;
      methodDetail = 'Judas Manipulation Wick Menutup Kembali di Range';
    }

    // 3. SL Protection Check
    let isSlProtectedFromSweep = true;
    if (latestSweep) {
      if (isBullSignal && engineResult.slPrice >= latestSweep.price) {
        isSlProtectedFromSweep = false; // SL too close to sweep low
      } else if (isBearSignal && engineResult.slPrice <= latestSweep.price) {
        isSlProtectedFromSweep = false; // SL too close to sweep high
      }
    }

    // 4. Calculate confidence score purely as post-validation audit (4 criteria, 25% each)
    let score = 0;
    if (engineResult.structureReference && (engineResult.structureReference.breakoutLevel || engineResult.structureReference.flipLevel || engineResult.structureReference.swingHigh || engineResult.structureReference.retestZone)) {
      score += 25; // Structure integrity verified
    }
    if (isSignalAlignedWithBOS || structureBias === 'CHoCH_REVERSAL') {
      score += 25; // Direction aligned with structure
    }
    if (methodValidationPassed) {
      score += 25; // Method rules & trigger verified
    }
    if (isSlProtectedFromSweep && engineResult.slPrice > 0) {
      score += 25; // Invalidation level structurally safe
    }

    const summaryText = score >= 90
      ? `Sinyal terverifikasi selaras 100% dengan struktur metode ${engineResult.name} (${methodDetail}).`
      : score >= 70
        ? `Sinyal valid sesuai metode ${engineResult.name}, perhatikan potensi volatilitas struktur lanjutan.`
        : `Sinyal ${engineResult.name} dalam mode pantau untuk konfirmasi setup berikutnya.`;

    return {
      structureBias,
      isSignalAlignedWithBOS,
      isSignalFromFreshOB,
      isSlProtectedFromSweep,
      historicalOBCount: zones.filter(z => z.type.startsWith('OB')).length,
      historicalBOSCount: structMarkers.filter(m => m.type === 'BOS' || m.type === 'CHOCH').length,
      confidenceScore: Math.max(50, Math.min(99, score)),
      summaryText
    };
  }

  /**
   * Detect Candlestick Patterns: Pin Bar, Bullish/Bearish Engulfing, Rejection
   */
  public static detectCandlePatterns(candles: CandleData[]): CandlePatternMarker[] {
    const markers: CandlePatternMarker[] = [];
    const len = candles.length;
    for (let i = Math.max(1, len - 20); i < len; i++) {
      const cur = candles[i];
      const prev = candles[i - 1];
      const body = Math.abs(cur.close - cur.open);
      const upperWick = cur.high - Math.max(cur.open, cur.close);
      const lowerWick = Math.min(cur.open, cur.close) - cur.low;
      const totalRange = cur.high - cur.low;

      if (totalRange <= 0) continue;

      // 1. Bullish Pin Bar / Hammer (Rejection Bawah)
      if (lowerWick >= body * 1.8 && upperWick <= body * 0.6) {
        markers.push({
          index: i,
          price: cur.low,
          type: 'PIN_BAR',
          label: 'Pin Bar (Rejection Bawah)',
          isBullish: true
        });
      }
      // 2. Bearish Pin Bar / Shooting Star (Rejection Atas)
      else if (upperWick >= body * 1.8 && lowerWick <= body * 0.6) {
        markers.push({
          index: i,
          price: cur.high,
          type: 'PIN_BAR',
          label: 'Shooting Star (Rejection Atas)',
          isBullish: false
        });
      }
      // 3. Bullish Engulfing
      else if (prev.close < prev.open && cur.close > cur.open && cur.open <= prev.close && cur.close >= prev.open && body > (prev.open - prev.close) * 1.2) {
        markers.push({
          index: i,
          price: cur.low,
          type: 'ENGULFING',
          label: 'Bullish Engulfing',
          isBullish: true
        });
      }
      // 4. Bearish Engulfing
      else if (prev.close > prev.open && cur.close < cur.open && cur.open >= prev.close && cur.close <= prev.open && body > (prev.close - prev.open) * 1.2) {
        markers.push({
          index: i,
          price: cur.high,
          type: 'ENGULFING',
          label: 'Bearish Engulfing',
          isBullish: false
        });
      }
    }
    return markers.slice(-3);
  }

  /**
   * Detect Major Support & Resistance Levels (SNR)
   */
  public static detectSNRLevels(candles: CandleData[]): SNRLevel[] {
    const levels: SNRLevel[] = [];
    const len = candles.length;
    if (len < 10) return levels;

    const atr = this.calculateATR(candles);
    const curPrice = candles[len - 1].close;
    const tolerance = atr * 0.4;

    // Collect swing highs and swing lows
    const rawPivots: { price: number; type: 'SUPPORT' | 'RESISTANCE'; index: number }[] = [];
    for (let i = 2; i < len - 2; i++) {
      const c = candles[i];
      const isHigh = c.high >= candles[i - 1].high && c.high >= candles[i - 2].high &&
                     c.high >= candles[i + 1].high && c.high >= candles[i + 2].high;
      const isLow = c.low <= candles[i - 1].low && c.low <= candles[i - 2].low &&
                    c.low <= candles[i + 1].low && c.low <= candles[i + 2].low;

      if (isHigh) rawPivots.push({ price: c.high, type: 'RESISTANCE', index: i });
      if (isLow) rawPivots.push({ price: c.low, type: 'SUPPORT', index: i });
    }

    // Cluster pivots into distinct price levels
    for (const pivot of rawPivots) {
      const existing = levels.find(l => Math.abs(l.price - pivot.price) <= tolerance);
      if (existing) {
        existing.testCount += 1;
        existing.lastTestedIndex = Math.max(existing.lastTestedIndex, pivot.index);
        existing.strength = Math.min(5, existing.testCount);
        if (existing.testCount >= 3) {
          existing.label = existing.type === 'RESISTANCE' 
            ? 'Resistance Ritel (Equal Highs 3x+ / Rawan Sweep Likuiditas)' 
            : 'Support Ritel (Equal Lows 3x+ / Rawan Sweep Likuiditas)';
        } else {
          existing.label = existing.type === 'RESISTANCE' ? 'Resistance Mayor [Fresh 2x Rejection]' : 'Support Mayor [Fresh 2x Rejection]';
        }
      } else {
        levels.push({
          price: pivot.price,
          type: pivot.price > curPrice ? 'RESISTANCE' : 'SUPPORT',
          strength: 1,
          testCount: 1,
          lastTestedIndex: pivot.index,
          label: pivot.price > curPrice ? 'Resistance Baru [Fresh 1st Touch]' : 'Support Baru [Fresh 1st Touch]'
        });
      }
    }

    // Sort by strength & relevance (proximity to current price)
    return levels
      .sort((a, b) => Math.abs(a.price - curPrice) - Math.abs(b.price - curPrice))
      .slice(0, 6);
  }

  /**
   * Detect RBS (Resistance Become Support) & SBR (Support Become Resistance) Flip Zones
   * Distinguishes explicitly between:
   * A. BREAKOUT LEVEL (Original Broken Resistance/Support)
   * B. RETEST / FLIP ZONE (Pullback Area Testing the Broken Level)
   * C. CONFIRMATION TRIGGER (Rejection Candle / High/Low Break Confirmation)
   */
  public static detectRBSFlipZones(candles: CandleData[]): RBSFlipZone[] {
    const flipZones: RBSFlipZone[] = [];
    const len = candles.length;
    if (len < 15) return flipZones;

    const atr = this.calculateATR(candles);
    const curPrice = candles[len - 1].close;

    // Look for previous swing highs broken upwards (RBS) and swing lows broken downwards (SBR)
    for (let i = 5; i < len - 3; i++) {
      const c = candles[i];
      const isSwingHigh = c.high > candles[i - 1].high && c.high > candles[i - 2].high &&
                          c.high > candles[i + 1].high && c.high > candles[i + 2].high;
      const isSwingLow = c.low < candles[i - 1].low && c.low < candles[i - 2].low &&
                         c.low < candles[i + 1].low && c.low < candles[i + 2].low;

      if (isSwingHigh) {
        // Find candle that broke above swing high with close
        const brokenIdx = candles.findIndex((k, idx) => idx > i && k.close > c.high + atr * 0.05);
        if (brokenIdx !== -1) {
          const brokenCandle = candles[brokenIdx];
          
          // Check subsequent candles after breakout for retest
          const postBreakCandles = candles.slice(brokenIdx + 1);
          let retested = false;
          let retestIndex: number | undefined;
          let retestPrice: number | undefined;
          let retestLow: number | undefined;
          let retestHigh: number | undefined;
          let isConfirmedRejection = false;
          let triggerCandleIndex: number | undefined;
          let triggerPrice: number | undefined;

          for (let p = 0; p < postBreakCandles.length; p++) {
            const pk = postBreakCandles[p];
            const actualIdx = brokenIdx + 1 + p;
            
            // Check if flip zone was broken and invalidated by a close below the level
            if (pk.close < c.high - atr * 0.35) {
              retested = false;
              isConfirmedRejection = false;
              break; // Support failed
            }

            // Retest check: low dipped into flip zone without invalidating below flip level
            if (pk.low <= c.high + atr * 0.25 && pk.close >= c.high - atr * 0.25) {
              retested = true;
              retestIndex = actualIdx;
              retestPrice = pk.close;
              retestLow = pk.low;
              retestHigh = pk.high;

              // Check rejection confirmation: bullish close or long lower shadow
              const body = Math.abs(pk.close - pk.open);
              const lowerWick = Math.min(pk.open, pk.close) - pk.low;
              const isRejectionWick = lowerWick >= body * 1.2 || pk.close > pk.open;
              const isNextCandleBullish = candles[actualIdx + 1] ? candles[actualIdx + 1].close > candles[actualIdx + 1].open : false;

              if (isRejectionWick || isNextCandleBullish) {
                isConfirmedRejection = true;
                triggerCandleIndex = actualIdx;
                triggerPrice = pk.high; // Trigger breakout above confirmation candle
              }
            }
          }

          // If current price is below the broken resistance, it is not active support
          const isCurrentPriceValid = curPrice >= c.high - atr * 0.25;
          if (!isCurrentPriceValid) {
            retested = false;
            isConfirmedRejection = false;
          }

          const distFromRetest = Math.abs(curPrice - c.high);
          let label = 'RBS [Breakout Terjadi - Menunggu Retest Pertama]';
          if (retested && isConfirmedRejection) {
            label = 'RBS [Confirmed Retest - Support Aktif Baru]';
          } else if (retested && !isConfirmedRejection) {
            label = 'RBS [Testing Flip Zone - Menunggu Rejection Candle]';
          }

          flipZones.push({
            type: 'RBS',
            price: c.high,
            swingIndex: i,
            swingPrice: c.high,
            breakoutIndex: brokenIdx,
            breakoutPrice: brokenCandle.close,
            retested,
            retestIndex,
            retestPrice,
            retestLow,
            retestHigh,
            isConfirmedRejection,
            triggerCandleIndex,
            triggerPrice,
            distanceFromRetestZone: distFromRetest,
            label,
            direction: 'bull'
          });
        }
      }

      if (isSwingLow) {
        // Find candle that broke below swing low with close
        const brokenIdx = candles.findIndex((k, idx) => idx > i && k.close < c.low - atr * 0.05);
        if (brokenIdx !== -1) {
          const brokenCandle = candles[brokenIdx];
          
          const postBreakCandles = candles.slice(brokenIdx + 1);
          let retested = false;
          let retestIndex: number | undefined;
          let retestPrice: number | undefined;
          let retestLow: number | undefined;
          let retestHigh: number | undefined;
          let isConfirmedRejection = false;
          let triggerCandleIndex: number | undefined;
          let triggerPrice: number | undefined;

          for (let p = 0; p < postBreakCandles.length; p++) {
            const pk = postBreakCandles[p];
            const actualIdx = brokenIdx + 1 + p;

            // Check if flip zone was broken and invalidated by a close above the level
            if (pk.close > c.low + atr * 0.35) {
              retested = false;
              isConfirmedRejection = false;
              break; // Resistance failed
            }

            if (pk.high >= c.low - atr * 0.25 && pk.close <= c.low + atr * 0.25) {
              retested = true;
              retestIndex = actualIdx;
              retestPrice = pk.close;
              retestLow = pk.low;
              retestHigh = pk.high;

              const body = Math.abs(pk.close - pk.open);
              const upperWick = pk.high - Math.max(pk.open, pk.close);
              const isRejectionWick = upperWick >= body * 1.2 || pk.close < pk.open;
              const isNextCandleBearish = candles[actualIdx + 1] ? candles[actualIdx + 1].close < candles[actualIdx + 1].open : false;

              if (isRejectionWick || isNextCandleBearish) {
                isConfirmedRejection = true;
                triggerCandleIndex = actualIdx;
                triggerPrice = pk.low; // Trigger breakdown below confirmation candle
              }
            }
          }

          // If current price is above the broken support, it is not active resistance
          const isCurrentPriceValid = curPrice <= c.low + atr * 0.25;
          if (!isCurrentPriceValid) {
            retested = false;
            isConfirmedRejection = false;
          }

          const distFromRetest = Math.abs(curPrice - c.low);
          let label = 'SBR [Breakdown Terjadi - Menunggu Retest Pertama]';
          if (retested && isConfirmedRejection) {
            label = 'SBR [Confirmed Retest - Resistance Aktif Baru]';
          } else if (retested && !isConfirmedRejection) {
            label = 'SBR [Testing Flip Zone - Menunggu Rejection Candle]';
          }

          flipZones.push({
            type: 'SBR',
            price: c.low,
            swingIndex: i,
            swingPrice: c.low,
            breakoutIndex: brokenIdx,
            breakoutPrice: brokenCandle.close,
            retested,
            retestIndex,
            retestPrice,
            retestLow,
            retestHigh,
            isConfirmedRejection,
            triggerCandleIndex,
            triggerPrice,
            distanceFromRetestZone: distFromRetest,
            label,
            direction: 'bear'
          });
        }
      }
    }

    return flipZones.slice(-4);
  }

  /**
   * Calculate Fibonacci Retracement & Golden Pocket (0.618 - 0.786 OTE)
   */
  public static calculateFibonacciLevels(candles: CandleData[]): FibonacciSetup | null {
    const len = candles.length;
    if (len < 15) return null;

    const slice = candles.slice(-35);
    const swingHigh = Math.max(...slice.map(c => c.high));
    const swingLow = Math.min(...slice.map(c => c.low));
    const highIdx = slice.findIndex(c => c.high === swingHigh);
    const lowIdx = slice.findIndex(c => c.low === swingLow);
    const isBullish = lowIdx < highIdx; // Upward impulse, retracement downwards

    const range = swingHigh - swingLow;
    if (range <= 0) return null;

    const atr = this.calculateATR(candles);
    const separation = Math.abs(highIdx - lowIdx);
    const hasDisplacement = range >= (atr * 1.0);
    
    // Check if subsequent candles after the impulse extreme have broken the swing origin
    const impulseEndIdx = Math.max(highIdx, lowIdx);
    const postImpulse = slice.slice(impulseEndIdx + 1);
    let isOriginBroken = false;
    if (isBullish) {
      if (postImpulse.some(c => c.low < swingLow)) {
        isOriginBroken = true;
      }
    } else {
      if (postImpulse.some(c => c.high > swingHigh)) {
        isOriginBroken = true;
      }
    }

    const isImpulseValid = separation >= 3 && hasDisplacement && !isOriginBroken;
    const impulseInvalidReason = !isImpulseValid
      ? (isOriginBroken 
          ? 'Struktur impulse Fibonacci terinvalidasi (harga telah menembus level 1.000 swing origin)' 
          : (separation < 3 ? 'Separasi anchor impulse terlalu pendek (< 3 candle)' : 'Rentang impulse terlalu sempit / tidak ada displacement valid'))
      : undefined;

    // Parameter OTE resmi NAVIX: OTE_MIN = 0.618, OTE_MAX = 0.705.
    // Dilarang memperluas menjadi 0.786 / 0.79. Level 0.786 hanya batas invalidasi ekstrim.
    const ratios = [
      { ratio: 0.0, label: '0.0% (High/Low Asal)', isGoldenPocket: false },
      { ratio: 0.236, label: '23.6% Retracement', isGoldenPocket: false },
      { ratio: 0.382, label: '38.2% Retracement Level', isGoldenPocket: false },
      { ratio: 0.500, label: '50.0% Equilibrium Zone', isGoldenPocket: false },
      { ratio: 0.618, label: '61.8% OTE_MIN (Golden Pocket Masuk)', isGoldenPocket: true, isOTE: true },
      { ratio: 0.705, label: '70.5% OTE_MAX (Institutional Optimal Trade Entry)', isGoldenPocket: true, isOTE: true },
      { ratio: 0.786, label: '78.6% Deep Level (Batas Invalidation - Bukan OTE)', isGoldenPocket: false, isOTE: false },
      { ratio: 1.000, label: '100.0% Swing Origin', isGoldenPocket: false },
      { ratio: 1.618, label: '161.8% Golden Expansion Target', isGoldenPocket: false }
    ];

    const levels = ratios.map(r => {
      const price = isBullish
        ? swingHigh - range * r.ratio
        : swingLow + range * r.ratio;
      return {
        ratio: r.ratio,
        price,
        label: r.label,
        isGoldenPocket: r.isGoldenPocket,
        isOTE: r.isOTE
      };
    });

    return {
      swingHigh,
      swingLow,
      isBullish,
      levels,
      isImpulseValid,
      impulseInvalidReason,
      impulseSeparation: separation
    };
  }

  /**
   * Resolve appropriate display and calculation decimals for any symbol or asset class (P0-4).
   */
  public static getSymbolDecimals(pairSymbol: string, currentPrice?: number): number {
    const matched = INITIAL_MARKET_TICKERS.find(t => t.symbol.toUpperCase() === pairSymbol.toUpperCase());
    if (matched && matched.decimals !== undefined) return matched.decimals;
    const s = pairSymbol.toUpperCase();
    if (s.endsWith('.JK')) return 0;
    if (s.includes('JPY')) return 3;
    if (s === 'EURUSD' || s === 'GBPUSD' || s === 'AUDUSD' || s === 'USDCAD' || s === 'USDCHF' || s === 'NZDUSD') return 4;
    if (s.includes('DOGE')) return 5;
    if (s.includes('SHIB') || s.includes('PEPE') || s.includes('BONK') || s.includes('FLOKI')) return 7;
    if (s === 'ADAUSDT' || s === 'XRPUSDT' || s === 'THEUSDT' || s === 'TRXUSDT') return 4;
    if (s === 'LINKUSDT' || s === 'DOTUSDT' || s === 'NEARUSDT' || s === 'RENDERUSDT' || s === 'FETUSDT' || s === 'WLDUSDT' || s === 'WIFUSDT' || s === 'SUIUSDT' || s === 'ARBUSDT' || s === 'OPUSDT') return 3;
    if (currentPrice !== undefined && currentPrice > 0) {
      if (currentPrice < 0.0001) return 7;
      if (currentPrice < 0.1) return 5;
      if (currentPrice < 1.0) return 4;
      if (currentPrice < 10.0) return 3;
    }
    return 2;
  }

  /**
   * Deterministic Institutional Order Type Determination — Single Source of Truth.
   * Standar Mutlak NAVIX:
   * - Seluruh sinyal BUY adalah BUY LIMIT (Order pending pada level diskon / key support structure).
   * - Seluruh sinyal SELL adalah SELL LIMIT (Order pending pada level premium / key supply structure).
   * - Menghilangkan market order chasing dan stop orders.
   */
  public static determineOrderType(
    direction: 'buy' | 'sell',
    entryPrice: number,
    currentPrice: number,
    tickSize: number,
    setupType?: string
  ): {
    orderType: 'BUY LIMIT' | 'SELL LIMIT';
    isSemanticConsistent: boolean;
    semanticNote?: string;
  } {
    const isBuy = direction.toLowerCase() === 'buy';
    const orderType: 'BUY LIMIT' | 'SELL LIMIT' = isBuy ? 'BUY LIMIT' : 'SELL LIMIT';

    // Semantic consistency check: Ensure Buy Limit is positioned at discount and Sell Limit at premium
    let isSemanticConsistent = true;
    let semanticNote: string | undefined;

    if (isBuy && entryPrice > currentPrice + tickSize * 2.0) {
      isSemanticConsistent = false;
      semanticNote = `Level entry Buy ($${entryPrice}) berada di atas harga running ($${currentPrice}). Sinyal institusional BUY LIMIT wajib di bawah harga running (Area Diskon/Support). Status dialihkan ke PANTAU.`;
    } else if (!isBuy && entryPrice < currentPrice - tickSize * 2.0) {
      isSemanticConsistent = false;
      semanticNote = `Level entry Sell ($${entryPrice}) berada di bawah harga running ($${currentPrice}). Sinyal institusional SELL LIMIT wajib di atas harga running (Area Premium/Supply). Status dialihkan ke PANTAU.`;
    }

    return { orderType, isSemanticConsistent, semanticNote };
  }

  /**
   * Detect CRT (Candle Range Theory) Range, 50% Mid, Manipulation Judas Wick & Expansion Target
   * P1-5: Reclaim/close-back-inside evaluated strictly on CLOSED candles.
   */
  public static detectCRTRange(candles: CandleData[]): CRTRangeSetup | null {
    const len = candles.length;
    if (len < 20) return null;

    // Previous reference range block (12 to 24 candles before current)
    const refCandles = candles.slice(-24, -4);
    if (refCandles.length < 10) return null;

    const rangeHigh = Math.max(...refCandles.map(c => c.high));
    const rangeLow = Math.min(...refCandles.map(c => c.low));
    const midRange = (rangeHigh + rangeLow) / 2;
    const rangeHeight = rangeHigh - rangeLow;

    // Check recent CLOSED candles (strictly exclude the currently open unclosed candle len - 1)
    const closedCandles = candles.slice(0, len - 1);
    const recent = closedCandles.slice(-4);
    let manipulationType: 'BULL_TRAP_HIGH' | 'BEAR_TRAP_LOW' | 'NONE' = 'NONE';
    let judasSweepPrice: number | undefined;
    let isSweepClosedOutside = false;
    let sweepCandleClose: number | undefined;

    for (const c of recent) {
      if (c.high > rangeHigh) {
        judasSweepPrice = c.high;
        sweepCandleClose = c.close;
        if (c.close < rangeHigh) {
          // Closed back inside parent range on a fully closed candle! Confirmed Bull Trap (Bearish Setup)
          manipulationType = 'BULL_TRAP_HIGH';
          isSweepClosedOutside = false;
          break;
        } else {
          // Sweep occurred, but candle closed outside parent range! CRT becomes INVALID.
          isSweepClosedOutside = true;
          manipulationType = 'NONE';
        }
      } else if (c.low < rangeLow) {
        judasSweepPrice = c.low;
        sweepCandleClose = c.close;
        if (c.close > rangeLow) {
          // Closed back inside parent range on a fully closed candle! Confirmed Bear Trap (Bullish Setup)
          manipulationType = 'BEAR_TRAP_LOW';
          isSweepClosedOutside = false;
          break;
        } else {
          // Sweep occurred, but candle closed outside parent range! CRT becomes INVALID.
          isSweepClosedOutside = true;
          manipulationType = 'NONE';
        }
      }
    }

    const isBullishSetup = manipulationType === 'BEAR_TRAP_LOW';
    const isBearishSetup = manipulationType === 'BULL_TRAP_HIGH';
    const targetExpansion = isBullishSetup
      ? rangeHigh + rangeHeight * 1.0
      : (isBearishSetup ? rangeLow - rangeHeight * 1.0 : rangeHigh);

    return {
      rangeHigh,
      rangeLow,
      midRange,
      judasSweepPrice,
      manipulationType,
      targetExpansion,
      isConfirmed: manipulationType !== 'NONE' && !isSweepClosedOutside,
      isSweepClosedOutside,
      sweepCandleClose,
      label: manipulationType === 'BEAR_TRAP_LOW'
        ? 'CRT Bullish: Range Low Judas Sweep Selesai (Target Range Expansion Atas)'
        : manipulationType === 'BULL_TRAP_HIGH'
          ? 'CRT Bearish: Range High Judas Sweep Selesai (Target Range Expansion Bawah)'
          : isSweepClosedOutside
            ? 'CRT Invalid: Candle sweep menutup di luar parent range'
            : 'CRT Range: Konsolidasi di dalam Range High - Range Low'
    };
  }

  /**
   * Identifies the current market condition independently based on raw price action & structure (Rule 3 & 17):
   * - BREAKOUT_FLIP_RETEST: Prior key swing broken, price currently retesting broken level as new support/resistance.
   * - RANGE_BOUND_JUDAS_MANIPULATION: Clear range boundary established with sweep manipulation (Judas swing) back inside range.
   * - IMPULSIVE_TREND_RETRACEMENT: Distinct impulsive wave actively pulling back to equilibrium/OTE golden pocket.
   * - HORIZONTAL_KEY_LEVEL_REACTION: Tested key horizontal support/resistance with historical multiple rejections.
   * - ORDER_BLOCK_DISPLACEMENT_TREND: Strong displacement trend leaving fresh unmitigated Order Blocks / FVGs.
   * - CONSOLIDATION_OR_UNCERTAIN: Market ranging without clear actionable setup.
   */
  public static analyzeMarketCondition(candles: CandleData[]): string {
    if (!candles || candles.length < 5) return 'CONSOLIDATION_OR_UNCERTAIN';

    const lastCandle = candles[candles.length - 1];
    const curPrice = lastCandle.close;
    const atr = this.calculateATR(candles);
    const rbsZones = this.detectRBSFlipZones(candles);
    const crtSetup = this.detectCRTRange(candles);
    const fibSetup = this.calculateFibonacciLevels(candles);
    const snrLevels = this.detectSNRLevels(candles);
    const smcZones = this.detectSMCZones(candles);
    const structMarkers = this.detectMarketStructure(candles);

    // 1. Check for Active RBS/SBR Flip Retest (Breakout followed by first retest)
    const activeRbsNear = rbsZones.find(z => Math.abs(curPrice - z.price) <= atr * 0.45);
    if (activeRbsNear) {
      return 'BREAKOUT_FLIP_RETEST';
    }

    // 2. Check for CRT Session Range Judas Manipulation
    if (crtSetup && crtSetup.isConfirmed) {
      return 'RANGE_BOUND_JUDAS_MANIPULATION';
    }

    // 3. Check for Strong Impulsive Wave Retracement to OTE
    if (fibSetup) {
      const gp = fibSetup.levels.find(l => l.ratio === 0.618);
      if (gp && Math.abs(curPrice - gp.price) <= atr * 0.40) {
        return 'IMPULSIVE_TREND_RETRACEMENT';
      }
    }

    // 4. Check for Key Horizontal SNR Multiple Touches
    const activeSnrNear = snrLevels.find(l => Math.abs(curPrice - l.price) <= atr * 0.35 && l.testCount >= 2);
    if (activeSnrNear) {
      return 'HORIZONTAL_KEY_LEVEL_REACTION';
    }

    // 5. Check for Fresh Unmitigated Order Block / FVG Displacement
    const freshObNear = smcZones.find(z => 
      (z.isFresh || z.status === 'FRESH') && 
      ((z.type.includes('BULL') && curPrice >= z.bottom - atr * 0.15 && curPrice <= z.top + atr * 0.6) ||
       (z.type.includes('BEAR') && curPrice <= z.top + atr * 0.15 && curPrice >= z.bottom - atr * 0.6))
    );
    const hasActiveBos = structMarkers.some(m => (m.type === 'BOS' || m.type === 'CHOCH') && m.index >= candles.length - 12);
    if (freshObNear || hasActiveBos) {
      return 'ORDER_BLOCK_DISPLACEMENT_TREND';
    }

    // Default: Check if price is within general consolidation
    if (crtSetup) {
      return 'RANGE_BOUND_JUDAS_MANIPULATION';
    }

    return 'CONSOLIDATION_OR_UNCERTAIN';
  }

  /**
   * Classify market events strictly based on actual price action and structure (Section B):
   * - CRT_EVENT: Parent range confirmed, sweep of one side, closed back inside parent range.
   * - RBS_EVENT / SBR_EVENT: Breakout confirmed, retested from above (RBS) or below (SBR).
   * - SMC_EVENT: Liquidity/structure event (BOS/CHoCH), fresh OB/FVG, retrace to zone.
   * - FIB_EVENT: Confirmed impulse leg, valid anchors, retrace into 0.618 - 0.705 OTE zone.
   * - SNR_EVENT: Established horizontal S/R (>= 2 touches), structural extreme, rejection, HL/LH.
   * - NO_EVENT: None of the above confirmed.
   */
  public static classifyMarketEvent(
    candles: CandleData[],
    allEngines?: Record<StrategyEngineType, EngineAnalysisResult>
  ): MarketEventType {
    if (!candles || candles.length < 5) return 'NO_EVENT';

    // 1. Check CRT Event: Confirmed sweep and close back inside parent range
    const crtSetup = this.detectCRTRange(candles);
    if (crtSetup && crtSetup.isConfirmed && !crtSetup.isSweepClosedOutside && crtSetup.manipulationType !== 'NONE') {
      return 'CRT_EVENT';
    }

    // 2. Check RBS / SBR Event: Breakout confirmed + retest from above/below
    const rbsZones = this.detectRBSFlipZones(candles);
    const activeRetest = rbsZones.find(z => z.retested);
    if (activeRetest) {
      return activeRetest.type === 'SBR' ? 'SBR_EVENT' : 'RBS_EVENT';
    }

    // 3. Check SMC Event: BOS/CHoCH/displacement + fresh OB/FVG + retrace to zone
    const smcZones = this.detectSMCZones(candles);
    const structMarkers = this.detectMarketStructure(candles);
    const hasStructureEvent = structMarkers.some(m => (m.type === 'BOS' || m.type === 'CHOCH') && m.index >= candles.length - 15);
    const curPrice = candles[candles.length - 1].close;
    const atr = this.calculateATR(candles);
    const freshObNear = smcZones.find(z => 
      (z.isFresh || z.status === 'FRESH') && 
      ((z.type.includes('BULL') && curPrice >= z.bottom - atr * 0.25 && curPrice <= z.top + atr * 0.5) ||
       (z.type.includes('BEAR') && curPrice <= z.top + atr * 0.25 && curPrice >= z.bottom - atr * 0.5))
    );
    if (hasStructureEvent && freshObNear) {
      return 'SMC_EVENT';
    }

    // 4. Check FIB Event: Confirmed impulse leg + valid anchors + retrace into 0.618-0.705 OTE
    const fibSetup = this.calculateFibonacciLevels(candles);
    if (fibSetup && fibSetup.isImpulseValid) {
      const gp = fibSetup.levels.find(l => l.ratio === 0.618);
      const oteMax = fibSetup.levels.find(l => l.ratio === 0.705);
      if (gp && oteMax) {
        const top = Math.max(gp.price, oteMax.price);
        const bot = Math.min(gp.price, oteMax.price);
        if (curPrice >= bot - atr * 0.15 && curPrice <= top + atr * 0.15) {
          return 'FIB_EVENT';
        }
      }
    }

    // 5. Check SNR Event: Established horizontal S/R (>= 2 touches) + extreme zone + rejection
    const snrLevels = this.detectSNRLevels(candles);
    const zoneData = this.calculateMarketZone(candles);
    if (zoneData.zone !== 'MIDDLE') {
      const activeSnr = snrLevels.find(l => l.testCount >= 2 && Math.abs(curPrice - l.price) <= atr * 0.35);
      if (activeSnr) {
        return 'SNR_EVENT';
      }
    }

    // Fallback checks from evaluated engines if available
    if (allEngines) {
      if (allEngines.CRT.methodState === 'TRIGGERED' || allEngines.CRT.methodState === 'ACTIVE') return 'CRT_EVENT';
      if (allEngines.RBS.methodState === 'TRIGGERED' || allEngines.RBS.methodState === 'ACTIVE') {
        return allEngines.RBS.direction === 'sell' ? 'SBR_EVENT' : 'RBS_EVENT';
      }
      if (allEngines.SMC.methodState === 'TRIGGERED' || allEngines.SMC.methodState === 'ACTIVE') return 'SMC_EVENT';
      if (allEngines.FIBONACCI.methodState === 'TRIGGERED' || allEngines.FIBONACCI.methodState === 'ACTIVE') return 'FIB_EVENT';
      if (allEngines.SNR.methodState === 'TRIGGERED' || allEngines.SNR.methodState === 'ACTIVE') return 'SNR_EVENT';
    }

    return 'NO_EVENT';
  }

  /**
   * Calculate Market Zone: UPPER (Supply), MIDDLE (Equilibrium - NO ENTRY), LOWER (Demand)
   */
  public static calculateMarketZone(candles: CandleData[]): {
    zone: 'UPPER' | 'MIDDLE' | 'LOWER';
    rangeHigh: number;
    rangeLow: number;
    upperThreshold: number;
    lowerThreshold: number;
  } {
    const len = candles.length;
    if (len === 0) {
      return { zone: 'MIDDLE', rangeHigh: 0, rangeLow: 0, upperThreshold: 0, lowerThreshold: 0 };
    }
    const slice = candles.slice(Math.max(0, len - 40));
    const rangeHigh = Math.max(...slice.map(c => c.high));
    const rangeLow = Math.min(...slice.map(c => c.low));
    const curPrice = candles[len - 1]?.close || rangeLow;
    const span = rangeHigh - rangeLow;

    if (span <= 0) {
      return { zone: 'MIDDLE', rangeHigh, rangeLow, upperThreshold: rangeHigh, lowerThreshold: rangeLow };
    }

    const lowerThreshold = rangeLow + span * 0.333;
    const upperThreshold = rangeLow + span * 0.667;

    let zone: 'UPPER' | 'MIDDLE' | 'LOWER' = 'MIDDLE';
    if (curPrice >= upperThreshold) {
      zone = 'UPPER';
    } else if (curPrice <= lowerThreshold) {
      zone = 'LOWER';
    } else {
      zone = 'MIDDLE';
    }

    return { zone, rangeHigh, rangeLow, upperThreshold, lowerThreshold };
  }

  /**
   * Calculate Structure Trend based on Higher Highs (HH) + Higher Lows (HL) or Lower Highs (LH) + Lower Lows (LL)
   */
  public static calculateStructureTrend(candles: CandleData[]): {
    trend: 'BULLISH' | 'BEARISH' | 'STRUCTURE_NOT_VALID';
    latestHH?: StructureSwingPoint;
    latestHL?: StructureSwingPoint;
    latestLH?: StructureSwingPoint;
    latestLL?: StructureSwingPoint;
  } {
    const swings = this.detectSwingPoints(candles);
    if (swings.length < 2) {
      return { trend: 'STRUCTURE_NOT_VALID' };
    }

    const highs = swings.filter(s => s.type === 'HH' || s.type === 'LH');
    const lows = swings.filter(s => s.type === 'HL' || s.type === 'LL');

    const latestHigh = highs.slice(-1)[0];
    const latestLow = lows.slice(-1)[0];

    if (latestHigh?.type === 'HH' && latestLow?.type === 'HL') {
      return { trend: 'BULLISH', latestHH: latestHigh, latestHL: latestLow };
    } else if (latestHigh?.type === 'LH' && latestLow?.type === 'LL') {
      return { trend: 'BEARISH', latestLH: latestHigh, latestLL: latestLow };
    }

    return { trend: 'STRUCTURE_NOT_VALID' };
  }

  /**
   * Run the 5 Core Methods INDEPENDENTLY: SMC, SNR, RBS, FIBONACCI, CRT
   * HARD ISOLATION RULE: Each method calculates its own setup, entry, SL, TP, and lineage without cross-contamination.
   */
  public static evaluateAllEngines(candles: CandleData[], pairSymbol: string, precalculatedCondition?: string): Record<StrategyEngineType, EngineAnalysisResult> {
    const lastCandle = candles[candles.length - 1] || { close: 100, high: 101, low: 99, open: 100, volume: 1000, time: Date.now() };
    const curPrice = lastCandle.close;
    const atr = this.calculateATR(candles);
    const smcZones = this.detectSMCZones(candles);
    const structMarkers = this.detectMarketStructure(candles);
    const candlePatterns = this.detectCandlePatterns(candles);
    const snrLevels = this.detectSNRLevels(candles);
    const rbsZones = this.detectRBSFlipZones(candles);
    const fibSetup = this.calculateFibonacciLevels(candles);
    const crtSetup = this.detectCRTRange(candles);

    const marketZoneData = this.calculateMarketZone(candles);
    const structureTrendData = this.calculateStructureTrend(candles);
    const globalZone = marketZoneData.zone;
    const globalTrend = structureTrendData.trend;

    const marketCondition = precalculatedCondition || this.analyzeMarketCondition(candles);
    const decimals = CloudMarketEngine.getSymbolDecimals(pairSymbol, curPrice);
    const tickSize = Math.pow(10, -decimals);

    const latestCHoCH = structMarkers.filter(m => m.type === 'CHOCH').slice(-1)[0];
    const latestBOS = structMarkers.filter(m => m.type === 'BOS').slice(-1)[0];
    const latestSweep = structMarkers.filter(m => m.type === 'SWEEP_HIGH' || m.type === 'SWEEP_LOW').slice(-1)[0];

    const formatOrderInstruction = (dir: 'buy' | 'sell', entry: number, sl: number, tp: number, rationale: string, setupType?: string): string => {
      const eStr = `$${entry.toFixed(decimals)}`;
      const slStr = `$${sl.toFixed(decimals)}`;
      const tpStr = `$${tp.toFixed(decimals)}`;
      const curStr = `$${curPrice.toFixed(decimals)}`;
      const { orderType } = CloudMarketEngine.determineOrderType(dir, entry, curPrice, tickSize, setupType);

      if (orderType === 'BUY LIMIT') {
        return `Pasang BUY LIMIT di ${eStr} (Area Diskon Struktur di bawah running ${curStr}). SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
      } else {
        return `Pasang SELL LIMIT di ${eStr} (Area Premium Struktur di atas running ${curStr}). SL: ${slStr}, TP: ${tpStr}. Alasan: ${rationale}.`;
      }
    };

    // =========================================================================
    // --- 1. SMC ENGINE (INDIVIDUAL SETUP & TRIGGER EVENT VALIDATION) ---
    // =========================================================================
    let smcDir: 'buy' | 'sell' = 'buy';
    const hasValidSMCStructure = (globalTrend === 'BEARISH' || globalTrend === 'BULLISH' || !!latestCHoCH || !!latestBOS);
    if (globalTrend === 'BEARISH') {
      smcDir = 'sell';
    } else if (globalTrend === 'BULLISH') {
      smcDir = 'buy';
    } else if (latestCHoCH) {
      smcDir = latestCHoCH.direction === 'bear' ? 'sell' : 'buy';
    } else if (latestBOS) {
      smcDir = latestBOS.direction === 'bear' ? 'sell' : 'buy';
    } else {
      smcDir = curPrice >= (candles[0]?.close ?? curPrice) ? 'buy' : 'sell';
    }

    const matchingFreshZone = smcZones.find(z => 
      smcDir === 'sell'
        ? (z.type.includes('BEAR') && (z.isFresh || z.status === 'FRESH') && z.bottom >= curPrice - atr * 0.15)
        : (z.type.includes('BULL') && (z.isFresh || z.status === 'FRESH') && z.top <= curPrice + atr * 0.15)
    );
    // P2-8: Exclude mitigated Order Blocks from forming active setups
    const matchingTestedZone = smcZones.find(z => 
      smcDir === 'sell'
        ? (z.type.includes('BEAR') && z.status !== 'MITIGATED' && z.bottom >= curPrice - atr * 0.15)
        : (z.type.includes('BULL') && z.status !== 'MITIGATED' && z.top <= curPrice + atr * 0.15)
    );
    const targetZone = matchingFreshZone || matchingTestedZone;
    const hasFreshZone = !!matchingFreshZone;
    const smcSetupDetected = !!targetZone;

    // Check if price is within / testing the OB/FVG zone
    const isSmcPriceInZone = targetZone 
      ? (smcDir === 'sell'
          ? (curPrice >= targetZone.bottom - atr * 0.05 && curPrice <= targetZone.top + atr * 0.15)
          : (curPrice <= targetZone.top + atr * 0.05 && curPrice >= targetZone.bottom - atr * 0.15))
      : false;

    // Reaction Event: Lower wick rejection on Bullish OB, Upper wick rejection on Bearish OB, or Engulfing close
    const recentCandles = candles.slice(-3);
    const isSmcReactionConfirmed = isSmcPriceInZone && recentCandles.some(c => {
      const body = Math.abs(c.close - c.open);
      if (smcDir === 'buy') {
        const lowerWick = Math.min(c.open, c.close) - c.low;
        return lowerWick >= body * 1.0 || (c.close > c.open && c.close > (targetZone?.top || 0));
      } else {
        const upperWick = c.high - Math.max(c.open, c.close);
        return upperWick >= body * 1.0 || (c.close < c.open && c.close < (targetZone?.bottom || 0));
      }
    });

    // SMC Stop Loss & Take Profit determination
    const zoneBoundary = targetZone ? (smcDir === 'sell' ? targetZone.top : targetZone.bottom) : curPrice;
    const smcSlRaw = smcDir === 'sell'
      ? zoneBoundary + atr * 0.20
      : zoneBoundary - atr * 0.20;
    const smcSl = parseFloat(smcSlRaw.toFixed(decimals));

    // SMC Hard Invalidation against Live Market Price
    let isSmcPriceInvalidated = false;
    let smcInvalidationMsg = '';
    if (targetZone) {
      if (smcDir === 'buy') {
        if (curPrice <= smcSl) {
          isSmcPriceInvalidated = true;
          smcInvalidationMsg = `Harga live ($${curPrice}) telah menembus batas bawah Demand Order Block / SL ($${smcSl})`;
        }
      } else {
        if (curPrice >= smcSl) {
          isSmcPriceInvalidated = true;
          smcInvalidationMsg = `Harga live ($${curPrice}) telah menembus batas atas Supply Order Block / SL ($${smcSl})`;
        }
      }
    }
    const isSmcZoneInvalidated = isSmcPriceInvalidated;

    // SMC Target: Next liquidity pool (BSL for buy, SSL for sell)
    const recent20 = candles.slice(-20);
    const nearestSwingHigh = recent20.length > 0 ? Math.max(...recent20.map(c => c.high)) : curPrice + atr * 2;
    const nearestSwingLow = recent20.length > 0 ? Math.min(...recent20.map(c => c.low)) : curPrice - atr * 2;
    let smcTpRaw = smcDir === 'sell' ? nearestSwingLow : nearestSwingHigh;
    // Geometry enforcement: ensure target is beyond entry (P0-2)
    if (smcDir === 'buy' && smcTpRaw <= curPrice) {
      smcTpRaw = curPrice + Math.max(Math.abs(curPrice - smcSl) * 2.0, atr * 1.5);
    } else if (smcDir === 'sell' && smcTpRaw >= curPrice) {
      smcTpRaw = curPrice - Math.max(Math.abs(curPrice - smcSl) * 2.0, atr * 1.5);
    }
    const smcTp = parseFloat(smcTpRaw.toFixed(decimals));

    let smcEntry: number;
    let smcRejectionReason: string | undefined;
    let smcExecutionState: 'SETUP_DETECTED' | 'WAITING_FOR_TRIGGER' | 'TRIGGER_CONFIRMED' | 'ENTRY_READY' | 'INVALIDATED' | 'NO_VALID_SETUP' = 'NO_VALID_SETUP';

    if (!hasValidSMCStructure) {
      smcEntry = curPrice;
      smcExecutionState = 'NO_VALID_SETUP';
      smcRejectionReason = 'Struktur pasar SMC tidak valid (tidak ada konfirmasi BOS atau CHoCH terarah)';
    } else if (!targetZone) {
      smcEntry = curPrice;
      smcExecutionState = 'NO_VALID_SETUP';
      smcRejectionReason = 'Tidak ada Order Block / FVG yang valid untuk mitigasi';
    } else if (isSmcPriceInvalidated) {
      smcEntry = curPrice;
      smcExecutionState = 'INVALIDATED';
      smcRejectionReason = smcInvalidationMsg;
    } else if (globalZone === 'MIDDLE' && !isSmcReactionConfirmed) {
      smcEntry = smcDir === 'sell' ? Math.max(curPrice, targetZone.bottom) : Math.min(curPrice, targetZone.top);
      smcExecutionState = 'WAITING_FOR_TRIGGER';
      smcRejectionReason = 'Harga berada di Zona Tengah (Equilibrium) - Menunggu retracement ke extreme Supply/Demand OB';
    } else if (isSmcPriceInZone && isSmcReactionConfirmed) {
      smcEntry = smcDir === 'buy' ? Math.min(targetZone.top, curPrice - tickSize * 2.0) : Math.max(targetZone.bottom, curPrice + tickSize * 2.0);
      smcExecutionState = 'ENTRY_READY';
    } else if (isSmcPriceInZone && !isSmcReactionConfirmed) {
      smcEntry = smcDir === 'sell' ? Math.max(curPrice, targetZone.bottom) : Math.min(curPrice, targetZone.top);
      smcExecutionState = 'WAITING_FOR_TRIGGER';
      smcRejectionReason = 'Harga telah menyentuh Order Block / FVG, tetapi belum ada reaksi/konfirmasi rejection candle (WAIT)';
    } else {
      smcEntry = smcDir === 'sell' ? Math.max(curPrice, targetZone.bottom) : Math.min(curPrice, targetZone.top);
      smcExecutionState = 'WAITING_FOR_TRIGGER';
      smcRejectionReason = 'Order Block teridentifikasi, menunggu harga retracement masuk ke area mitigasi OB';
    }
    smcEntry = parseFloat(smcEntry.toFixed(decimals));

    // Order type determination (P0-1)
    const smcOrderCheck = CloudMarketEngine.determineOrderType(smcDir, smcEntry, curPrice, tickSize, 'order_block_fvg_mitigation');
    const smcEntryType: 'LIMIT' = 'LIMIT';
    
    const isSmcGeometryValid = smcDir === 'buy' ? (smcSl < smcEntry && smcEntry < smcTp) : (smcTp < smcEntry && smcEntry < smcSl);
    const smcRisk = Math.abs(smcEntry - smcSl);
    const smcReward = Math.abs(smcTp - smcEntry);
    const smcCalculatedRR = smcRisk > 0 ? (smcReward / smcRisk).toFixed(2) : '1:2.0';
    const smcAtrDist = parseFloat((Math.abs(curPrice - smcEntry) / (atr || 1)).toFixed(2));

    const smcTargetDir = smcDir === 'buy' ? 'bull' : 'bear';
    const smcHasBOS = structMarkers.some(m => (m.type === 'BOS' || m.type === 'CHOCH') && m.direction === smcTargetDir);
    const smcHasSweep = structMarkers.some(m => smcDir === 'sell' ? m.type === 'SWEEP_HIGH' : m.type === 'SWEEP_LOW');

    const smcRules = [
      { id: 'smc_fresh', label: 'Area Order Block Baru (Fresh Unmitigated Zone)', passed: hasFreshZone },
      { id: 'smc_ob', label: 'Order Block / FVG Terkonfirmasi Dekat', passed: !!targetZone },
      { id: 'smc_sweep', label: 'Likuiditas BSL/SSL Sweep Terdeteksi', passed: smcHasSweep },
      { id: 'smc_bos', label: 'Struktur pasar BOS / CHoCH Terarah', passed: smcHasBOS },
      { id: 'smc_reaction', label: 'Trigger Konfirmasi: Candle Rejection di Area Mitigasi', passed: isSmcReactionConfirmed },
      { id: 'smc_rr', label: 'Risk-Reward (RR) bersih berbasis struktur liquidity target', passed: smcReward >= smcRisk * 1.5 && isSmcGeometryValid },
      { id: 'smc_atr', label: 'Jarak entry sangat realistis & dekat (< 0.40 ATR)', passed: smcAtrDist <= 0.40 }
    ];
    const smcPassed = smcRules.filter(r => r.passed).length;
    const isSmcValid = smcExecutionState === 'ENTRY_READY' && smcPassed >= 5 && isSmcGeometryValid && smcOrderCheck.isSemanticConsistent;

    let smcMethodState: MethodState = 'INACTIVE';
    if (isSmcPriceInvalidated || !isSmcGeometryValid || !smcOrderCheck.isSemanticConsistent) {
      smcMethodState = 'INVALID';
      if (!isSmcGeometryValid) smcRejectionReason = 'Geometri SL/TP tidak valid (wajib SL < Entry < TP untuk Buy, TP < Entry < SL untuk Sell)';
      if (!smcOrderCheck.isSemanticConsistent) smcRejectionReason = smcOrderCheck.semanticNote;
    } else if (isSmcReactionConfirmed && isSmcPriceInZone && isSmcValid) {
      smcMethodState = (Math.abs(curPrice - smcEntry) <= tickSize * 1.5 || isSmcReactionConfirmed) ? 'TRIGGERED' : 'ACTIVE';
    } else if (targetZone && isSmcPriceInZone) {
      smcMethodState = 'ACTIVE';
    } else if (targetZone) {
      smcMethodState = 'WATCH';
    } else {
      smcMethodState = 'INACTIVE';
    }

    const smcObserverStatus: ObserverMethodState = 
      smcMethodState === 'TRIGGERED' ? 'PASS' :
      smcMethodState === 'INVALID' ? 'INVALID' :
      (smcMethodState === 'ACTIVE' || smcMethodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE';

    const smcStructureRef: StructureReference = {
      breakoutLevel: latestBOS?.price || latestCHoCH?.price,
      retestZone: targetZone ? { top: targetZone.top, bottom: targetZone.bottom } : undefined,
      invalidationLevel: smcSl,
      targetReference: { level: smcTp, description: smcDir === 'buy' ? 'Buy-Side Liquidity (BSL) Swing High' : 'Sell-Side Liquidity (SSL) Swing Low' },
      evidence: [
        hasFreshZone ? 'Fresh Unmitigated Order Block teridentifikasi' : 'Order Block telah diuji',
        isSmcReactionConfirmed ? 'Trigger konfirmasi: Rejection candle terverifikasi di area Order Block' : 'Menunggu trigger konfirmasi candle rejection',
        `SL diletakkan di luar boundary Order Block ($${zoneBoundary.toFixed(decimals)})`
      ]
    };

    const smcResult: EngineAnalysisResult = {
      engine: 'SMC',
      name: 'Smart Money Concept (SMC)',
      status: (smcMethodState === 'TRIGGERED' && isSmcValid) ? 'setup' : 'pantau',
      direction: smcDir,
      passedRules: smcPassed,
      totalRules: 7,
      entryPrice: smcEntry,
      slPrice: smcSl,
      tpPrice: smcTp,
      rrRatio: `1 : ${smcCalculatedRR}`,
      caraMasuk: formatOrderInstruction(smcDir, smcEntry, smcSl, smcTp, isSmcReactionConfirmed ? 'Trigger Rejection Terkonfirmasi di Fresh OB' : 'Menunggu Mitigasi + Rejection Candle'),
      biayaRisikoPercent: 35,
      atrDistanceVal: smcAtrDist,
      rules: smcRules,
      levelDiawasi: ['Fresh Order Block (OB)', 'Fair Value Gap (FVG)', 'Buy-Side Liquidity (BSL)', 'Sell-Side Liquidity (SSL)'],
      marketCondition,
      setupType: 'order_block_fvg_mitigation',
      setupSource: hasFreshZone ? 'SMC.FreshUnmitigatedOrderBlock' : 'SMC.TestedOrderBlock',
      entrySource: 'SMC.mitigationTriggerEvent',
      entryRuleUsed: 'SMC Native OB/FVG Mitigation + Reaction Confirmation',
      invalidation: smcDir === 'sell' ? `Di atas batas atas Supply OB ($${zoneBoundary.toFixed(decimals)})` : `Di bawah batas bawah Demand OB ($${zoneBoundary.toFixed(decimals)})`,
      structureReference: smcStructureRef,
      entryType: smcEntryType,
      entryZone: targetZone ? { top: targetZone.top, bottom: targetZone.bottom } : undefined,
      triggerCondition: 'Mitigasi harga ke Order Block + Konfirmasi Rejection Candle',
      invalidationLevel: smcSl,
      targetReference: { level: smcTp, description: smcDir === 'buy' ? 'Liquidity Pool BSL' : 'Liquidity Pool SSL' },
      evidence: smcStructureRef.evidence,
      entryDistanceFromStructure: targetZone ? Math.abs(curPrice - (smcDir === 'sell' ? targetZone.bottom : targetZone.top)) : 0,
      entryDistanceFromCurrentPrice: Math.abs(curPrice - smcEntry),
      rejectionReason: isSmcValid ? undefined : smcRejectionReason,
      executionState: smcExecutionState,
      methodState: smcMethodState,
      methodEvent: 'SMC_EVENT',
      observerStatus: smcObserverStatus,
      crossMethodContamination: false,
      marketZone: globalZone,
      structureTrend: globalTrend,
      setupDetected: smcSetupDetected,
      setupZone: targetZone ? { top: targetZone.top, bottom: targetZone.bottom } : undefined,
      triggerRequired: 'Candle Rejection Wick >= 1.0x Body atau Engulfing Close pada area mitigasi OB',
      triggerDetected: isSmcReactionConfirmed,
      triggerPrice: smcEntry,
      invalidReason: isSmcZoneInvalidated ? 'Harga menembus batas invalidasi OB' : undefined,
      runtimeTrace: {
        selectedMethod: 'SMC',
        structure: globalTrend,
        direction: smcDir === 'buy' ? 'BUY' : 'SELL',
        marketZone: globalZone,
        setupDetected: smcSetupDetected,
        setupZone: targetZone ? `$${targetZone.bottom.toFixed(decimals)} - $${targetZone.top.toFixed(decimals)}` : undefined,
        triggerRequired: 'Rejection candle pada zona mitigasi OB',
        triggerDetected: isSmcReactionConfirmed,
        triggerPrice: smcEntry,
        entryType: smcEntryType,
        entryPrice: smcEntry,
        stopLoss: smcSl,
        takeProfit: smcTp,
        status: smcExecutionState,
        rejectionReason: smcRejectionReason,
        invalidReason: isSmcZoneInvalidated ? 'Batas invalidasi tertembus' : undefined
      }
    };

    // =========================================================================
    // --- 2. SNR (SUPPORT & RESISTANCE MURNI) ENGINE ---
    // Aturan Mutlak NAVIX (Poin 46):
    // 1. Arah ditentukan dari struktur terakhir:
    //    - Bullish: HH + HL -> BUY
    //    - Bearish: LH + LL -> SELL
    //    - Jika struktur tidak jelas: STRUKTUR TIDAK VALID.
    // 2. Zona:
    //    - Zona Atas = Supply
    //    - Zona Tengah = Noise (DILARANG ENTRY)
    //    - Zona Bawah = Demand
    // 3. Entry BUY: Hanya pada HL valid + berada pada Zona Bawah / Demand.
    // 4. Entry SELL: Hanya pada LH valid + berada pada Zona Atas / Supply.
    // 5. SL: Mengikuti invalidation structure (di bawah HL untuk Buy, di atas LH untuk Sell).
    // 6. TP: Mengikuti swing berikutnya (HH untuk Buy, LL untuk Sell).
    // =========================================================================
    const nearestSupport = snrLevels.filter(l => l.type === 'SUPPORT' && l.price <= curPrice + atr * 0.25).sort((a, b) => b.price - a.price)[0];
    const nearestResistance = snrLevels.filter(l => l.type === 'RESISTANCE' && l.price >= curPrice - atr * 0.25).sort((a, b) => a.price - b.price)[0];
    
    let snrDir: 'buy' | 'sell' = 'buy';
    let activeSnr = nearestSupport;
    let isStructureTrendValid = false;

    if (globalTrend === 'BULLISH') {
      snrDir = 'buy';
      activeSnr = nearestSupport;
      isStructureTrendValid = !!structureTrendData.latestHL;
    } else if (globalTrend === 'BEARISH') {
      snrDir = 'sell';
      activeSnr = nearestResistance;
      isStructureTrendValid = !!structureTrendData.latestLH;
    } else {
      snrDir = curPrice >= (candles[0]?.close ?? curPrice) ? 'buy' : 'sell';
      activeSnr = snrDir === 'buy' ? nearestSupport : nearestResistance;
      isStructureTrendValid = false;
    }

    const isCorrectZone = snrDir === 'buy' ? globalZone === 'LOWER' : globalZone === 'UPPER';
    const snrSetupDetected = isStructureTrendValid && isCorrectZone && !!activeSnr && activeSnr.testCount >= 2;
    const isSnrNearLevel = activeSnr ? Math.abs(curPrice - activeSnr.price) <= atr * 0.25 : false;
    const snrRejectionCandle = candlePatterns.some(p => snrDir === 'buy' ? p.isBullish : !p.isBullish);
    const isSnrHLorLHConfirmed = snrDir === 'buy' 
      ? (globalTrend === 'BULLISH' && !!structureTrendData.latestHL)
      : (globalTrend === 'BEARISH' && !!structureTrendData.latestLH);

    // P2-10: Filter liquidity sweep on Equal Highs/Lows (testCount >= 3) without confirmed rejection
    const isSnrEqualHighsLows = activeSnr ? activeSnr.testCount >= 3 && !snrRejectionCandle : false;

    const isSnrTriggerConfirmed = snrSetupDetected && isSnrNearLevel && snrRejectionCandle && isSnrHLorLHConfirmed && globalZone !== 'MIDDLE' && !isSnrEqualHighsLows;

    let snrEntry: number;
    let snrRejectionReason: string | undefined;
    let snrExecutionState: 'SETUP_DETECTED' | 'WAITING_FOR_TRIGGER' | 'TRIGGER_CONFIRMED' | 'ENTRY_READY' | 'INVALIDATED' | 'NO_VALID_SETUP' = 'NO_VALID_SETUP';

    if (globalTrend === 'STRUCTURE_NOT_VALID' || !isStructureTrendValid) {
      snrEntry = curPrice;
      snrExecutionState = 'NO_VALID_SETUP';
      snrRejectionReason = 'Struktur pasar SNR tidak jelas (Struktur tidak valid: Tidak terbentuk HH+HL atau LH+LL terdefinisi)';
    } else if (globalZone === 'MIDDLE') {
      snrEntry = curPrice;
      snrExecutionState = 'NO_VALID_SETUP';
      snrRejectionReason = 'Harga berada di Zona Tengah (Noise) - DILARANG entry SNR di Zona Tengah';
    } else if (!isCorrectZone) {
      snrEntry = curPrice;
      snrExecutionState = 'NO_VALID_SETUP';
      snrRejectionReason = snrDir === 'buy' 
        ? 'Entry BUY SNR dilarang di luar Zona Bawah (Demand) - Hanya valid pada Higher Low di Zona Bawah'
        : 'Entry SELL SNR dilarang di luar Zona Atas (Supply) - Hanya valid pada Lower High di Zona Atas';
    } else if (!activeSnr || activeSnr.testCount < 2) {
      snrEntry = curPrice;
      snrExecutionState = 'NO_VALID_SETUP';
      snrRejectionReason = !activeSnr ? 'Tidak ada Key Level SNR horizontal yang teridentifikasi' : `Level baru teruji ${activeSnr.testCount}x (Wajib minimal 2x pengujian)`;
    } else if (isSnrEqualHighsLows) {
      snrEntry = activeSnr.price;
      snrExecutionState = 'WAITING_FOR_TRIGGER';
      snrRejectionReason = 'Equal Highs/Lows terdeteksi tanpa konfirmasi rejection (diperlakukan sebagai target likuiditas / rawan sweep, bukan level reversal)';
    } else if (isSnrTriggerConfirmed) {
      snrEntry = snrDir === 'buy' ? Math.min(activeSnr.price, curPrice - tickSize * 2.0) : Math.max(activeSnr.price, curPrice + tickSize * 2.0);
      snrExecutionState = 'ENTRY_READY';
    } else if (isSnrNearLevel && !snrRejectionCandle) {
      snrEntry = snrDir === 'buy' ? Math.min(curPrice, activeSnr.price) : Math.max(curPrice, activeSnr.price);
      snrExecutionState = 'WAITING_FOR_TRIGGER';
      snrRejectionReason = 'Harga telah menyentuh level SNR, tetapi belum terbentuk konfirmasi candle rejection (WAIT)';
    } else if (isSnrNearLevel && snrRejectionCandle && !isSnrHLorLHConfirmed) {
      snrEntry = snrDir === 'buy' ? Math.min(curPrice, activeSnr.price) : Math.max(curPrice, activeSnr.price);
      snrExecutionState = 'WAITING_FOR_TRIGGER';
      snrRejectionReason = 'Rejection terdeteksi pada level SNR, tetapi konfirmasi Higher Low / Lower High belum lengkap';
    } else {
      snrEntry = snrDir === 'buy' ? Math.min(curPrice, activeSnr.price) : Math.max(curPrice, activeSnr.price);
      snrExecutionState = 'WAITING_FOR_TRIGGER';
      snrRejectionReason = 'Key Level SNR teridentifikasi, menunggu harga mencapai level dan membentuk rejection';
    }
    snrEntry = parseFloat(snrEntry.toFixed(decimals));

    // Order type determination (P0-1)
    const snrOrderCheck = CloudMarketEngine.determineOrderType(snrDir, snrEntry, curPrice, tickSize, 'key_support_resistance_reaction');
    const snrEntryType: 'LIMIT' = 'LIMIT';

    // SL strictly follows swing/invalidation structure with guaranteed geometry
    let snrSlRaw: number;
    if (snrDir === 'buy') {
      const structuralLow = (structureTrendData.latestHL && structureTrendData.latestHL.price < snrEntry)
        ? structureTrendData.latestHL.price
        : (activeSnr && activeSnr.price < snrEntry ? activeSnr.price - atr * 0.25 : snrEntry - atr * 0.5);
      snrSlRaw = Math.min(structuralLow - atr * 0.15, snrEntry - atr * 0.35);
    } else {
      const structuralHigh = (structureTrendData.latestLH && structureTrendData.latestLH.price > snrEntry)
        ? structureTrendData.latestLH.price
        : (activeSnr && activeSnr.price > snrEntry ? activeSnr.price + atr * 0.25 : snrEntry + atr * 0.5);
      snrSlRaw = Math.max(structuralHigh + atr * 0.15, snrEntry + atr * 0.35);
    }
    const snrSl = parseFloat(snrSlRaw.toFixed(decimals));

    // TP strictly follows the next swing point according to method direction with guaranteed geometry
    let snrTpRaw: number;
    if (snrDir === 'buy') {
      const swingTarget = (structureTrendData.latestHH && structureTrendData.latestHH.price > snrEntry) ? structureTrendData.latestHH.price : undefined;
      const oppositeResistance = snrLevels.find(l => l.type === 'RESISTANCE' && l.price > snrEntry + atr * 0.5);
      snrTpRaw = swingTarget || (oppositeResistance ? oppositeResistance.price : snrEntry + Math.abs(snrEntry - snrSl) * 2.5);
      if (snrTpRaw <= snrEntry) {
        snrTpRaw = snrEntry + Math.max(Math.abs(snrEntry - snrSl) * 2.5, atr * 1.5);
      }
    } else {
      const swingTarget = (structureTrendData.latestLL && structureTrendData.latestLL.price < snrEntry) ? structureTrendData.latestLL.price : undefined;
      const oppositeSupport = snrLevels.find(l => l.type === 'SUPPORT' && l.price < snrEntry - atr * 0.5);
      snrTpRaw = swingTarget || (oppositeSupport ? oppositeSupport.price : snrEntry - Math.abs(snrEntry - snrSl) * 2.5);
      if (snrTpRaw >= snrEntry) {
        snrTpRaw = snrEntry - Math.max(Math.abs(snrEntry - snrSl) * 2.5, atr * 1.5);
      }
    }
    const snrTp = parseFloat(snrTpRaw.toFixed(decimals));

    const isSnrGeometryValid = snrDir === 'buy' ? (snrSl < snrEntry && snrEntry < snrTp) : (snrTp < snrEntry && snrEntry < snrSl);
    const snrRisk = Math.abs(snrEntry - snrSl);
    const snrReward = Math.abs(snrTp - snrEntry);
    const snrCalculatedRR = snrRisk > 0 ? (snrReward / snrRisk).toFixed(2) : '1:2.0';
    const snrAtrDist = parseFloat((Math.abs(curPrice - snrEntry) / (atr || 1)).toFixed(2));

    const snrRules = [
      { id: 'snr_struct', label: 'Struktur Valid: Bullish (HH+HL) atau Bearish (LH+LL)', passed: isStructureTrendValid },
      { id: 'snr_level', label: 'Key Support / Resistance Horizontal Teruji', passed: !!activeSnr && !isSnrEqualHighsLows },
      { id: 'snr_strength', label: 'Kekuatan level minimal 2x Rejection Touch', passed: (activeSnr?.testCount || 0) >= 2 },
      { id: 'snr_zone', label: 'Bukan Zona Tengah (HL di Demand / LH di Supply)', passed: isCorrectZone && globalZone !== 'MIDDLE' },
      { id: 'snr_candle', label: 'Pola konfirmasi candle rejection pada level SNR', passed: snrRejectionCandle },
      { id: 'snr_hl_lh', label: 'Konfirmasi Higher Low (Buy) atau Lower High (Sell)', passed: isSnrHLorLHConfirmed },
      { id: 'snr_rr', label: 'Risk to Reward berbasis invalidation structure & target swing', passed: snrReward >= snrRisk * 1.3 && isSnrGeometryValid },
      { id: 'snr_dist', label: 'Jarak harga ke level SNR realistis (< 0.35 ATR)', passed: snrAtrDist <= 0.35 }
    ];
    const snrPassed = snrRules.filter(r => r.passed).length;
    const isSnrValid = snrExecutionState === 'ENTRY_READY' && snrPassed >= 6 && isSnrGeometryValid && snrOrderCheck.isSemanticConsistent && !isSnrEqualHighsLows;

    let snrMethodState: MethodState = 'INACTIVE';
    if (!isStructureTrendValid || globalZone === 'MIDDLE' || !isCorrectZone || !isSnrGeometryValid || !snrOrderCheck.isSemanticConsistent) {
      snrMethodState = 'INACTIVE';
      if (!isStructureTrendValid) snrRejectionReason = 'Struktur tidak valid: Tidak terbentuk HH+HL atau LH+LL terdefinisi';
      else if (globalZone === 'MIDDLE') snrRejectionReason = 'Dilarang entry di Zona Tengah (Noise)';
      else if (!isCorrectZone) snrRejectionReason = 'Zona tidak sesuai (Wajib HL di Demand atau LH di Supply)';
      else if (!isSnrGeometryValid) snrRejectionReason = 'Geometri SL/TP tidak valid (wajib SL < Entry < TP untuk Buy, TP < Entry < SL untuk Sell)';
      else if (!snrOrderCheck.isSemanticConsistent) snrRejectionReason = snrOrderCheck.semanticNote;
    } else if (!activeSnr || activeSnr.testCount < 2 || isSnrEqualHighsLows) {
      snrMethodState = 'INACTIVE';
    } else if (isSnrTriggerConfirmed && isSnrValid) {
      snrMethodState = (Math.abs(curPrice - snrEntry) <= tickSize * 1.5 || isSnrTriggerConfirmed) ? 'TRIGGERED' : 'ACTIVE';
    } else if (isSnrNearLevel) {
      snrMethodState = 'ACTIVE';
    } else {
      snrMethodState = 'WATCH';
    }

    const snrObserverStatus: ObserverMethodState = 
      snrMethodState === 'TRIGGERED' ? 'PASS' :
      (snrMethodState === 'ACTIVE' || snrMethodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE';

    const snrStructureRef: StructureReference = {
      flipLevel: activeSnr?.price,
      retestZone: activeSnr ? { top: activeSnr.price + atr * 0.15, bottom: activeSnr.price - atr * 0.15 } : undefined,
      invalidationLevel: snrSl,
      targetReference: { level: snrTp, description: snrDir === 'buy' ? 'Key Resistance Mayor Berikutnya' : 'Key Support Mayor Berikutnya' },
      evidence: [
        activeSnr ? `Level horizontal teruji ${activeSnr.testCount}x dengan kekuatan ${activeSnr.strength}/5` : 'Level belum teruji',
        snrRejectionCandle ? 'Pola rejection candle teridentifikasi' : 'Menunggu rejection candle di level',
        `SL ditempatkan di luar zona pantulan horizontal ($${snrSl.toFixed(decimals)})`
      ]
    };

    const snrResult: EngineAnalysisResult = {
      engine: 'SNR',
      name: 'Support & Resistance (SNR)',
      status: (snrMethodState === 'TRIGGERED' && isSnrValid) ? 'setup' : 'pantau',
      direction: snrDir,
      passedRules: snrPassed,
      totalRules: 8,
      entryPrice: snrEntry,
      slPrice: snrSl,
      tpPrice: snrTp,
      rrRatio: `1 : ${snrCalculatedRR}`,
      caraMasuk: formatOrderInstruction(snrDir, snrEntry, snrSl, snrTp, isSnrTriggerConfirmed ? 'Trigger Rejection & HL/LH Terkonfirmasi di Key Level SNR' : 'Menunggu Rejection di Key Level SNR'),
      biayaRisikoPercent: 32,
      atrDistanceVal: snrAtrDist,
      rules: snrRules,
      levelDiawasi: ['Resistance Mayor', 'Support Mayor', 'Key Horizontal Level'],
      marketCondition,
      setupType: 'horizontal_key_level_rejection',
      setupSource: activeSnr ? `SNR.${activeSnr.type}` : 'SNR.HorizontalLevel',
      entrySource: 'SNR.keyLevelTriggerEvent',
      entryRuleUsed: 'SNR Native Horizontal S/R Rejection + HL/LH Confirmation',
      invalidation: snrDir === 'sell' ? `Penembusan penutupan candle di atas Resistance ($${snrSl})` : `Penembusan penutupan candle di bawah Support ($${snrSl})`,
      structureReference: snrStructureRef,
      entryType: snrEntryType,
      entryZone: activeSnr ? { top: activeSnr.price + atr * 0.15, bottom: activeSnr.price - atr * 0.15 } : undefined,
      triggerCondition: 'Rejection teruji pada Key Level + Konfirmasi HL/LH',
      invalidationLevel: snrSl,
      targetReference: { level: snrTp, description: snrDir === 'buy' ? 'Next Key Resistance' : 'Next Key Support' },
      evidence: snrStructureRef.evidence,
      entryDistanceFromStructure: activeSnr ? Math.abs(curPrice - activeSnr.price) : 0,
      entryDistanceFromCurrentPrice: Math.abs(curPrice - snrEntry),
      rejectionReason: isSnrValid ? undefined : snrRejectionReason,
      executionState: snrExecutionState,
      methodState: snrMethodState,
      methodEvent: 'SNR_EVENT',
      observerStatus: snrObserverStatus,
      crossMethodContamination: false,
      marketZone: globalZone,
      structureTrend: globalTrend,
      setupDetected: snrSetupDetected,
      setupZone: activeSnr ? { top: activeSnr.price + atr * 0.15, bottom: activeSnr.price - atr * 0.15 } : undefined,
      triggerRequired: 'Rejection candle pada Key Level SNR + Terbentuknya Higher Low (Buy) / Lower High (Sell)',
      triggerDetected: isSnrTriggerConfirmed,
      triggerPrice: snrEntry,
      runtimeTrace: {
        selectedMethod: 'SNR',
        structure: globalTrend,
        direction: snrDir === 'buy' ? 'BUY' : 'SELL',
        marketZone: globalZone,
        setupDetected: snrSetupDetected,
        setupZone: activeSnr ? `$${activeSnr.price.toFixed(decimals)}` : undefined,
        triggerRequired: 'Rejection candle + HL/LH confirmation',
        triggerDetected: isSnrTriggerConfirmed,
        triggerPrice: snrEntry,
        entryType: snrEntryType,
        entryPrice: snrEntry,
        stopLoss: snrSl,
        takeProfit: snrTp,
        status: snrExecutionState,
        rejectionReason: snrRejectionReason
      }
    };

    // =========================================================================
    // --- 3. RBS (RESISTANCE BECOME SUPPORT / SBR) ENGINE ---
    // =========================================================================
    // Filter RBS zones where level is at/below current price (support valid for BUY LIMIT)
    const validRBSZones = rbsZones.filter(z => z.type === 'RBS' && z.price <= curPrice + tickSize * 1.5);
    // Filter SBR zones where level is at/above current price (resistance valid for SELL LIMIT)
    const validSBRZones = rbsZones.filter(z => z.type === 'SBR' && z.price >= curPrice - tickSize * 1.5);

    const nearestRBS = validRBSZones.sort((a, b) => Math.abs(curPrice - a.price) - Math.abs(curPrice - b.price))[0];
    const nearestSBR = validSBRZones.sort((a, b) => Math.abs(curPrice - a.price) - Math.abs(curPrice - b.price))[0];

    let rbsDir: 'buy' | 'sell' = 'buy';
    let activeRbs = nearestRBS;
    if (nearestRBS && nearestSBR) {
      if (Math.abs(curPrice - nearestSBR.price) < Math.abs(curPrice - nearestRBS.price)) {
        rbsDir = 'sell';
        activeRbs = nearestSBR;
      } else {
        rbsDir = 'buy';
        activeRbs = nearestRBS;
      }
    } else if (nearestSBR) {
      rbsDir = 'sell';
      activeRbs = nearestSBR;
    } else if (nearestRBS) {
      rbsDir = 'buy';
      activeRbs = nearestRBS;
    } else {
      activeRbs = undefined;
    }

    const rbsSetupDetected = !!activeRbs && activeRbs.breakoutPrice !== undefined;
    const distFromRetestZone = activeRbs ? Math.abs(curPrice - activeRbs.price) : atr * 2;
    const rbsIsChasing = distFromRetestZone > atr * 0.50;

    let rbsEntry: number;
    let rbsRejectionReason: string | undefined;
    let rbsExecutionState: 'SETUP_DETECTED' | 'WAITING_FOR_TRIGGER' | 'TRIGGER_CONFIRMED' | 'ENTRY_READY' | 'INVALIDATED' | 'NO_VALID_SETUP' = 'NO_VALID_SETUP';

    if (!activeRbs) {
      rbsEntry = curPrice;
      rbsExecutionState = 'NO_VALID_SETUP';
      rbsRejectionReason = 'Tidak ditemukan struktur breakout flip RBS/SBR yang valid';
    } else if (rbsDir === 'buy' && curPrice < activeRbs.price) {
      rbsEntry = curPrice;
      rbsExecutionState = 'INVALIDATED';
      rbsRejectionReason = 'Harga pasar berada di bawah level RBS (Level Support tertembus/Invalid)';
    } else if (rbsDir === 'sell' && curPrice > activeRbs.price) {
      rbsEntry = curPrice;
      rbsExecutionState = 'INVALIDATED';
      rbsRejectionReason = 'Harga pasar berada di atas level SBR (Level Resistance tertembus/Invalid)';
    } else if (activeRbs.retested && activeRbs.isConfirmedRejection && !rbsIsChasing) {
      rbsEntry = rbsDir === 'buy' ? Math.min(activeRbs.price, curPrice - tickSize * 2.0) : Math.max(activeRbs.price, curPrice + tickSize * 2.0);
      rbsExecutionState = 'ENTRY_READY';
    } else if (!activeRbs.retested) {
      rbsEntry = rbsDir === 'buy' ? Math.min(curPrice, activeRbs.price) : Math.max(curPrice, activeRbs.price);
      rbsExecutionState = 'WAITING_FOR_TRIGGER';
      rbsRejectionReason = 'Breakout terkonfirmasi, menunggu harga retest ke level flip RBS/SBR (WAIT)';
    } else if (activeRbs.retested && !activeRbs.isConfirmedRejection) {
      rbsEntry = rbsDir === 'buy' ? Math.min(curPrice, activeRbs.price) : Math.max(curPrice, activeRbs.price);
      rbsExecutionState = 'WAITING_FOR_TRIGGER';
      rbsRejectionReason = 'Harga berada di area flip namun belum terbentuk konfirmasi candle hold/rejection (WAIT)';
    } else if (rbsIsChasing) {
      rbsEntry = rbsDir === 'buy' ? Math.min(curPrice, activeRbs.price) : Math.max(curPrice, activeRbs.price);
      rbsExecutionState = 'WAITING_FOR_TRIGGER';
      rbsRejectionReason = `Entry chasing terdeteksi: jarak ke level flip (${(distFromRetestZone / (atr || 1)).toFixed(2)} ATR) melebihi batas struktural (0.50 ATR)`;
    } else {
      rbsEntry = rbsDir === 'buy' ? Math.min(curPrice, activeRbs.price) : Math.max(curPrice, activeRbs.price);
      rbsExecutionState = 'WAITING_FOR_TRIGGER';
      rbsRejectionReason = 'Menunggu konfirmasi retest valid';
    }
    rbsEntry = parseFloat(rbsEntry.toFixed(decimals));

    // Order type determination (P0-1)
    const rbsOrderCheck = CloudMarketEngine.determineOrderType(
      rbsDir,
      rbsEntry,
      curPrice,
      tickSize,
      activeRbs?.type === 'RBS' ? 'resistance_breakout_retest' : 'support_breakdown_retest'
    );
    const rbsEntryType: 'LIMIT' = 'LIMIT';

    // SL is strictly based on the structural retest low / high beyond the flip level with guaranteed geometry
    let rbsSlRaw: number;
    if (activeRbs) {
      if (rbsDir === 'buy') {
        const structuralBase = activeRbs.retestLow !== undefined ? Math.min(activeRbs.retestLow, activeRbs.price) : activeRbs.price;
        rbsSlRaw = Math.min(structuralBase - atr * 0.35, rbsEntry - atr * 0.35);
      } else {
        const structuralBase = activeRbs.retestHigh !== undefined ? Math.max(activeRbs.retestHigh, activeRbs.price) : activeRbs.price;
        rbsSlRaw = Math.max(structuralBase + atr * 0.35, rbsEntry + atr * 0.35);
      }
    } else {
      rbsSlRaw = rbsDir === 'buy' ? rbsEntry - atr * 0.5 : rbsEntry + atr * 0.5;
    }
    const rbsSl = parseFloat(rbsSlRaw.toFixed(decimals));

    // TP is strictly based on the previous swing high/low formed by the breakout expansion with guaranteed geometry
    let rbsTpRaw: number;
    if (activeRbs) {
      const breakoutIdx = activeRbs.breakoutIndex || 0;
      const expansionSlice = candles.slice(breakoutIdx);
      if (rbsDir === 'buy') {
        const expansionHigh = expansionSlice.length > 0 ? Math.max(...expansionSlice.map(c => c.high)) : rbsEntry + atr * 1.5;
        rbsTpRaw = Math.max(expansionHigh, rbsEntry + Math.max(Math.abs(rbsEntry - rbsSl) * 2.5, atr * 1.5));
      } else {
        const expansionLow = expansionSlice.length > 0 ? Math.min(...expansionSlice.map(c => c.low)) : rbsEntry - atr * 1.5;
        rbsTpRaw = Math.min(expansionLow, rbsEntry - Math.max(Math.abs(rbsEntry - rbsSl) * 2.5, atr * 1.5));
      }
    } else {
      rbsTpRaw = rbsDir === 'buy' ? rbsEntry + atr * 2.0 : rbsEntry - atr * 2.0;
    }
    const rbsTp = parseFloat(rbsTpRaw.toFixed(decimals));

    const isRbsGeometryValid = rbsDir === 'buy' ? (rbsSl < rbsEntry && rbsEntry < rbsTp) : (rbsTp < rbsEntry && rbsEntry < rbsSl);
    const rbsRisk = Math.abs(rbsEntry - rbsSl);
    const rbsReward = Math.abs(rbsTp - rbsEntry);
    const rbsCalculatedRR = rbsRisk > 0 ? (rbsReward / rbsRisk).toFixed(2) : '1:2.0';
    const rbsAtrDist = parseFloat((Math.abs(curPrice - rbsEntry) / (atr || 1)).toFixed(2));

    const rbsRules = [
      { id: 'rbs_breakout', label: 'Struktur Breakout sebelumnya valid (Level asal terkonfirmasi)', passed: !!activeRbs },
      { id: 'rbs_flip', label: 'Level Flip RBS/SBR terdefinisi secara presisi', passed: !!activeRbs },
      { id: 'rbs_retest', label: 'Harga telah melakukan retest ke zona flip', passed: !!activeRbs?.retested },
      { id: 'rbs_candle', label: 'Konfirmasi rejection candle pada area Flip', passed: !!activeRbs?.isConfirmedRejection },
      { id: 'rbs_rr', label: 'Risk to Reward berbasis swing ekspansi breakout', passed: rbsReward >= rbsRisk * 1.3 && isRbsGeometryValid },
      { id: 'rbs_dist', label: 'Bebas dari entry chasing (Jarak ke flip <= 0.50 ATR)', passed: !rbsIsChasing }
    ];
    const rbsPassed = rbsRules.filter(r => r.passed).length;
    const isRbsValid = rbsExecutionState === 'ENTRY_READY' && rbsPassed >= 4 && isRbsGeometryValid && rbsOrderCheck.isSemanticConsistent && !rbsIsChasing;

    let rbsMethodState: MethodState = 'INACTIVE';
    if (!activeRbs || !isRbsGeometryValid || !rbsOrderCheck.isSemanticConsistent) {
      rbsMethodState = 'INACTIVE';
      if (!isRbsGeometryValid) rbsRejectionReason = 'Geometri SL/TP tidak valid (wajib SL < Entry < TP untuk Buy, TP < Entry < SL untuk Sell)';
      if (!rbsOrderCheck.isSemanticConsistent) rbsRejectionReason = rbsOrderCheck.semanticNote;
    } else if (activeRbs.retested && activeRbs.isConfirmedRejection && !rbsIsChasing && isRbsValid) {
      rbsMethodState = (Math.abs(curPrice - rbsEntry) <= tickSize * 1.5 || (activeRbs.retested && activeRbs.isConfirmedRejection)) ? 'TRIGGERED' : 'ACTIVE';
    } else if (activeRbs.retested && !rbsIsChasing) {
      rbsMethodState = 'ACTIVE';
    } else if (!activeRbs.retested) {
      rbsMethodState = 'WATCH';
    } else {
      rbsMethodState = 'INACTIVE';
    }

    const rbsObserverStatus: ObserverMethodState =
      rbsMethodState === 'TRIGGERED' ? 'PASS' :
      (rbsMethodState === 'ACTIVE' || rbsMethodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE';

    const rbsStructureRef: StructureReference = {
      swingIndex: activeRbs?.swingIndex,
      swingPrice: activeRbs?.swingPrice,
      breakoutLevel: activeRbs?.price,
      breakoutCandleIndex: activeRbs?.breakoutIndex,
      retestZone: activeRbs ? { top: activeRbs.price + atr * 0.15, bottom: activeRbs.price - atr * 0.15 } : undefined,
      retestCandleIndex: activeRbs?.retestIndex,
      retestPrice: activeRbs?.retestPrice,
      flipLevel: activeRbs?.price,
      triggerCondition: activeRbs?.isConfirmedRejection ? 'Rejection candle terkonfirmasi di zona flip' : 'Menunggu rejection candle di zona flip',
      triggerCandleIndex: activeRbs?.triggerCandleIndex,
      invalidationLevel: rbsSl,
      targetReference: { level: rbsTp, description: rbsDir === 'buy' ? 'Swing High Ekspansi Breakout Asal' : 'Swing Low Ekspansi Breakdown Asal' },
      evidence: [
        activeRbs ? `Breakout terkonfirmasi pada candle #${activeRbs.breakoutIndex} di level $${activeRbs.price.toFixed(decimals)}` : 'Belum ada breakout',
        activeRbs?.retested ? `Retest terjadi pada candle #${activeRbs.retestIndex}` : 'Harga belum mencapai zona retest',
        activeRbs?.isConfirmedRejection ? 'Rejection candle terverifikasi' : 'Menunggu konfirmasi rejection candle',
        `SL ditempatkan di bawah level retest struktur ($${rbsSl.toFixed(decimals)})`
      ]
    };

    const rbsResult: EngineAnalysisResult = {
      engine: 'RBS',
      name: 'RBS & SBR (Structure Flip Zone)',
      status: (rbsMethodState === 'TRIGGERED' && isRbsValid) ? 'setup' : 'pantau',
      direction: rbsDir,
      passedRules: rbsPassed,
      totalRules: 6,
      entryPrice: rbsEntry,
      slPrice: rbsSl,
      tpPrice: rbsTp,
      rrRatio: `1 : ${rbsCalculatedRR}`,
      caraMasuk: formatOrderInstruction(rbsDir, rbsEntry, rbsSl, rbsTp, rbsDir === 'sell' ? 'Retest SBR Flip Terdekat' : 'Retest RBS Flip Terdekat'),
      biayaRisikoPercent: 34,
      atrDistanceVal: rbsAtrDist,
      rules: rbsRules,
      levelDiawasi: ['RBS (Resistance Become Support)', 'SBR (Support Become Resistance)', 'Breakout Retest Zone'],
      marketCondition,
      setupType: activeRbs?.type === 'RBS' ? 'resistance_breakout_retest' : 'support_breakdown_retest',
      setupSource: activeRbs ? `RBS.${activeRbs.type}` : 'RBS.FlipZone',
      entrySource: 'RBS.retestTriggerEvent',
      entryRuleUsed: activeRbs?.type === 'SBR' 
        ? 'SBR Native Breakdown + Retest Confirmation' 
        : 'RBS Native Breakout + Retest Confirmation',
      invalidation: rbsDir === 'sell' ? `Penembusan kembali ke atas level SBR ($${rbsSl})` : `Penembusan kembali ke bawah level RBS ($${rbsSl})`,
      structureReference: rbsStructureRef,
      entryType: rbsEntryType,
      entryZone: activeRbs ? { top: activeRbs.price + atr * 0.15, bottom: activeRbs.price - atr * 0.15 } : undefined,
      triggerCondition: rbsStructureRef.triggerCondition,
      invalidationLevel: rbsSl,
      targetReference: rbsStructureRef.targetReference,
      evidence: rbsStructureRef.evidence,
      entryDistanceFromStructure: distFromRetestZone,
      entryDistanceFromCurrentPrice: Math.abs(curPrice - rbsEntry),
      distanceFromRetestZone: distFromRetestZone,
      rejectionReason: isRbsValid ? undefined : rbsRejectionReason,
      executionState: rbsExecutionState,
      methodState: rbsMethodState,
      methodEvent: activeRbs?.type === 'SBR' ? 'SBR_EVENT' : 'RBS_EVENT',
      observerStatus: rbsObserverStatus,
      crossMethodContamination: false,
      marketZone: globalZone,
      structureTrend: globalTrend,
      setupDetected: rbsSetupDetected,
      setupZone: activeRbs ? { top: activeRbs.price + atr * 0.15, bottom: activeRbs.price - atr * 0.15 } : undefined,
      triggerRequired: 'Retest pada level flip + Konfirmasi candle rejection/hold',
      triggerDetected: !!activeRbs?.retested && !!activeRbs?.isConfirmedRejection,
      triggerPrice: rbsEntry,
      runtimeTrace: {
        selectedMethod: 'RBS',
        structure: globalTrend,
        direction: rbsDir === 'buy' ? 'BUY' : 'SELL',
        marketZone: globalZone,
        setupDetected: rbsSetupDetected,
        setupZone: activeRbs ? `$${activeRbs.price.toFixed(decimals)}` : undefined,
        triggerRequired: 'Retest + Rejection/Hold',
        triggerDetected: !!activeRbs?.retested && !!activeRbs?.isConfirmedRejection,
        triggerPrice: rbsEntry,
        entryType: rbsEntryType,
        entryPrice: rbsEntry,
        stopLoss: rbsSl,
        takeProfit: rbsTp,
        status: rbsExecutionState,
        rejectionReason: rbsRejectionReason
      }
    };

    // =========================================================================
    // --- 4. FIBONACCI (GOLDEN POCKET 0.618 - 0.705 OTE) ENGINE ---
    // =========================================================================
    const fibDir: 'buy' | 'sell' = fibSetup ? (fibSetup.isBullish ? 'buy' : 'sell') : (curPrice >= (candles[0]?.close ?? curPrice) ? 'buy' : 'sell');
    const gpLevel = fibSetup?.levels.find(l => l.ratio === 0.618);
    const oteMaxLevel = fibSetup?.levels.find(l => l.ratio === 0.705);
    const fibSetupDetected = !!fibSetup && !!gpLevel && (fibSetup.isImpulseValid ?? true);
    
    const oteTop = gpLevel && oteMaxLevel ? Math.max(gpLevel.price, oteMaxLevel.price) : (gpLevel ? gpLevel.price + atr * 0.15 : 0);
    const oteBottom = gpLevel && oteMaxLevel ? Math.min(gpLevel.price, oteMaxLevel.price) : (gpLevel ? gpLevel.price - atr * 0.15 : 0);
    const isFibAtGoldenPocket = (gpLevel && oteMaxLevel) 
      ? (curPrice >= oteBottom - atr * 0.15 && curPrice <= oteTop + atr * 0.15) 
      : (gpLevel ? Math.abs(curPrice - gpLevel.price) <= atr * 0.35 : false);
    const fibRejectionCandle = candlePatterns.some(p => fibDir === 'buy' ? p.isBullish : !p.isBullish);
    const isFibTriggerConfirmed = fibSetupDetected && isFibAtGoldenPocket && fibRejectionCandle;

    let fibEntry: number;
    let fibRejectionReason: string | undefined;
    let fibExecutionState: 'SETUP_DETECTED' | 'WAITING_FOR_TRIGGER' | 'TRIGGER_CONFIRMED' | 'ENTRY_READY' | 'INVALIDATED' | 'NO_VALID_SETUP' = 'NO_VALID_SETUP';

    if (!fibSetup || !fibSetup.isImpulseValid) {
      fibEntry = curPrice;
      fibExecutionState = 'NO_VALID_SETUP';
      fibRejectionReason = fibSetup?.impulseInvalidReason || 'Tidak ada struktur gelombang impulse Fibonacci yang valid';
    } else if (isFibTriggerConfirmed) {
      fibEntry = fibDir === 'buy' ? Math.min(gpLevel.price, curPrice - tickSize * 2.0) : Math.max(gpLevel.price, curPrice + tickSize * 2.0);
      fibExecutionState = 'ENTRY_READY';
    } else if (isFibAtGoldenPocket && !fibRejectionCandle) {
      fibEntry = fibDir === 'buy' ? Math.min(curPrice, gpLevel ? gpLevel.price : curPrice) : Math.max(curPrice, gpLevel ? gpLevel.price : curPrice);
      fibExecutionState = 'WAITING_FOR_TRIGGER';
      fibRejectionReason = 'Harga telah mencapai Golden Pocket 0.618 - 0.705 OTE, menunggu konfirmasi reaksi candle rejection (WAIT)';
    } else {
      fibEntry = fibDir === 'buy' ? Math.min(curPrice, gpLevel ? gpLevel.price : curPrice) : Math.max(curPrice, gpLevel ? gpLevel.price : curPrice);
      fibExecutionState = 'WAITING_FOR_TRIGGER';
      fibRejectionReason = 'Gelombang impulse teridentifikasi, menunggu harga retrace masuk ke area Golden Pocket 0.618 - 0.705 OTE';
    }
    fibEntry = parseFloat(fibEntry.toFixed(decimals));

    // Order type determination (P0-1)
    const fibOrderCheck = CloudMarketEngine.determineOrderType(
      fibDir,
      fibEntry,
      curPrice,
      tickSize,
      'golden_pocket_ote_retracement'
    );
    const fibEntryType: 'LIMIT' = 'LIMIT';

    // SL is strictly beyond the Swing Origin (1.000 ratio) with guaranteed geometry
    let fibSlRaw: number;
    if (fibDir === 'buy') {
      const swingBase = fibSetup && fibSetup.swingLow < fibEntry ? fibSetup.swingLow : fibEntry;
      fibSlRaw = Math.min(swingBase - atr * 0.25, fibEntry - atr * 0.35);
    } else {
      const swingBase = fibSetup && fibSetup.swingHigh > fibEntry ? fibSetup.swingHigh : fibEntry;
      fibSlRaw = Math.max(swingBase + atr * 0.25, fibEntry + atr * 0.35);
    }
    const fibSl = parseFloat(fibSlRaw.toFixed(decimals));

    // TP is strictly the 0.0% Swing Origin (TP1) or 1.618 Extension (TP2) with guaranteed geometry
    const extLevel = fibSetup?.levels.find(l => l.ratio === 1.618);
    let fibTpRaw: number;
    if (fibDir === 'buy') {
      const targetHigh = extLevel && extLevel.price > fibEntry ? extLevel.price : (fibSetup && fibSetup.swingHigh > fibEntry ? fibSetup.swingHigh : fibEntry + Math.abs(fibEntry - fibSl) * 2.5);
      fibTpRaw = Math.max(targetHigh, fibEntry + Math.max(Math.abs(fibEntry - fibSl) * 2.5, atr * 1.5));
    } else {
      const targetLow = extLevel && extLevel.price < fibEntry ? extLevel.price : (fibSetup && fibSetup.swingLow < fibEntry ? fibSetup.swingLow : fibEntry - Math.abs(fibEntry - fibSl) * 2.5);
      fibTpRaw = Math.min(targetLow, fibEntry - Math.max(Math.abs(fibEntry - fibSl) * 2.5, atr * 1.5));
    }
    const fibTp = parseFloat(fibTpRaw.toFixed(decimals));

    const isFibGeometryValid = fibDir === 'buy' ? (fibSl < fibEntry && fibEntry < fibTp) : (fibTp < fibEntry && fibEntry < fibSl);
    const fibRisk = Math.abs(fibEntry - fibSl);
    const fibReward = Math.abs(fibTp - fibEntry);
    const fibCalculatedRR = fibRisk > 0 ? (fibReward / fibRisk).toFixed(2) : '1:2.0';
    const fibAtrDist = parseFloat((Math.abs(curPrice - fibEntry) / (atr || 1)).toFixed(2));

    const fibRules = [
      { id: 'fib_impulse', label: 'Swing impulse terarah jelas (High/Low Valid)', passed: !!fibSetup && (fibSetup.isImpulseValid ?? true) },
      { id: 'fib_gp', label: 'Retracement masuk ke Golden Pocket 0.618 - 0.705 OTE', passed: isFibAtGoldenPocket },
      { id: 'fib_rejection', label: 'Konfirmasi pola candle rejection di level Fib', passed: fibRejectionCandle },
      { id: 'fib_bias', label: 'Selaras dengan bias gelombang retracement', passed: true },
      { id: 'fib_rr', label: 'Risk to Reward berbasis Golden Expansion 1.618', passed: fibReward >= fibRisk * 1.4 && isFibGeometryValid },
      { id: 'fib_dist', label: 'Jarak harga ke Golden Pocket terjangkau (< 0.35 ATR)', passed: fibAtrDist <= 0.35 }
    ];
    const fibPassed = fibRules.filter(r => r.passed).length;
    const isFibValid = fibExecutionState === 'ENTRY_READY' && fibPassed >= 4 && isFibGeometryValid && fibOrderCheck.isSemanticConsistent;

    let fibMethodState: MethodState = 'INACTIVE';
    if (!fibSetup || !fibSetup.isImpulseValid || !isFibGeometryValid || !fibOrderCheck.isSemanticConsistent) {
      fibMethodState = 'INVALID';
      if (!isFibGeometryValid) fibRejectionReason = 'Geometri SL/TP tidak valid (wajib SL < Entry < TP untuk Buy, TP < Entry < SL untuk Sell)';
      if (!fibOrderCheck.isSemanticConsistent) fibRejectionReason = fibOrderCheck.semanticNote;
    } else if (isFibTriggerConfirmed && isFibValid) {
      fibMethodState = (Math.abs(curPrice - fibEntry) <= tickSize * 1.5 || isFibTriggerConfirmed) ? 'TRIGGERED' : 'ACTIVE';
    } else if (isFibAtGoldenPocket) {
      fibMethodState = 'ACTIVE';
    } else if (fibSetupDetected) {
      fibMethodState = 'WATCH';
    } else {
      fibMethodState = 'INACTIVE';
    }

    const fibObserverStatus: ObserverMethodState =
      fibMethodState === 'TRIGGERED' ? 'PASS' :
      fibMethodState === 'INVALID' ? 'INVALID' :
      (fibMethodState === 'ACTIVE' || fibMethodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE';

    const fibStructureRef: StructureReference = {
      swingHigh: fibSetup ? { index: 0, price: fibSetup.swingHigh } : undefined,
      swingLow: fibSetup ? { index: 0, price: fibSetup.swingLow } : undefined,
      retestZone: gpLevel && oteMaxLevel ? { top: oteTop, bottom: oteBottom } : undefined,
      invalidationLevel: fibSl,
      targetReference: { level: fibTp, description: 'Fibonacci 1.618 Golden Expansion Target' },
      evidence: [
        fibSetup ? `Impulse Swing High ($${fibSetup.swingHigh.toFixed(decimals)}) & Swing Low ($${fibSetup.swingLow.toFixed(decimals)})` : 'Tidak ada swing impulse',
        gpLevel && oteMaxLevel ? `Area Golden Pocket OTE (0.618 - 0.705): $${oteBottom.toFixed(decimals)} - $${oteTop.toFixed(decimals)}` : 'Level OTE tidak tersedia',
        `SL ditempatkan di luar batas 1.000 Swing Origin ($${fibSl.toFixed(decimals)})`
      ]
    };

    const fibResult: EngineAnalysisResult = {
      engine: 'FIBONACCI',
      name: 'Fibonacci Retracement & OTE',
      status: (fibMethodState === 'TRIGGERED' && isFibValid) ? 'setup' : 'pantau',
      direction: fibDir,
      passedRules: fibPassed,
      totalRules: 6,
      entryPrice: fibEntry,
      slPrice: fibSl,
      tpPrice: fibTp,
      rrRatio: `1 : ${fibCalculatedRR}`,
      caraMasuk: formatOrderInstruction(fibDir, fibEntry, fibSl, fibTp, isFibTriggerConfirmed ? 'Trigger Rejection di Golden Pocket 0.618 - 0.705 OTE' : 'Menunggu Retracement ke Golden Pocket 0.618 - 0.705 OTE'),
      biayaRisikoPercent: 35,
      atrDistanceVal: fibAtrDist,
      rules: fibRules,
      levelDiawasi: ['Fib 0.618 Golden Pocket (OTE_MIN)', 'Fib 0.705 Institutional OTE (OTE_MAX)', 'Fib 0.500 Equilibrium', 'Fib 1.618 Extension'],
      marketCondition,
      setupType: 'golden_pocket_ote_retracement',
      setupSource: 'FIBONACCI.GoldenPocket',
      entrySource: 'FIBONACCI.goldenPocketTriggerEvent',
      entryRuleUsed: 'Fibonacci Native 0.618-0.705 OTE Retracement + Rejection Confirmation',
      invalidation: fibDir === 'sell' ? `Penembusan swing high 1.0 ($${fibSl})` : `Penembusan swing low 1.0 ($${fibSl})`,
      structureReference: fibStructureRef,
      entryType: fibEntryType,
      entryZone: fibStructureRef.retestZone,
      triggerCondition: 'Retracement menyentuh 0.618 - 0.705 OTE + Rejection Candle',
      invalidationLevel: fibSl,
      targetReference: fibStructureRef.targetReference,
      evidence: fibStructureRef.evidence,
      entryDistanceFromStructure: gpLevel ? Math.abs(curPrice - gpLevel.price) : 0,
      entryDistanceFromCurrentPrice: Math.abs(curPrice - fibEntry),
      rejectionReason: isFibValid ? undefined : fibRejectionReason,
      executionState: fibExecutionState,
      methodState: fibMethodState,
      methodEvent: 'FIB_EVENT',
      observerStatus: fibObserverStatus,
      crossMethodContamination: false,
      marketZone: globalZone,
      structureTrend: globalTrend,
      setupDetected: fibSetupDetected,
      setupZone: gpLevel && oteMaxLevel ? { top: oteTop, bottom: oteBottom } : undefined,
      triggerRequired: 'Retracement pada Golden Pocket 0.618 - 0.705 + Konfirmasi candle rejection',
      triggerDetected: isFibTriggerConfirmed,
      triggerPrice: fibEntry,
      runtimeTrace: {
        selectedMethod: 'FIBONACCI',
        structure: globalTrend,
        direction: fibDir === 'buy' ? 'BUY' : 'SELL',
        marketZone: globalZone,
        setupDetected: fibSetupDetected,
        setupZone: gpLevel ? `$${gpLevel.price.toFixed(decimals)}` : undefined,
        triggerRequired: 'Golden Pocket Rejection',
        triggerDetected: isFibTriggerConfirmed,
        triggerPrice: fibEntry,
        entryType: fibEntryType,
        entryPrice: fibEntry,
        stopLoss: fibSl,
        takeProfit: fibTp,
        status: fibExecutionState,
        rejectionReason: fibRejectionReason
      }
    };

    // =========================================================================
    // --- 5. CRT (CANDLE RANGE THEORY) ENGINE ---
    // =========================================================================
    const hasCrtSweep = crtSetup && crtSetup.manipulationType !== 'NONE' && !crtSetup.isSweepClosedOutside;
    const crtDir: 'buy' | 'sell' = crtSetup?.manipulationType === 'BEAR_TRAP_LOW'
      ? 'buy'
      : (crtSetup?.manipulationType === 'BULL_TRAP_HIGH' ? 'sell' : 'buy');

    const crtSetupDetected = !!hasCrtSweep;
    const crtIsReclaimed = crtSetup?.isConfirmed ?? false;
    const crtRejectionCandle = candlePatterns.some(p => crtDir === 'buy' ? p.isBullish : !p.isBullish);

    // Dynamic SL calculation anchored to the Judas Sweep Wick with guaranteed geometry
    let crtSlRaw: number;
    if (crtSetup && crtSetup.judasSweepPrice !== undefined) {
      crtSlRaw = crtDir === 'sell'
        ? Math.max(crtSetup.judasSweepPrice + atr * 0.15, curPrice + atr * 0.35)
        : Math.min(crtSetup.judasSweepPrice - atr * 0.15, curPrice - atr * 0.35);
    } else if (crtSetup) {
      crtSlRaw = crtDir === 'sell' ? Math.max(crtSetup.rangeHigh + atr * 0.25, curPrice + atr * 0.35) : Math.min(crtSetup.rangeLow - atr * 0.25, curPrice - atr * 0.35);
    } else {
      crtSlRaw = crtDir === 'sell' ? curPrice + atr * 0.5 : curPrice - atr * 0.5;
    }
    const crtSl = parseFloat(crtSlRaw.toFixed(decimals));

    // Hard Invalidation Checks against Live Market Price
    let isCrtPriceInvalidated = false;
    let crtInvalidationMsg = '';
    if (crtSetup && hasCrtSweep) {
      if (crtDir === 'buy') {
        if (curPrice <= crtSl) {
          isCrtPriceInvalidated = true;
          crtInvalidationMsg = `Harga live ($${curPrice}) telah menembus batas invalidasi Judas Low / SL ($${crtSl})`;
        } else if (curPrice >= crtSetup.rangeHigh) {
          isCrtPriceInvalidated = true;
          crtInvalidationMsg = `Harga live ($${curPrice}) telah mencapai target Range High (Setup CRT selesai / kadaluarsa)`;
        }
      } else {
        if (curPrice >= crtSl) {
          isCrtPriceInvalidated = true;
          crtInvalidationMsg = `Harga live ($${curPrice}) telah menembus batas invalidasi Judas High / SL ($${crtSl})`;
        } else if (curPrice <= crtSetup.rangeLow) {
          isCrtPriceInvalidated = true;
          crtInvalidationMsg = `Harga live ($${curPrice}) telah mencapai target Range Low (Setup CRT selesai / kadaluarsa)`;
        }
      }
    }

    // Realistic Target (TP) strictly anchored to Opposite Range Boundary & Realistic Expansion with guaranteed geometry
    let crtTpRaw: number;
    if (crtSetup) {
      if (crtDir === 'buy') {
        crtTpRaw = Math.max(crtSetup.rangeHigh, curPrice + Math.max(Math.abs(curPrice - crtSl) * 2.5, atr * 1.5));
      } else {
        crtTpRaw = Math.min(crtSetup.rangeLow, curPrice - Math.max(Math.abs(curPrice - crtSl) * 2.5, atr * 1.5));
      }
    } else {
      crtTpRaw = crtDir === 'sell' ? curPrice - atr * 1.5 : curPrice + atr * 1.5;
    }
    const crtTp = parseFloat(crtTpRaw.toFixed(decimals));

    // Entry Determination: At Reclaimed Level (Range Low for Buy, Range High for Sell) or Live Price if freshly inside
    let crtEntry: number;
    let crtRejectionReason: string | undefined;
    let crtExecutionState: 'SETUP_DETECTED' | 'WAITING_FOR_TRIGGER' | 'TRIGGER_CONFIRMED' | 'ENTRY_READY' | 'INVALIDATED' | 'NO_VALID_SETUP' = 'NO_VALID_SETUP';

    const isPriceInsideReclaimedZone = crtSetup && (
      crtDir === 'buy'
        ? (curPrice >= crtSetup.rangeLow - atr * 0.15 && curPrice <= crtSetup.midRange + atr * 0.25)
        : (curPrice <= crtSetup.rangeHigh + atr * 0.15 && curPrice >= crtSetup.midRange - atr * 0.25)
    );

    const isCrtTriggerConfirmed = crtSetupDetected && crtIsReclaimed && !isCrtPriceInvalidated && (isPriceInsideReclaimedZone || crtRejectionCandle);

    if (!crtSetup || !hasCrtSweep) {
      crtEntry = curPrice;
      crtExecutionState = 'NO_VALID_SETUP';
      crtRejectionReason = !crtSetup
        ? 'Tidak ada Session Range (RH/RL) yang teridentifikasi'
        : 'Tidak ada Judas manipulation sweep yang terkonfirmasi pada batas Range';
    } else if (isCrtPriceInvalidated) {
      crtEntry = curPrice;
      crtExecutionState = 'INVALIDATED';
      crtRejectionReason = crtInvalidationMsg;
    } else if (isCrtTriggerConfirmed) {
      crtEntry = crtDir === 'buy' ? Math.min(crtSetup.rangeLow, curPrice - tickSize * 2.0) : Math.max(crtSetup.rangeHigh, curPrice + tickSize * 2.0);
      crtExecutionState = 'ENTRY_READY';
    } else {
      crtEntry = crtDir === 'buy' ? Math.min(curPrice, crtSetup.rangeLow) : Math.max(curPrice, crtSetup.rangeHigh);
      crtExecutionState = 'WAITING_FOR_TRIGGER';
      crtRejectionReason = 'Judas Sweep terdeteksi, menunggu candle konfirmasi reclaim masuk kembali ke dalam range (WAIT)';
    }
    crtEntry = parseFloat(crtEntry.toFixed(decimals));

    // Order type determination (P0-1)
    const crtOrderCheck = CloudMarketEngine.determineOrderType(
      crtDir,
      crtEntry,
      curPrice,
      tickSize,
      'candle_range_theory_judas_reclaim'
    );
    const crtEntryType: 'LIMIT' = 'LIMIT';

    const isCrtGeometryValid = crtDir === 'buy' ? (crtSl < crtEntry && crtEntry < crtTp) : (crtTp < crtEntry && crtEntry < crtSl);
    const crtRisk = Math.abs(crtEntry - crtSl);
    const crtReward = Math.abs(crtTp - crtEntry);
    const crtCalculatedRR = crtRisk > 0 ? (crtReward / crtRisk).toFixed(2) : '1:2.0';
    const crtAtrDist = parseFloat((Math.abs(curPrice - crtEntry) / (atr || 1)).toFixed(2));

    const crtRules = [
      { id: 'crt_range', label: 'Range High (RH) & Range Low (RL) Session Valid', passed: !!crtSetup },
      { id: 'crt_judas', label: 'Judas Manipulation / Liquidity Sweep Terjadi', passed: !!hasCrtSweep },
      { id: 'crt_reclaim', label: 'Close-Back-Inside Range Reclaim Terkonfirmasi', passed: !!crtIsReclaimed },
      { id: 'crt_expansion', label: 'Target Range High / Low Berlawanan Terdefinisi', passed: !!crtSetup },
      { id: 'crt_candle', label: 'Rejection candle menutup kembali di dalam range', passed: crtRejectionCandle || (crtIsReclaimed && !isCrtPriceInvalidated) },
      { id: 'crt_rr', label: 'Risk to Reward berbasis Target Range Seberang', passed: crtReward >= crtRisk * 1.3 && isCrtGeometryValid }
    ];
    const crtPassed = crtRules.filter(r => r.passed).length;
    const isCrtValid = crtExecutionState === 'ENTRY_READY' && crtPassed >= 5 && isCrtGeometryValid && crtOrderCheck.isSemanticConsistent && !isCrtPriceInvalidated;

    let crtMethodState: MethodState = 'INACTIVE';
    if (!hasCrtSweep || isCrtPriceInvalidated || crtSetup?.isSweepClosedOutside || !isCrtGeometryValid || !crtOrderCheck.isSemanticConsistent) {
      crtMethodState = 'INVALID';
      if (isCrtPriceInvalidated) crtRejectionReason = crtInvalidationMsg;
      else if (!hasCrtSweep) crtRejectionReason = 'Tidak ada Judas sweep manipulation yang terkonfirmasi';
      else if (!isCrtGeometryValid) crtRejectionReason = 'Geometri SL/TP tidak valid (wajib SL < Entry < TP untuk Buy, TP < Entry < SL untuk Sell)';
      else if (!crtOrderCheck.isSemanticConsistent) crtRejectionReason = crtOrderCheck.semanticNote;
      else crtRejectionReason = 'Candle sweep menutup di luar parent range (CRT INVALID)';
    } else if (!crtSetup) {
      crtMethodState = 'INACTIVE';
    } else if (isCrtTriggerConfirmed && isCrtValid) {
      crtMethodState = (Math.abs(curPrice - crtEntry) <= tickSize * 1.5 || isCrtTriggerConfirmed) ? 'TRIGGERED' : 'ACTIVE';
    } else if (hasCrtSweep && crtIsReclaimed) {
      crtMethodState = 'ACTIVE';
    } else if (crtSetup) {
      crtMethodState = 'WATCH';
    } else {
      crtMethodState = 'INACTIVE';
    }

    const crtObserverStatus: ObserverMethodState =
      crtMethodState === 'TRIGGERED' ? 'PASS' :
      crtMethodState === 'INVALID' ? 'INVALID' :
      (crtMethodState === 'ACTIVE' || crtMethodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE';

    const crtStructureRef: StructureReference = {
      retestZone: crtSetup ? { top: crtSetup.rangeHigh, bottom: crtSetup.rangeLow } : undefined,
      invalidationLevel: crtSl,
      targetReference: { level: crtTp, description: crtDir === 'buy' ? 'Range High & Target Range Expansion Atas' : 'Range Low & Target Range Expansion Bawah' },
      evidence: [
        crtSetup ? `Range High ($${crtSetup.rangeHigh.toFixed(decimals)}) & Range Low ($${crtSetup.rangeLow.toFixed(decimals)})` : 'Range belum terbentuk',
        crtSetup?.judasSweepPrice ? `Judas Sweep wick di $${crtSetup.judasSweepPrice.toFixed(decimals)}` : 'Belum ada sweep manipulation wick',
        `SL ditempatkan di luar ujung wick manipulasi ($${crtSl.toFixed(decimals)})`
      ]
    };

    const crtResult: EngineAnalysisResult = {
      engine: 'CRT',
      name: 'Candle Range Theory (CRT)',
      status: (crtMethodState === 'TRIGGERED' && isCrtValid) ? 'setup' : 'pantau',
      direction: crtDir,
      passedRules: crtPassed,
      totalRules: 6,
      entryPrice: crtEntry,
      slPrice: crtSl,
      tpPrice: crtTp,
      rrRatio: `1 : ${crtCalculatedRR}`,
      caraMasuk: formatOrderInstruction(crtDir, crtEntry, crtSl, crtTp, isCrtTriggerConfirmed ? 'Trigger Judas Sweep Reclaim Selesai' : 'Menunggu Judas Sweep Reclaim'),
      biayaRisikoPercent: 36,
      atrDistanceVal: crtAtrDist,
      rules: crtRules,
      levelDiawasi: ['Range High (RH)', 'Range Low (RL)', '50% Mid-Range Equilibrium', 'Judas Manipulation Wick', 'Range Expansion Target'],
      marketCondition,
      setupType: 'candle_range_theory_judas_sweep',
      setupSource: 'CRT.SessionRange',
      entrySource: 'CRT.judasSweepReclaimTrigger',
      entryRuleUsed: 'CRT Native Parent Range Sweep + Close-Back-Inside Reclaim',
      invalidation: crtDir === 'sell' ? `Penembusan di atas Judas high ($${crtSl})` : `Penembusan di bawah Judas low ($${crtSl})`,
      structureReference: crtStructureRef,
      entryType: crtEntryType,
      entryZone: crtStructureRef.retestZone,
      triggerCondition: 'Judas Sweep manipulation wick menutup kembali di dalam range',
      invalidationLevel: crtSl,
      targetReference: crtStructureRef.targetReference,
      evidence: crtStructureRef.evidence,
      entryDistanceFromStructure: crtSetup ? (crtDir === 'sell' ? Math.abs(curPrice - crtSetup.rangeHigh) : Math.abs(curPrice - crtSetup.rangeLow)) : 0,
      entryDistanceFromCurrentPrice: Math.abs(curPrice - crtEntry),
      rejectionReason: isCrtValid ? undefined : crtRejectionReason,
      executionState: crtExecutionState,
      methodState: crtMethodState,
      methodEvent: 'CRT_EVENT',
      observerStatus: crtObserverStatus,
      crossMethodContamination: false,
      marketZone: globalZone,
      structureTrend: globalTrend,
      setupDetected: crtSetupDetected,
      setupZone: crtStructureRef.retestZone,
      triggerRequired: 'Judas Sweep Wick + Close-Back-Inside Range Reclaim',
      triggerDetected: isCrtTriggerConfirmed,
      triggerPrice: crtEntry,
      runtimeTrace: {
        selectedMethod: 'CRT',
        structure: globalTrend,
        direction: crtDir === 'buy' ? 'BUY' : 'SELL',
        marketZone: globalZone,
        setupDetected: crtSetupDetected,
        setupZone: crtSetup ? `$${crtSetup.rangeLow.toFixed(decimals)} - $${crtSetup.rangeHigh.toFixed(decimals)}` : undefined,
        triggerRequired: 'Judas Sweep + Close-back-inside',
        triggerDetected: isCrtTriggerConfirmed,
        triggerPrice: crtEntry,
        entryType: crtEntryType,
        entryPrice: crtEntry,
        stopLoss: crtSl,
        takeProfit: crtTp,
        status: crtExecutionState,
        rejectionReason: crtRejectionReason
      }
    };

    return {
      SMC: smcResult,
      SNR: snrResult,
      RBS: rbsResult,
      FIBONACCI: fibResult,
      CRT: crtResult
    };
  }

  /**
   * Strictly selects ONE single existing method based on actual market events and internal native validity.
   * HARD ISOLATION RULE (Section A & I):
   * - No cross-method scoring, no weighted averaging, no cross-method voting.
   * - Exactly ONE method is selected as ACTIVE_METHOD and its internal setup/entry/SL/TP is locked.
   * - Deterministic tie-breaker routing order: CRT -> RBS/SBR -> SMC -> FIBONACCI -> SNR.
   * - If no method satisfies all native prerequisites: FINAL = WAIT.
   */
  public static selectSingleMethodForCondition(
    marketCondition: string,
    allEngines: Record<StrategyEngineType, EngineAnalysisResult>,
    requestedEngine?: StrategyEngineType,
    candles?: CandleData[]
  ): MethodSelectionResult {
    // Record candidate validity and detailed audit info for observability (Section C & J)
    const candidates: Record<StrategyEngineType, 'candidate_valid' | 'candidate_invalid'> = {
      SMC: (allEngines.SMC.methodState === 'TRIGGERED' || allEngines.SMC.methodState === 'ACTIVE') && allEngines.SMC.status === 'setup' ? 'candidate_valid' : 'candidate_invalid',
      SNR: (allEngines.SNR.methodState === 'TRIGGERED' || allEngines.SNR.methodState === 'ACTIVE') && allEngines.SNR.status === 'setup' ? 'candidate_valid' : 'candidate_invalid',
      RBS: (allEngines.RBS.methodState === 'TRIGGERED' || allEngines.RBS.methodState === 'ACTIVE') && allEngines.RBS.status === 'setup' ? 'candidate_valid' : 'candidate_invalid',
      FIBONACCI: (allEngines.FIBONACCI.methodState === 'TRIGGERED' || allEngines.FIBONACCI.methodState === 'ACTIVE') && allEngines.FIBONACCI.status === 'setup' ? 'candidate_valid' : 'candidate_invalid',
      CRT: (allEngines.CRT.methodState === 'TRIGGERED' || allEngines.CRT.methodState === 'ACTIVE') && allEngines.CRT.status === 'setup' ? 'candidate_valid' : 'candidate_invalid'
    };

    const candidateDetails: Record<StrategyEngineType, CandidateEvaluationInfo> = {
      SMC: {
        status: candidates.SMC,
        rejectionReason: allEngines.SMC.rejectionReason,
        passedRules: `${allEngines.SMC.passedRules}/${allEngines.SMC.totalRules}`
      },
      SNR: {
        status: candidates.SNR,
        rejectionReason: allEngines.SNR.rejectionReason,
        passedRules: `${allEngines.SNR.passedRules}/${allEngines.SNR.totalRules}`
      },
      RBS: {
        status: candidates.RBS,
        rejectionReason: allEngines.RBS.rejectionReason,
        passedRules: `${allEngines.RBS.passedRules}/${allEngines.RBS.totalRules}`
      },
      FIBONACCI: {
        status: candidates.FIBONACCI,
        rejectionReason: allEngines.FIBONACCI.rejectionReason,
        passedRules: `${allEngines.FIBONACCI.passedRules}/${allEngines.FIBONACCI.totalRules}`
      },
      CRT: {
        status: candidates.CRT,
        rejectionReason: allEngines.CRT.rejectionReason,
        passedRules: `${allEngines.CRT.passedRules}/${allEngines.CRT.totalRules}`
      }
    };

    // Observer status representation for 5 methods (Section J)
    const observerStates: Record<StrategyEngineType, ObserverMethodState> = {
      SMC: allEngines.SMC.observerStatus || (allEngines.SMC.methodState === 'TRIGGERED' ? 'PASS' : allEngines.SMC.methodState === 'INVALID' ? 'INVALID' : (allEngines.SMC.methodState === 'ACTIVE' || allEngines.SMC.methodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE'),
      SNR: allEngines.SNR.observerStatus || (allEngines.SNR.methodState === 'TRIGGERED' ? 'PASS' : allEngines.SNR.methodState === 'INVALID' ? 'INVALID' : (allEngines.SNR.methodState === 'ACTIVE' || allEngines.SNR.methodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE'),
      RBS: allEngines.RBS.observerStatus || (allEngines.RBS.methodState === 'TRIGGERED' ? 'PASS' : allEngines.RBS.methodState === 'INVALID' ? 'INVALID' : (allEngines.RBS.methodState === 'ACTIVE' || allEngines.RBS.methodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE'),
      FIBONACCI: allEngines.FIBONACCI.observerStatus || (allEngines.FIBONACCI.methodState === 'TRIGGERED' ? 'PASS' : allEngines.FIBONACCI.methodState === 'INVALID' ? 'INVALID' : (allEngines.FIBONACCI.methodState === 'ACTIVE' || allEngines.FIBONACCI.methodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE'),
      CRT: allEngines.CRT.observerStatus || (allEngines.CRT.methodState === 'TRIGGERED' ? 'PASS' : allEngines.CRT.methodState === 'INVALID' ? 'INVALID' : (allEngines.CRT.methodState === 'ACTIVE' || allEngines.CRT.methodState === 'WATCH') ? 'WATCH' : 'NOT_ACTIVE')
    };

    // Market Event classification (Section B)
    const marketEvent: MarketEventType = candles 
      ? this.classifyMarketEvent(candles, allEngines)
      : (allEngines.CRT.methodState === 'TRIGGERED' || allEngines.CRT.methodState === 'ACTIVE'
          ? 'CRT_EVENT'
          : allEngines.RBS.methodState === 'TRIGGERED' || allEngines.RBS.methodState === 'ACTIVE'
            ? (allEngines.RBS.direction === 'sell' ? 'SBR_EVENT' : 'RBS_EVENT')
            : allEngines.SMC.methodState === 'TRIGGERED' || allEngines.SMC.methodState === 'ACTIVE'
              ? 'SMC_EVENT'
              : allEngines.FIBONACCI.methodState === 'TRIGGERED' || allEngines.FIBONACCI.methodState === 'ACTIVE'
                ? 'FIB_EVENT'
                : allEngines.SNR.methodState === 'TRIGGERED' || allEngines.SNR.methodState === 'ACTIVE'
                  ? 'SNR_EVENT'
                  : 'NO_EVENT');

    // 1. If caller explicitly requests an engine (e.g. user prompt mentions specific method)
    if (requestedEngine && allEngines[requestedEngine]) {
      const selected = { ...allEngines[requestedEngine] };
      selected.crossMethodContamination = false;
      const executionTrace = {
        activeMethod: requestedEngine,
        methodEvent: selected.methodEvent || marketEvent,
        direction: (selected.direction === 'buy' ? 'BUY' : selected.direction === 'sell' ? 'SELL' : 'NEUTRAL') as 'BUY' | 'SELL' | 'NEUTRAL',
        entry: selected.entryPrice,
        sl: selected.slPrice,
        tp: selected.tpPrice,
        entryRuleUsed: selected.entryRuleUsed || selected.setupType || '',
        entrySource: selected.entrySource || '',
        slSource: selected.invalidation || '',
        tpSource: selected.targetReference?.description || '',
        crossMethodEntryContamination: false,
        reasonCodes: [`Permintaan eksplisit pemanggil untuk metode ${selected.name}`],
        observerBreakdown: observerStates
      };
      return {
        selectedMethod: requestedEngine,
        marketCondition,
        selectionReason: `Permintaan eksplisit pemanggil untuk metode ${selected.name} (Status: ${selected.status.toUpperCase()}, State: ${selected.methodState}).`,
        result: selected,
        candidates,
        candidateDetails,
        marketEvent,
        observerStates,
        executionTrace
      };
    }

    // 2. Deterministic Tie-Breaker Routing Order (Section I):
    // 1. CRT jika complete sweep + close-back-inside event sudah confirmed.
    // 2. RBS/SBR jika complete breakout + retest role-reversal event sudah confirmed.
    // 3. SMC jika structure break/displacement + valid OB/FVG retrace event sudah confirmed.
    // 4. FIB jika valid impulse + retracement ke configured OTE zone sudah confirmed.
    // 5. SNR jika established S/R + rejection + structural confirmation sudah confirmed.
    const deterministicPriority: StrategyEngineType[] = ['CRT', 'RBS', 'SMC', 'FIBONACCI', 'SNR'];

    let selectedMethod: StrategyEngineType | null = null;
    let selectionReason = '';

    // First: Check for TRIGGERED methods in deterministic priority order
    for (const method of deterministicPriority) {
      if (allEngines[method].methodState === 'TRIGGERED' && candidates[method] === 'candidate_valid') {
        selectedMethod = method;
        selectionReason = `Tie-breaker Prioritas #${deterministicPriority.indexOf(method) + 1} (${method}): Event trigger tervalidasi penuh (${allEngines[method].methodEvent || marketEvent}) dengan State TRIGGERED.`;
        break;
      }
    }

    // Second: If none TRIGGERED, check for ACTIVE methods in deterministic priority order
    if (!selectedMethod) {
      for (const method of deterministicPriority) {
        if (allEngines[method].methodState === 'ACTIVE' && candidates[method] === 'candidate_valid') {
          selectedMethod = method;
          selectionReason = `Tie-breaker Prioritas #${deterministicPriority.indexOf(method) + 1} (${method}): Setup aktif pada zona (${allEngines[method].methodEvent || marketEvent}) dengan State ACTIVE (Menunggu konfirmasi trigger).`;
          break;
        }
      }
    }

    // Third: If none is TRIGGERED or ACTIVE, enforce Section I & C:
    // "Jika tidak ada metode yang memenuhi seluruh native prerequisites: FINAL = WAIT."
    // "Hanya ACTIVE/TRIGGERED yang dapat menghasilkan signal."
    let finalResult: EngineAnalysisResult;
    if (!selectedMethod) {
      // Find method aligned with marketCondition or first in WATCH state for monitoring display
      let fallbackMethod: StrategyEngineType = 'SMC';
      if (marketCondition === 'RANGE_BOUND_JUDAS_MANIPULATION') fallbackMethod = 'CRT';
      else if (marketCondition === 'BREAKOUT_FLIP_RETEST') fallbackMethod = 'RBS';
      else if (marketCondition === 'IMPULSIVE_TREND_RETRACEMENT') fallbackMethod = 'FIBONACCI';
      else if (marketCondition === 'HORIZONTAL_KEY_LEVEL_REACTION') fallbackMethod = 'SNR';
      else fallbackMethod = this.findFirstCandidateInState(allEngines, deterministicPriority, ['WATCH']) || 'SMC';

      selectedMethod = fallbackMethod;
      selectionReason = 'Tidak ada metode yang memenuhi seluruh native prerequisites (Status: WAIT / Pantau. Menunggu konfirmasi trigger native).';

      finalResult = { ...allEngines[selectedMethod] };
      finalResult.status = 'pantau';
      finalResult.executionState = 'WAITING_FOR_TRIGGER';
      if (!finalResult.rejectionReason) {
        finalResult.rejectionReason = 'Belum ada metode dengan state ACTIVE atau TRIGGERED (WAIT)';
      }
    } else {
      finalResult = { ...allEngines[selectedMethod] };
    }

    // Strict Single-Method Entry Lineage & Structure Contract (Audit Trail)
    finalResult.marketCondition = marketCondition;
    finalResult.selectionReason = selectionReason;
    finalResult.crossMethodContamination = false;

    const executionTrace = {
      activeMethod: selectedMethod,
      methodEvent: finalResult.methodEvent || marketEvent,
      direction: (finalResult.direction === 'buy' ? 'BUY' : finalResult.direction === 'sell' ? 'SELL' : 'NEUTRAL') as 'BUY' | 'SELL' | 'NEUTRAL',
      entry: finalResult.entryPrice,
      sl: finalResult.slPrice,
      tp: finalResult.tpPrice,
      entryRuleUsed: finalResult.entryRuleUsed || finalResult.setupType || '',
      entrySource: finalResult.entrySource || '',
      slSource: finalResult.invalidation || '',
      tpSource: finalResult.targetReference?.description || '',
      crossMethodEntryContamination: false,
      reasonCodes: [selectionReason],
      observerBreakdown: observerStates
    };

    return {
      selectedMethod,
      activeMethod: selectedMethod,
      marketCondition,
      selectionReason,
      result: finalResult,
      candidates,
      candidateDetails,
      marketEvent,
      observerStates,
      executionTrace
    };
  }

  private static findFirstCandidateInState(
    allEngines: Record<StrategyEngineType, EngineAnalysisResult>,
    priorityList: StrategyEngineType[],
    states: MethodState[]
  ): StrategyEngineType | null {
    for (const method of priorityList) {
      if (allEngines[method] && states.includes(allEngines[method].methodState || 'INACTIVE')) {
        return method;
      }
    }
    return null;
  }

  private static findFirstValidCandidate(
    candidates: Record<StrategyEngineType, 'candidate_valid' | 'candidate_invalid'>,
    priorityList: StrategyEngineType[]
  ): StrategyEngineType | null {
    for (const method of priorityList) {
      if (candidates[method] === 'candidate_valid') {
        return method;
      }
    }
    return null;
  }
}
