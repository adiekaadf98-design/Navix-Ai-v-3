import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  CandleData,
  StrategyEngineType,
  EngineAnalysisResult,
  ChartOverlayToggles,
  MarketTickerItem,
  SMCZone,
  MarketStructureMarker,
  CandlePatternMarker
} from '../../types/cloudMarket';
import { CloudMarketEngine, INITIAL_MARKET_TICKERS } from '../../services/trading/cloudMarketEngine';
import { CloudMarketCanvas } from './CloudMarketCanvas';
import { AtrDistanceBar } from './AtrDistanceBar';
import { CaraBacaModal, IstilahModal, KabarModal, SemuaMesinModal } from './MarketModals';
import {
  Activity,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Copy,
  Layers,
  BarChart2,
  BookOpen,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Send,
  Zap,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface CloudMarketStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
  onSwitchToTradingView?: () => void;
}

export const CloudMarketStudio: React.FC<CloudMarketStudioProps> = ({
  onOpenSidebar,
  onSendToChat,
  onSwitchToTradingView
}) => {
  // 1. Markets & Selection State
  const [tickers, setTickers] = useState<MarketTickerItem[]>(INITIAL_MARKET_TICKERS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('m15');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // 2. Active Strategy Engine
  const [activeEngine, setActiveEngine] = useState<StrategyEngineType>('SMC');

  // 3. Overlay Toggles
  const [toggles, setToggles] = useState<ChartOverlayToggles>({
    volume: true,
    zona: true,
    garisMesin: true,
    struktur: true,
    level: true,
    polaLilin: true
  });

  // 4. Modals State
  const [isCaraBacaOpen, setIsCaraBacaOpen] = useState(false);
  const [isIstilahOpen, setIsIstilahOpen] = useState(false);
  const [isKabarOpen, setIsKabarOpen] = useState(false);
  const [isSemuaMesinOpen, setIsSemuaMesinOpen] = useState(false);

  // 5. Chart Data & Engine Calculations State
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [livePrice, setLivePrice] = useState<number>(75690.0);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(true);
  const [copiedSetup, setCopiedSetup] = useState<boolean>(false);

  const selectedTicker = useMemo(() => {
    return tickers.find(t => t.symbol === selectedSymbol) || tickers[0];
  }, [tickers, selectedSymbol]);

  // Derived Indicators & Zones
  const zones: SMCZone[] = useMemo(() => {
    return CloudMarketEngine.detectSMCZones(candles);
  }, [candles]);

  const structures: MarketStructureMarker[] = useMemo(() => {
    return CloudMarketEngine.detectMarketStructure(candles);
  }, [candles]);

  const patterns: CandlePatternMarker[] = useMemo(() => {
    return CloudMarketEngine.detectCandlePatterns(candles);
  }, [candles]);

  const atr = useMemo(() => {
    return CloudMarketEngine.calculateATR(candles);
  }, [candles]);

  // Evaluated 5 Engines
  const engineResults = useMemo(() => {
    return CloudMarketEngine.evaluateAllEngines(candles, selectedSymbol);
  }, [candles, selectedSymbol]);

  const activeResult: EngineAnalysisResult = engineResults[activeEngine];

  // Fetch initial candles on symbol or timeframe change
  const loadCandles = useCallback(async () => {
    setIsLoadingCandles(true);
    try {
      const data = await CloudMarketEngine.fetchCandles(selectedSymbol, selectedTimeframe, 80);
      if (data && data.length > 0) {
        setCandles(data);
        const last = data[data.length - 1];
        setLivePrice(last.close);
      }
    } catch (err) {
      console.error('[CloudMarketStudio] Failed loading candles:', err);
    } finally {
      setIsLoadingCandles(false);
    }
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // Real-Time Moving Candlestick Tick Engine
  useEffect(() => {
    const tickInterval = setInterval(async () => {
      let newPrice = livePrice;

      const price = await CloudMarketEngine.fetchLivePrice(selectedSymbol);
      if (price !== null) {
        newPrice = parseFloat(price.toFixed(selectedTicker.decimals));
      } else {
        // Micro-tick fallback if network fails
        const volatility = selectedSymbol.includes('USDT') ? 0.0003 : 0.00015;
        const delta = (Math.random() - 0.49) * (newPrice * volatility);
        newPrice = parseFloat((newPrice + delta).toFixed(selectedTicker.decimals));
      }

      setLivePrice(newPrice);

      // 2. Animate and stream into current candlestick
      setCandles(prev => {
        if (prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const lastCandle = { ...prev[lastIdx] };

        // Update close, high, low, volume of the current candle
        lastCandle.close = newPrice;
        if (newPrice > lastCandle.high) lastCandle.high = newPrice;
        if (newPrice < lastCandle.low) lastCandle.low = newPrice;
        lastCandle.volume += Math.floor(Math.random() * 5);

        const updated = [...prev];
        updated[lastIdx] = lastCandle;
        return updated;
      });

      // 3. Update ticker price in sidebar
      setTickers(prev => prev.map(t => {
        if (t.symbol === selectedSymbol) {
          return { ...t, price: newPrice };
        }
        return t;
      }));

    }, 2000);

    return () => clearInterval(tickInterval);
  }, [selectedSymbol, livePrice, selectedTicker.decimals]);

  // Periodic multi-asset Tickers sync from native API endpoint
  useEffect(() => {
    const syncTickers = async () => {
      try {
        const liveTickers = await CloudMarketEngine.fetchMarketTickers();
        if (liveTickers && liveTickers.length > 0) {
          setTickers(liveTickers);
          // Also sync live price if current symbol exists in tickers
          const current = liveTickers.find(t => t.symbol === selectedSymbol);
          if (current && current.price) {
            setLivePrice(current.price);
          }
        }
      } catch (e) {
        console.warn('Could not sync tickers via CloudMarketEngine:', e);
      }
    };

    syncTickers();
    const interval = setInterval(syncTickers, 15000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Filtered Watchlist items
  const filteredTickers = useMemo(() => {
    return tickers.filter(t => {
      const matchCat = activeCategory === 'Semua' || t.category === activeCategory;
      const matchSearch = t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tickers, activeCategory, searchQuery]);

  // Handle Ask Navix AI for Signal & Analysis
  const handleAskNavixAI = () => {
    if (!onSendToChat) {
      showToast('Navix AI chat tidak terhubung di sesi ini.', 'info');
      return;
    }

    const checklistText = activeResult.rules.map(r => `${r.passed ? '✓' : '✗'} ${r.label}`).join('\n');
    const prompt = `Analisa Pasar Real-Time Navix Cloud Market:
Asset: ${selectedTicker.displayName} (${selectedSymbol})
Timeframe: ${selectedTimeframe.toUpperCase()}
Harga Berjalan: $${livePrice.toLocaleString()}
ATR Volatilitas: ${atr.toFixed(selectedTicker.decimals)}
Bias Tren H1: ${selectedTicker.change24h >= 0 ? 'BULLISH' : 'BEARISH'}

MESIN ANALISA AKTIF: ${activeResult.name}
Status: ${activeResult.status.toUpperCase()} (${activeResult.direction.toUpperCase()})
Syarat Lolos: ${activeResult.passedRules} dari ${activeResult.totalRules}
Jarak ATR: ${activeResult.atrDistanceVal} ATR dari harga saat ini
Rencana Eksekusi:
- Entry Acuan: $${activeResult.entryPrice}
- Stop Loss (SL): $${activeResult.slPrice}
- Take Profit (TP): $${activeResult.tpPrice}
- Risk-Reward (RR): ${activeResult.rrRatio}
- Alasan & Cara Masuk: "${activeResult.caraMasuk}"

Checklist Verifikasi:
${checklistText}

Instruksi untuk Navix AI:
Buatkan rencana eksekusi trading institusional SMC komprehensif, analisis probabilitas orderflow, konfirmasi liquidity sweep, dan panduan manajemen risiko lot sizing untuk posisi ini.`;

    onSendToChat(prompt);
    showToast('Snapshot Cloud Market telah dikirim ke Navix AI!', 'success');
  };

  // Handle Copy Setup
  const handleCopySetup = () => {
    const text = `[NAVIX CLOUD MARKET SIGNAL]
Market: ${selectedTicker.displayName} (${selectedTimeframe.toUpperCase()})
Engine: ${activeResult.name}
Status: ${activeResult.status.toUpperCase()} ${activeResult.direction.toUpperCase()}
Entry: $${activeResult.entryPrice}
SL: $${activeResult.slPrice}
TP: $${activeResult.tpPrice}
RR: ${activeResult.rrRatio}
Catatan: ${activeResult.caraMasuk}`;

    navigator.clipboard.writeText(text);
    setCopiedSetup(true);
    showToast('Setup sinyal berhasil disalin!', 'success');
    setTimeout(() => setCopiedSetup(false), 2500);
  };

  const timeframes = ['m1', 'm5', 'm15', 'm30', 'h1', 'h4', 'd1'];
  const categories = ['Semua', 'Komoditas', 'Forex', 'Major', 'AI', 'Meme', 'L1/L2'];
  const enginesList: StrategyEngineType[] = ['SMC', 'EMA200', 'SNR', 'ICHIMOKU', 'FIBONACCI'];

  return (
    <div className="flex flex-col min-h-screen bg-[#05070a] text-neutral-200 font-sans">
      {/* 🌟 TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#090d14]/95 backdrop-blur-md border-b border-neutral-800/90 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Brand & Live Indicator & Market Pair */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            >
              <Layers size={16} />
            </button>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ● LIVE
              </span>

              <div className="flex items-baseline gap-2">
                <h1 className="text-sm font-extrabold text-white tracking-wide font-mono">
                  {selectedTicker.displayName}
                </h1>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  ${livePrice.toLocaleString('en-US', { minimumFractionDigits: selectedTicker.decimals < 3 ? 2 : 4 })}
                </span>
                <span className={`text-[11px] font-mono font-semibold ${selectedTicker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedTicker.change24h >= 0 ? '+' : ''}{selectedTicker.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Center: Timeframe Selectors & Overlay Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe Buttons */}
            <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-xs font-mono">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-neutral-800 text-white font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Visual Overlays Toggles */}
            <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setToggles(t => ({ ...t, volume: !t.volume }))}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${toggles.volume ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}
              >
                volume
              </button>
              <span className="text-neutral-700">•</span>
              <button
                onClick={() => setToggles(t => ({ ...t, zona: !t.zona }))}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${toggles.zona ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}
              >
                zona
              </button>
              <span className="text-neutral-700">•</span>
              <button
                onClick={() => setToggles(t => ({ ...t, garisMesin: !t.garisMesin }))}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${toggles.garisMesin ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}
              >
                garis mesin
              </button>
              <span className="text-neutral-700">•</span>
              <button
                onClick={() => setToggles(t => ({ ...t, struktur: !t.struktur }))}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${toggles.struktur ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}
              >
                struktur
              </button>
              <span className="text-neutral-700">•</span>
              <button
                onClick={() => setToggles(t => ({ ...t, level: !t.level }))}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${toggles.level ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}
              >
                level
              </button>
              <span className="text-neutral-700">•</span>
              <button
                onClick={() => setToggles(t => ({ ...t, polaLilin: !t.polaLilin }))}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${toggles.polaLilin ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}
              >
                pola lilin
              </button>
            </div>

            {/* ATR & Bias Badges */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-lg text-neutral-300">
                ATR <strong className="text-cyan-300">{atr.toFixed(2)}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded-lg border font-bold uppercase ${
                selectedTicker.change24h >= 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                Bias H1: {selectedTicker.change24h >= 0 ? 'bull' : 'bear'}
              </span>
            </div>
          </div>

          {/* Right: Modals, AI Analysis & Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSemuaMesinOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition cursor-pointer"
            >
              Semua Mesin
            </button>

            <button
              onClick={() => setIsCaraBacaOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition cursor-pointer hidden sm:block"
            >
              Cara Baca
            </button>

            <button
              onClick={() => setIsIstilahOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition cursor-pointer hidden sm:block"
            >
              Istilah
            </button>

            <button
              onClick={() => setIsKabarOpen(true)}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 text-xs transition cursor-pointer"
              title="Kabar & Notifikasi"
            >
              <Bell size={14} />
            </button>

            {/* Primary Action: Minta Navix AI Analisa */}
            <button
              onClick={handleAskNavixAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-95 text-neutral-950 text-xs font-bold font-mono shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Minta Navix AI</span>
            </button>

            {onSwitchToTradingView && (
              <button
                onClick={onSwitchToTradingView}
                className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-mono transition cursor-pointer"
                title="Beralih ke TradingView & Pine Script"
              >
                TV Studio
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🌟 5 MULTI-ENGINE STRATEGY BAR */}
      <div className="bg-[#080b12] border-b border-neutral-800/90 px-4 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {enginesList.map(engineKey => {
          const res = engineResults[engineKey];
          if (!res) return null;
          const isSelected = activeEngine === engineKey;
          const isSetup = res.status === 'setup';
          const isPantau = res.status === 'pantau';

          return (
            <button
              key={engineKey}
              onClick={() => setActiveEngine(engineKey)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 text-white border-cyan-400 shadow-md ring-1 ring-cyan-400/40 font-bold'
                  : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <span className="text-white uppercase">{engineKey}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isSetup
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : isPantau
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {res.status === 'setup' ? `setup ${res.direction} ${res.passedRules}/${res.totalRules}` : `status: ${res.status.replace('_', ' ')} ${res.passedRules}/${res.totalRules}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* 🌟 MAIN THREE-COLUMN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: 94+ Market Watchlist */}
        <aside className="w-full lg:w-72 bg-[#06080d] border-b lg:border-b-0 lg:border-r border-neutral-800/90 flex flex-col shrink-0">
          {/* Search Box */}
          <div className="p-3 border-b border-neutral-800/80">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Cari dari 94+ pasar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none placeholder:text-neutral-600"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto custom-scrollbar pb-1 text-[10px] font-mono">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Markets List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-neutral-800/50 max-h-[220px] lg:max-h-[calc(100vh-210px)]">
            {filteredTickers.map(ticker => {
              const isSelected = ticker.symbol === selectedSymbol;
              const isPos = ticker.change24h >= 0;

              return (
                <button
                  key={ticker.symbol}
                  onClick={() => setSelectedSymbol(ticker.symbol)}
                  className={`w-full text-left p-2.5 transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-l-2 border-emerald-400'
                      : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white">{ticker.displayName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Vol: ${(ticker.volume24h / 1e6).toFixed(1)}M
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-neutral-200">
                      ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: ticker.decimals < 3 ? 2 : 4 })}
                    </div>
                    <div className={`text-[10px] font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPos ? '+' : ''}{ticker.change24h.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER COLUMN: The Moving Candlestick Chart & ATR Distance Scale */}
        <main className="flex-1 p-3 lg:p-4 flex flex-col gap-3 min-w-0 bg-[#05070a]">
          {/* Main Candlestick Chart Canvas */}
          <div className="flex-1 min-h-[440px] flex flex-col">
            <CloudMarketCanvas
              candles={candles}
              livePrice={livePrice}
              symbol={selectedTicker.displayName}
              decimals={selectedTicker.decimals}
              toggles={toggles}
              activeEngine={activeEngine}
              engineResult={activeResult}
              zones={zones}
              structures={structures}
              patterns={patterns}
            />
          </div>

          {/* Bottom ATR Distance Scale */}
          <AtrDistanceBar
            engines={engineResults}
            activeEngine={activeEngine}
            onSelectEngine={setActiveEngine}
          />
        </main>

        {/* RIGHT COLUMN: Strategy Inspection & Execution Card */}
        <aside className="w-full lg:w-84 bg-[#080c14] border-t lg:border-t-0 lg:border-l border-neutral-800/90 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
          {/* Top Status Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    activeResult.status === 'setup'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                      : activeResult.status === 'pantau'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {activeResult.status === 'setup' ? `SETUP ${activeResult.direction}` : activeResult.status.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {selectedTimeframe.toUpperCase()}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white font-mono mt-1">{activeResult.name}</h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">RR Bersih</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{activeResult.rrRatio}</span>
            </div>
          </div>

          {/* Status Rencana (Entry, SL, TP) */}
          <div className="p-3.5 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-2.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold block">
              STATUS RENCANA EKSEKUSI
            </span>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800/90">
                <span className="text-[10px] text-cyan-400 block font-bold">ENTRY</span>
                <span className="text-white font-bold">${activeResult.entryPrice}</span>
              </div>

              <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800/90">
                <span className="text-[10px] text-red-400 block font-bold">SL (Batal)</span>
                <span className="text-white font-bold">${activeResult.slPrice}</span>
              </div>

              <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800/90">
                <span className="text-[10px] text-emerald-400 block font-bold">TP (Target)</span>
                <span className="text-white font-bold">${activeResult.tpPrice}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/60 text-xs">
              <span className="text-neutral-500 text-[10px] uppercase font-mono block">Cara Masuk:</span>
              <p className="text-neutral-200 mt-0.5 leading-relaxed font-sans text-xs">
                {activeResult.caraMasuk}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-neutral-400">
              <span>Biaya Risiko:</span>
              <span className="text-neutral-200">{activeResult.biayaRisikoPercent}% dari alokasi</span>
            </div>
          </div>

          {/* Syarat Checklist Rules */}
          <div className="p-3.5 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">
                SYARAT {activeEngine}:
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {activeResult.passedRules} dari {activeResult.totalRules} lolos
              </span>
            </div>

            <div className="space-y-1.5">
              {activeResult.rules.map(r => (
                <div
                  key={r.id}
                  className={`flex items-start gap-2 p-1.5 rounded text-xs ${
                    r.passed ? 'bg-emerald-500/[0.05] text-neutral-200' : 'bg-neutral-900/40 text-neutral-500'
                  }`}
                >
                  <CheckCircle2
                    size={14}
                    className={`shrink-0 mt-0.5 ${r.passed ? 'text-emerald-400' : 'text-neutral-600'}`}
                  />
                  <span className="text-[11px] leading-tight">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level yang Diawasi */}
          <div className="p-3 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold block">
              LEVEL YANG DIAWASI:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeResult.levelDiawasi.map((lvl, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-auto pt-2">
            <button
              onClick={handleAskNavixAI}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-98 text-neutral-950 font-bold text-xs font-mono shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Sparkles size={15} />
              <span>Minta Navix AI Analisa Sekarang</span>
            </button>

            <button
              onClick={handleCopySetup}
              className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-neutral-200 text-xs font-mono border border-neutral-800 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {copiedSetup ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSetup ? 'Sinyal Disalin ke Clipboard!' : 'Salin Setup Sinyal'}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <CaraBacaModal isOpen={isCaraBacaOpen} onClose={() => setIsCaraBacaOpen(false)} />
      <IstilahModal isOpen={isIstilahOpen} onClose={() => setIsIstilahOpen(false)} />
      <KabarModal isOpen={isKabarOpen} onClose={() => setIsKabarOpen(false)} />
      <SemuaMesinModal
        isOpen={isSemuaMesinOpen}
        onClose={() => setIsSemuaMesinOpen(false)}
        engines={engineResults}
        pair={selectedTicker.displayName}
      />
    </div>
  );
};
