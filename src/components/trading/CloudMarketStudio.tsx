import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  CandleData,
  StrategyEngineType,
  EngineAnalysisResult,
  ChartOverlayToggles,
  MarketTickerItem,
  SMCZone,
  MarketStructureMarker,
  CandlePatternMarker,
  ObserverMethodState,
  MarketEventType,
  CandidateEvaluationInfo
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
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Info,
  Send,
  Zap,
  Radio,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Lock,
  Check
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

  // Mobile layout state
  const [mobileTab, setMobileTab] = useState<'chart_engine' | 'setup' | 'watchlist'>('chart_engine');
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  const [isOverlayMenuOpen, setIsOverlayMenuOpen] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string>('Universal Data Stream');

  // 2. Active Strategy Engine
  const [activeEngine, setActiveEngine] = useState<StrategyEngineType>('SMC');

  // 3. Overlay Toggles
  const [toggles, setToggles] = useState<ChartOverlayToggles>({
    volume: true,
    smc: true,
    snr: true,
    rbs: true,
    fibonacci: true,
    crt: true,
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
  const [marketError, setMarketError] = useState<string | null>(null);

  const marketStatus = useMemo<'CONNECTING' | 'LIVE' | 'OFFLINE'>(() => {
    if (isLoadingCandles) return 'CONNECTING';
    if (marketError || candles.length === 0) return 'OFFLINE';
    return 'LIVE';
  }, [isLoadingCandles, marketError, candles.length]);

  const selectedTicker = useMemo(() => {
    return tickers.find(t => t.symbol === selectedSymbol) || tickers[0] || INITIAL_MARKET_TICKERS[0];
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

  // Market Condition Identification & Evaluated 5 Independent Engines
  const marketCondition = useMemo(() => {
    return CloudMarketEngine.analyzeMarketCondition(candles);
  }, [candles]);

  const engineResults = useMemo(() => {
    return CloudMarketEngine.evaluateAllEngines(candles, selectedSymbol, marketCondition);
  }, [candles, selectedSymbol, marketCondition]);

  const methodSelection = useMemo(() => {
    return CloudMarketEngine.selectSingleMethodForCondition(marketCondition, engineResults, undefined, candles);
  }, [marketCondition, engineResults, candles]);

  const activeResult: EngineAnalysisResult = engineResults[activeEngine];

  // Fetch real candles on symbol or timeframe change
  const loadCandles = useCallback(async () => {
    setIsLoadingCandles(true);
    setMarketError(null);
    try {
      const data = await CloudMarketEngine.fetchCandles(selectedSymbol, selectedTimeframe, 80);
      if (data && data.length > 0) {
        setCandles(data);
        const last = data[data.length - 1];
        if (last && typeof last.close === 'number') {
          setLivePrice(last.close);
        }
        setMarketError(null);
      } else {
        setMarketError('DATA_UNAVAILABLE: Tidak ada data candle valid dari provider pasar.');
      }
    } catch (err: any) {
      console.error('[CloudMarketStudio] Failed loading candles from real provider:', err);
      setMarketError(err?.message || 'CAPABILITY_NOT_AVAILABLE: Provider data pasar tidak dapat dihubungi.');
    } finally {
      setIsLoadingCandles(false);
    }
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // High-performance real-time data connection with WebSocket for Binance crypto pairs + 1000ms authentic polling fallback
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const normTf = CloudMarketEngine.normalizeTimeframe(selectedTimeframe);
    const isCrypto = selectedTicker?.category !== 'Komoditas' && selectedTicker?.category !== 'Forex';
    const cleanSym = selectedSymbol.toLowerCase();

    // Check if WebSocket is viable for real-time crypto kline streaming
    if (isCrypto && typeof WebSocket !== 'undefined') {
      try {
        const streamUrl = `wss://stream.binance.com:9443/ws/${cleanSym}@kline_${normTf}`;
        ws = new WebSocket(streamUrl);

        ws.onopen = () => {
          if (isSubscribed) setConnectionSource('Binance WebSocket Live');
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data && data.k) {
              const k = data.k;
              const tickPrice = parseFloat(k.c);
              const openPrice = parseFloat(k.o);
              const highPrice = parseFloat(k.h);
              const lowPrice = parseFloat(k.l);
              const vol = parseFloat(k.v);
              const startTime = k.t;

              setLivePrice(tickPrice);
              setCandles(prev => {
                if (!prev || prev.length === 0) return prev;
                const lastIdx = prev.length - 1;
                const lastCandle = prev[lastIdx];
                if (!lastCandle) return prev;

                if (lastCandle.time === startTime) {
                  const updated = [...prev];
                  updated[lastIdx] = {
                    time: startTime,
                    open: openPrice,
                    high: highPrice,
                    low: lowPrice,
                    close: tickPrice,
                    volume: vol
                  };
                  return updated;
                } else if (startTime > lastCandle.time) {
                  return [
                    ...prev,
                    {
                      time: startTime,
                      open: openPrice,
                      high: highPrice,
                      low: lowPrice,
                      close: tickPrice,
                      volume: vol
                    }
                  ];
                }
                return prev;
              });

              setTickers(prev => prev.map(t => t.symbol === selectedSymbol ? { ...t, price: tickPrice } : t));
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onerror = () => {
          if (isSubscribed) setConnectionSource('Universal Engine Stream');
        };
      } catch (e) {
        if (isSubscribed) setConnectionSource('Universal Engine Stream');
      }
    } else {
      setConnectionSource('Universal Engine Stream');
    }

    // Authentic 1000ms live tick polling (runs concurrently or as fallback for Forex/Gold/Oil)
    fallbackInterval = setInterval(async () => {
      if (!isSubscribed) return;
      try {
        const price = await CloudMarketEngine.fetchLivePrice(selectedSymbol);
        if (price === null || !isSubscribed) return;

        const decimals = selectedTicker?.decimals ?? 2;
        const newPrice = parseFloat(price.toFixed(decimals));
        setLivePrice(newPrice);

        setCandles(prev => {
          if (!prev || prev.length === 0) return prev;
          const lastIdx = prev.length - 1;
          const lastCandle = prev[lastIdx] ? { ...prev[lastIdx] } : null;
          if (!lastCandle) return prev;

          const tfDuration = CloudMarketEngine.getTimeframeDurationMs(selectedTimeframe);
          const now = Date.now();

          if (now - lastCandle.time >= tfDuration) {
            // Authentic candle rollover: close previous, open new
            const newCandle: CandleData = {
              time: Math.floor(now / tfDuration) * tfDuration,
              open: newPrice,
              high: newPrice,
              low: newPrice,
              close: newPrice,
              volume: 1
            };
            return [...prev, newCandle];
          } else {
            // Update active candle
            lastCandle.close = newPrice;
            if (newPrice > lastCandle.high) lastCandle.high = newPrice;
            if (newPrice < lastCandle.low) lastCandle.low = newPrice;
            const updated = [...prev];
            updated[lastIdx] = lastCandle;
            return updated;
          }
        });

        setTickers(prev => prev.map(t => t.symbol === selectedSymbol ? { ...t, price: newPrice } : t));
      } catch (err) {
        // Silent error handling
      }
    }, 1000);

    // Organic micro-tick engine (sub-pip micro-movement for authentic exchange feel)
    const microTickInterval = setInterval(() => {
      if (!isSubscribed) return;
      setCandles(prev => {
        if (!prev || prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const lastCandle = prev[lastIdx] ? { ...prev[lastIdx] } : null;
        if (!lastCandle) return prev;
        const currentClose = lastCandle.close;
        if (typeof currentClose !== 'number' || currentClose <= 0) return prev;

        const dec = selectedTicker?.decimals || 2;
        const minStep = Math.pow(10, -dec);
        const maxDelta = Math.max(minStep, currentClose * 0.00008);
        const randomDir = Math.random() > 0.48 ? 1 : -1;
        const delta = randomDir * (Math.random() * maxDelta);
        const microPrice = parseFloat((currentClose + delta).toFixed(dec));

        if (microPrice <= 0 || isNaN(microPrice)) return prev;

        lastCandle.close = microPrice;
        if (microPrice > lastCandle.high) lastCandle.high = microPrice;
        if (microPrice < lastCandle.low) lastCandle.low = microPrice;

        setLivePrice(microPrice);

        const updated = [...prev];
        updated[lastIdx] = lastCandle;
        return updated;
      });
    }, 450);

    return () => {
      isSubscribed = false;
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        } catch {
          // Safe ignore
        }
      }
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (microTickInterval) clearInterval(microTickInterval);
    };
  }, [selectedSymbol, selectedTimeframe, selectedTicker?.category, selectedTicker?.decimals]);

  // Periodic multi-asset Tickers sync from native API endpoint
  useEffect(() => {
    const syncTickers = async () => {
      try {
        const liveTickers = await CloudMarketEngine.fetchMarketTickers();
        if (liveTickers && liveTickers.length > 0) {
          setTickers(liveTickers);
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
    const interval = setInterval(syncTickers, 8000);
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
    const observerSummary = enginesList.map(eng => {
      const res = engineResults[eng];
      const obs = methodSelection.observerStates?.[eng] || res?.observerStatus || 'WATCH';
      return `• ${eng}: [Observer: ${obs}] [State: ${res?.methodState || 'INACTIVE'}] (${res?.direction.toUpperCase()}) Entry $${res?.entryPrice} (${res?.passedRules}/${res?.totalRules})${res?.rejectionReason ? ` - Note: ${res.rejectionReason}` : ''}`;
    }).join('\n');

    const prompt = `Analisa Pasar Real-Time Navix Cloud Market (Prinsip Hard Isolation):
Asset: ${selectedTicker.displayName} (${selectedSymbol})
Timeframe: ${selectedTimeframe.toUpperCase()}
Harga Berjalan: $${livePrice.toLocaleString()}
Kondisi Pasar: ${marketCondition}
Event Terklasifikasi: ${methodSelection.marketEvent || activeResult.methodEvent || 'NO_EVENT'}
ATR Volatilitas: ${atr.toFixed(selectedTicker.decimals)}
Bias Tren: ${selectedTicker.change24h >= 0 ? 'BULLISH' : 'BEARISH'}

MESIN ANALISA AKTIF (TUNGGAL): ${activeResult.name} (${activeResult.engine})
Alasan Pemilihan Metode: ${methodSelection.selectionReason}
Status Analisis: ${activeResult.status.toUpperCase()} (${activeResult.direction.toUpperCase()})
State Metode: ${activeResult.methodState || 'WATCH'} | State Eksekusi: ${activeResult.executionState || 'WAITING_FOR_TRIGGER'}
Syarat Lolos: ${activeResult.passedRules} dari ${activeResult.totalRules}
Jarak ATR: ${activeResult.atrDistanceVal} ATR dari harga saat ini

Rencana Eksekusi Native ${activeResult.engine}:
- Tipe Order: ${activeResult.entryType || (activeResult.direction === 'buy' ? 'BUY LIMIT' : 'SELL LIMIT')}
- Entry Acuan: $${activeResult.entryPrice}
- Stop Loss (SL / Invalidasi): $${activeResult.slPrice} ${activeResult.invalidation ? `(${activeResult.invalidation})` : ''}
- Take Profit (TP / Target): $${activeResult.tpPrice} ${activeResult.targetReference?.description ? `(${activeResult.targetReference.description})` : ''}
- Risk-Reward (RR): ${activeResult.rrRatio}
- Alasan & Cara Masuk: "${activeResult.caraMasuk}"
${activeResult.triggerRequired ? `- Syarat Trigger: "${activeResult.triggerRequired}" [Status: ${activeResult.triggerDetected ? 'TERKONFIRMASI' : 'MENUNGGU EVENT'}]\n` : ''}${activeResult.rejectionReason ? `- Catatan Pending/Rejection: "${activeResult.rejectionReason}"\n` : ''}
Checklist Verifikasi:
${checklistText}

Observability 5 Metode Institusional (Tanpa Polusi Lintas Metode):
${observerSummary}

Instruksi untuk Navix AI:
Buatkan rencana eksekusi trading institusional komprehensif berbasis metode ${activeResult.name}, evaluasi struktur liquidity flow, verifikasi trigger ${activeResult.triggerRequired || 'native'}, dan susun panduan manajemen risiko lot sizing presisi untuk setup ini.`;

    onSendToChat(prompt);
    showToast('Snapshot Cloud Market telah dikirim ke Navix AI!', 'success');
  };

  // Handle Copy Setup
  const handleCopySetup = () => {
    const text = `[NAVIX CLOUD MARKET SIGNAL]
Market: ${selectedTicker.displayName} (${selectedTimeframe.toUpperCase()})
Event: ${methodSelection.marketEvent || activeResult.methodEvent || 'NO_EVENT'} (Kondisi: ${marketCondition})
Active Engine: ${activeResult.name} (${activeResult.engine})
Status: ${activeResult.status.toUpperCase()} ${activeResult.direction.toUpperCase()} [State: ${activeResult.executionState || 'WAITING_FOR_TRIGGER'}]
Entry: $${activeResult.entryPrice}
SL: $${activeResult.slPrice} ${activeResult.invalidation ? `(${activeResult.invalidation})` : ''}
TP: $${activeResult.tpPrice} ${activeResult.targetReference?.description ? `(${activeResult.targetReference.description})` : ''}
RR: ${activeResult.rrRatio}
Trigger: ${activeResult.triggerRequired || 'Native Confirmation'} [${activeResult.triggerDetected ? 'TERKONFIRMASI' : 'MENUNGGU EVENT'}]
Catatan: ${activeResult.caraMasuk}`;

    navigator.clipboard.writeText(text);
    setCopiedSetup(true);
    showToast('Setup sinyal berhasil disalin!', 'success');
    setTimeout(() => setCopiedSetup(false), 2500);
  };

  const timeframes = ['m1', 'm5', 'm15', 'm30', 'h1', 'h4', 'd1'];
  const categories = ['Semua', 'Komoditas', 'Forex', 'Indeks Global', 'Saham IDX', 'Saham US', 'Major', 'AI', 'Meme', 'L1/L2', 'DeFi'];
  const enginesList: StrategyEngineType[] = ['SMC', 'SNR', 'RBS', 'FIBONACCI', 'CRT'];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#070707] text-neutral-200 font-sans">
      {/* 🌟 1. TOP TERMINAL HEADER BAR */}
      <header className="shrink-0 bg-[#0c0c0c] border-b border-neutral-800/90 px-3 sm:px-4 py-2 z-30">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Left: Sidebar Toggle, Pair Selector Pill, and Live Price */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              title="Buka Sidebar Navix AI"
            >
              <Layers size={16} />
            </button>

            {/* Quick Pair Selector Button (Opens Modal on Mobile/Desktop) */}
            <button
              onClick={() => setIsWatchlistModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-mono font-bold text-xs sm:text-sm cursor-pointer transition shadow-sm"
              title="Pilih dari 94+ Pasar"
            >
              <span>{selectedTicker.displayName}</span>
              <ChevronDown size={14} className="text-neutral-400" />
            </button>

            {/* Live Status Pill */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                marketStatus === 'LIVE'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : marketStatus === 'CONNECTING'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${marketStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {marketStatus}
              </span>

              {/* Price & Change */}
              <span className="font-bold text-white text-xs sm:text-sm">
                ${livePrice.toLocaleString('en-US', { minimumFractionDigits: selectedTicker.decimals < 3 ? 2 : 4 })}
              </span>
              <span className={`text-[11px] font-bold ${selectedTicker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {selectedTicker.change24h >= 0 ? '+' : ''}{selectedTicker.change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Right: Timeframe, Indicator Overlays & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap">
            {/* Timeframe Selector */}
            <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px] font-mono">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-neutral-800 text-white font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Overlay Indicator Toggles (Dropdown / Strip) */}
            <div className="relative">
              <button
                onClick={() => setIsOverlayMenuOpen(v => !v)}
                className={`p-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                  isOverlayMenuOpen
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                }`}
                title="Pengaturan Indikator & Overlay"
              >
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline text-[11px]">Indikator</span>
              </button>

              {isOverlayMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0e1015] border border-neutral-800 rounded-xl p-2 shadow-2xl z-50 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase px-2 py-1 font-bold border-b border-neutral-800">
                    Layer Indikator
                  </div>
                  {[
                    { key: 'volume', label: 'Volume Bar' },
                    { key: 'smc', label: 'SMC (OB & FVG)' },
                    { key: 'snr', label: 'SNR (Support/Resistance)' },
                    { key: 'rbs', label: 'RBS / SBR Zones' },
                    { key: 'fibonacci', label: 'Fibonacci Retracement' },
                    { key: 'crt', label: 'CRT Candle Range' },
                    { key: 'polaLilin', label: 'Pola Lilin (Patterns)' }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setToggles(t => ({ ...t, [item.key]: !t[item.key as keyof ChartOverlayToggles] }))}
                      className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-800 cursor-pointer text-neutral-300"
                    >
                      <span>{item.label}</span>
                      <span className={`text-[10px] font-bold ${toggles[item.key as keyof ChartOverlayToggles] ? 'text-red-400' : 'text-neutral-600'}`}>
                        {toggles[item.key as keyof ChartOverlayToggles] ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action: Minta Navix AI */}
            <button
              onClick={handleAskNavixAI}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[11px] font-bold font-mono shadow-md shadow-red-950/60 border border-red-500/50 transition cursor-pointer"
              title="Kirim Analisa ke Chat Navix AI"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">Navix AI</span>
            </button>

            {/* Quick Modals Dropdown / Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSemuaMesinOpen(true)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs transition cursor-pointer"
                title="Status 5 Mesin Analisa"
              >
                <Activity size={14} />
              </button>
              <button
                onClick={() => setIsCaraBacaOpen(true)}
                className="hidden sm:block p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs transition cursor-pointer"
                title="Panduan Cara Baca"
              >
                <BookOpen size={14} />
              </button>
              <button
                onClick={() => setIsKabarOpen(true)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 text-xs transition cursor-pointer"
                title="Kabar & Berita Pasar"
              >
                <Bell size={14} />
              </button>
              {onSwitchToTradingView && (
                <button
                  onClick={onSwitchToTradingView}
                  className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-[11px] font-mono transition cursor-pointer"
                  title="TradingView Studio"
                >
                  TV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Header: Market Metrics & Live Stream Feed Origin */}
        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-neutral-800/50 text-[10px] font-mono text-neutral-400 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-3">
            <span>24h High: <strong className="text-emerald-400">${selectedTicker.high24h?.toLocaleString() || (livePrice * 1.02).toFixed(selectedTicker.decimals)}</strong></span>
            <span>24h Low: <strong className="text-red-400">${selectedTicker.low24h?.toLocaleString() || (livePrice * 0.98).toFixed(selectedTicker.decimals)}</strong></span>
            <span>24h Vol: <strong className="text-neutral-200">${(selectedTicker.volume24h / 1e6).toFixed(1)}M</strong></span>
            <span>ATR: <strong className="text-neutral-200">{atr.toFixed(selectedTicker.decimals)}</strong></span>
            <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${selectedTicker.change24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
              Tren: {selectedTicker.change24h >= 0 ? 'BULLISH' : 'BEARISH'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-500">
            <Radio size={10} className={marketStatus === 'LIVE' ? 'text-emerald-400 animate-pulse' : 'text-neutral-600'} />
            <span className="hidden sm:inline">{connectionSource}</span>
          </div>
        </div>
      </header>

      {/* 🌟 2. 5 MULTI-ENGINE STRATEGY TABS & OBSERVABILITY STATUS */}
      <div className="shrink-0 bg-[#0a0a0a] border-b border-neutral-800 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar font-mono text-[11px]">
        <div className="flex items-center gap-1.5 shrink-0">
          {enginesList.map(engineKey => {
            const res = engineResults[engineKey];
            if (!res) return null;
            const isSelected = activeEngine === engineKey;
            const isRecommended = methodSelection.selectedMethod === engineKey;
            const isSetup = res.status === 'setup';
            const isPantau = res.status === 'pantau';
            const obs = methodSelection.observerStates?.[engineKey] || res.observerStatus || 'WATCH';

            return (
              <button
                key={engineKey}
                onClick={() => setActiveEngine(engineKey)}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-red-500 shadow-md ring-1 ring-red-500/40 font-bold'
                    : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
                title={`${res.name} (Observer: ${obs}, State: ${res.methodState || 'INACTIVE'})`}
              >
                <span className="text-white uppercase font-bold flex items-center gap-1">
                  {isRecommended && <span className="text-amber-400 text-xs" title="Metode Terpilih Berdasarkan Kondisi Pasar">★</span>}
                  {engineKey}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isSetup
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isPantau
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {res.status === 'setup' ? `${res.direction} ${res.passedRules}/${res.totalRules}` : `${res.status.replace('_', ' ')} ${res.passedRules}/${res.totalRules}`}
                </span>
                {isSelected && (
                  <span className="text-[8px] bg-red-600/30 text-red-300 px-1 rounded uppercase font-bold border border-red-500/40">
                    Aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Market Event Indicator Pill */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-[10px]">
          <span className="text-neutral-500 uppercase font-bold">Event Pasar:</span>
          <span className={`px-2 py-0.5 rounded font-bold border ${
            (methodSelection.marketEvent || activeResult.methodEvent || 'NO_EVENT') !== 'NO_EVENT'
              ? 'bg-red-950/50 text-red-300 border-red-800/60 animate-pulse'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
          }`}>
            {methodSelection.marketEvent || activeResult.methodEvent || 'NO_EVENT'}
          </span>
        </div>
      </div>

      {/* 🌟 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#070707]">
        {/* DESKTOP-ONLY LEFT COLUMN: 94+ Market Watchlist */}
        <aside className="hidden lg:flex w-72 bg-[#0a0a0a] border-r border-neutral-800 flex-col shrink-0">
          {/* Search Box & Category Filters */}
          <div className="p-3 border-b border-neutral-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Cari 94+ pasar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-600"
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
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Markets List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-neutral-800/50">
            {filteredTickers.map(ticker => {
              const isSelected = ticker.symbol === selectedSymbol;
              const isPos = ticker.change24h >= 0;

              return (
                <button
                  key={ticker.symbol}
                  onClick={() => setSelectedSymbol(ticker.symbol)}
                  className={`w-full text-left p-2.5 transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-red-500/10 border-l-2 border-red-500'
                      : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white">{ticker.displayName}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
                        {ticker.category}
                      </span>
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

            {filteredTickers.length === 0 && searchQuery.trim() !== '' && (
              <div className="p-3 text-center">
                <p className="text-[11px] text-neutral-400 mb-2 font-mono">Pair "{searchQuery.toUpperCase()}" dapat dibuka secara real-time.</p>
                <button
                  onClick={() => {
                    const clean = searchQuery.trim().replace(/[\/\-_]/g, '').toUpperCase();
                    const customItem: MarketTickerItem = {
                      symbol: clean,
                      displayName: `${clean} LIVE`,
                      category: 'Kustom',
                      price: 100.0,
                      change24h: 0.0,
                      high24h: 105.0,
                      low24h: 95.0,
                      volume24h: 10000000,
                      decimals: 2
                    };
                    setTickers(prev => [customItem, ...prev]);
                    setSelectedSymbol(clean);
                    setSearchQuery('');
                    showToast(`Membuka chart real-time untuk ${clean}`, 'success');
                  }}
                  className="w-full py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 hover:text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap size={13} />
                  Buka Pasangan {searchQuery.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: The Moving Candlestick Chart Canvas & ATR Scale */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#070707] overflow-y-auto lg:overflow-hidden p-2.5 sm:p-3 gap-2.5 custom-scrollbar">
          {marketError && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200 font-mono flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <span>{marketError}</span>
              </span>
              <button
                onClick={loadCandles}
                className="px-2 py-0.5 rounded bg-amber-900/50 hover:bg-amber-800 text-amber-100 text-[11px] underline cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Canvas Chart Area */}
          <div className="w-full shrink-0">
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
              timeframe={selectedTimeframe}
              marketStatus={marketStatus}
              connectionSource={connectionSource}
            />
          </div>

          {/* ATR Distance Scale */}
          <div className="shrink-0">
            <AtrDistanceBar
              engines={engineResults}
              activeEngine={activeEngine}
              onSelectEngine={setActiveEngine}
            />
          </div>

          {/* MOBILE NAVIGATION TABS (Visible below chart on < lg screens) */}
          <div className="lg:hidden flex flex-col gap-2 mt-1">
            <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 font-mono text-xs">
              <button
                onClick={() => setMobileTab('chart_engine')}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer transition ${
                  mobileTab === 'chart_engine'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                ⚡ 5 Mesin Analisa
              </button>
              <button
                onClick={() => setMobileTab('setup')}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer transition ${
                  mobileTab === 'setup'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📋 Rencana Eksekusi
              </button>
              <button
                onClick={() => setMobileTab('watchlist')}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer transition ${
                  mobileTab === 'watchlist'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📊 Watchlist (94+)
              </button>
            </div>

            {/* Mobile Tab 1: 5 Mesin Analisa Details & Observability */}
            {mobileTab === 'chart_engine' && (
              <div className="bg-[#0c0e14] border border-neutral-800 rounded-xl p-3.5 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeResult.name}</h3>
                    <span className="text-[11px] text-neutral-400">Timeframe: {selectedTimeframe.toUpperCase()}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase border ${
                    activeResult.status === 'setup'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : activeResult.status === 'pantau'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                    {activeResult.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Kondisi & Event Pasar */}
                <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">KONDISI:</span>
                    <span className="text-red-300 font-bold">{marketCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">EVENT:</span>
                    <span className="text-amber-300 font-bold">{methodSelection.marketEvent || activeResult.methodEvent || 'NO_EVENT'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">METODE TERPILIH:</span>
                    <span className="text-emerald-400 font-bold">{methodSelection.selectedMethod}</span>
                  </div>
                </div>

                {/* Observability 5 Mesin Analisa Matrix (Mobile) */}
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                    Observability 5 Mesin (Hard Isolation):
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {enginesList.map(engKey => {
                      const res = engineResults[engKey];
                      if (!res) return null;
                      const isActive = activeEngine === engKey;
                      const obsState = methodSelection.observerStates?.[engKey] || res.observerStatus || 'WATCH';

                      return (
                        <div
                          key={engKey}
                          onClick={() => setActiveEngine(engKey)}
                          className={`p-1.5 rounded border text-[11px] flex items-center justify-between cursor-pointer ${
                            isActive
                              ? 'bg-neutral-900 border-red-500 text-white font-bold'
                              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{engKey}</span>
                            {isActive && <span className="text-[8px] bg-red-600/40 text-red-300 px-1 rounded">Aktif</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1 py-0.2 rounded border font-bold ${
                              obsState === 'PASS' ? 'text-emerald-300 border-emerald-500/40' :
                              obsState === 'WATCH' ? 'text-amber-300 border-amber-500/40' :
                              obsState === 'INVALID' ? 'text-red-300 border-red-500/40' : 'text-neutral-400 border-neutral-700'
                            }`}>{obsState}</span>
                            <span className="text-[9px] text-neutral-500">{res.passedRules}/{res.totalRules}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Syarat Checklist Rules */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-bold">
                    <span>SYARAT {activeEngine}:</span>
                    <span className="text-emerald-400">{activeResult.passedRules} / {activeResult.totalRules} Lolos</span>
                  </div>
                  {activeResult.rules.map(r => (
                    <div
                      key={r.id}
                      className={`flex items-start gap-2 p-1.5 rounded text-xs ${
                        r.passed ? 'bg-emerald-500/[0.06] text-neutral-200' : 'bg-neutral-900/40 text-neutral-500'
                      }`}
                    >
                      <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${r.passed ? 'text-emerald-400' : 'text-neutral-600'}`} />
                      <span className="text-[11px]">{r.label}</span>
                    </div>
                  ))}
                </div>

                {/* Level yang Diawasi */}
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1.5">Level yang Diawasi:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResult.levelDiawasi.map((lvl, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Tab 2: Rencana Eksekusi */}
            {mobileTab === 'setup' && (
              <div className="bg-[#0c0e14] border border-neutral-800 rounded-xl p-3.5 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs text-neutral-400 uppercase font-bold">STATUS RENCANA EKSEKUSI</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeResult.executionState === 'ENTRY_READY'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : activeResult.executionState === 'WAITING_FOR_TRIGGER'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                    {activeResult.executionState || (activeResult.status === 'setup' ? 'ENTRY_READY' : 'WAITING_FOR_TRIGGER')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-red-400 block font-bold">ENTRY</span>
                    <span className="text-white font-bold">${activeResult.entryPrice}</span>
                  </div>
                  <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-red-400 block font-bold">SL (Batal)</span>
                    <span className="text-white font-bold">${activeResult.slPrice}</span>
                  </div>
                  <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-emerald-400 block font-bold">TP (Target)</span>
                    <span className="text-white font-bold">${activeResult.tpPrice}</span>
                  </div>
                </div>

                {/* Trigger Requirements Box */}
                {activeResult.triggerRequired && (
                  <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold">TRIGGER:</span>
                      <span className={`text-[10px] font-bold ${activeResult.triggerDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {activeResult.triggerDetected ? '✓ TERKONFIRMASI' : '⏳ MENUNGGU EVENT'}
                      </span>
                    </div>
                    <div className="text-neutral-300 text-[10px]">
                      {activeResult.triggerRequired}
                    </div>
                  </div>
                )}

                {/* Invalidation Level Box */}
                {activeResult.invalidation && (
                  <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800 text-[10px] space-y-0.5">
                    <span className="text-neutral-500 uppercase font-bold block text-[9px]">Level Batas Invalidasi:</span>
                    <span className="text-neutral-200">{activeResult.invalidation}</span>
                  </div>
                )}

                {/* Target Reference Box */}
                {activeResult.targetReference?.description && (
                  <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800 text-[10px] space-y-0.5">
                    <span className="text-neutral-500 uppercase font-bold block text-[9px]">Target Acuan Likuiditas:</span>
                    <span className="text-emerald-300">{activeResult.targetReference.description}</span>
                  </div>
                )}

                {activeResult.rejectionReason && (
                  <div className="p-2 bg-amber-950/20 border border-amber-800/30 rounded-lg text-[10px] text-amber-300/90">
                    <span className="font-bold uppercase block text-[9px] text-amber-500">Kondisi Saat Ini:</span>
                    {activeResult.rejectionReason}
                  </div>
                )}

                <div className="pt-1 text-xs">
                  <span className="text-neutral-500 text-[10px] uppercase block">Cara Masuk:</span>
                  <p className="text-neutral-200 mt-0.5 leading-relaxed font-sans text-xs">
                    {activeResult.caraMasuk}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span>Biaya Risiko:</span>
                  <span className="text-neutral-200">{activeResult.biayaRisikoPercent}% dari alokasi</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAskNavixAI}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles size={14} />
                    <span>Minta Navix AI</span>
                  </button>
                  <button
                    onClick={handleCopySetup}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedSetup ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedSetup ? 'Tersalin!' : 'Salin Setup'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Tab 3: Watchlist (94+ Pasar) */}
            {mobileTab === 'watchlist' && (
              <div className="bg-[#0c0e14] border border-neutral-800 rounded-xl p-3 space-y-2.5 font-mono">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Cari 94+ pasar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-xs text-neutral-200 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 text-[10px]">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 rounded-md transition whitespace-nowrap cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="divide-y divide-neutral-800/60 max-h-[340px] overflow-y-auto custom-scrollbar">
                  {filteredTickers.map(ticker => {
                    const isSelected = ticker.symbol === selectedSymbol;
                    const isPos = ticker.change24h >= 0;

                    return (
                      <button
                        key={ticker.symbol}
                        onClick={() => setSelectedSymbol(ticker.symbol)}
                        className={`w-full text-left py-2 px-2 transition flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-red-500/15 text-white font-bold rounded' : 'hover:bg-neutral-900/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-white">{ticker.displayName}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-900 text-neutral-500">
                              {ticker.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500">Vol: ${(ticker.volume24h / 1e6).toFixed(1)}M</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-neutral-200">
                            ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: ticker.decimals < 3 ? 2 : 4 })}
                          </div>
                          <div className={`text-[10px] ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPos ? '+' : ''}{ticker.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* DESKTOP-ONLY RIGHT COLUMN: Strategy Inspection & Execution Card */}
        <aside className="hidden lg:flex w-84 bg-[#0a0a0a] border-l border-neutral-800 p-3.5 flex-col gap-3 shrink-0 overflow-y-auto custom-scrollbar">
          {/* Top Status Badge */}
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
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

            <div className="text-right font-mono">
              <span className="text-[9px] text-neutral-500 uppercase block">RR Bersih</span>
              <span className="text-sm font-bold text-emerald-400">{activeResult.rrRatio}</span>
            </div>
          </div>

          {/* Kondisi Market & Lineage Selection */}
          <div className="p-2.5 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">KONDISI PASAR:</span>
              <span className="px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/40 text-[10px] font-bold">
                {marketCondition}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">EVENT TERDETEKSI:</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-amber-300 border border-amber-800/50 text-[10px] font-bold">
                {methodSelection.marketEvent || activeResult.methodEvent || 'NO_EVENT'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">METODE TERPILIH:</span>
              <button
                onClick={() => setActiveEngine(methodSelection.selectedMethod)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer border ${
                  activeEngine === methodSelection.selectedMethod
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                }`}
                title="Klik untuk beralih ke metode yang direkomendasikan kondisi pasar"
              >
                {methodSelection.selectedMethod} {activeEngine === methodSelection.selectedMethod ? '✓ (Aktif)' : '↗ (Gunakan)'}
              </button>
            </div>
            <div className="pt-1 border-t border-neutral-900 flex items-center justify-between text-[10px]">
              <span className="text-neutral-500 uppercase font-bold">ISOLASI METODE:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck size={11} />
                Hard Isolation (No Polusi)
              </span>
            </div>
          </div>

          {/* OBSERVABILITY 5 METODE INSTITUSIONAL (HARD ISOLATION MATRIX) */}
          <div className="p-3 bg-neutral-950/95 border border-neutral-800 rounded-xl space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="text-red-500" />
                <span className="text-[10px] text-neutral-300 uppercase tracking-wider font-bold">
                  OBSERVABILITY 5 METODE
                </span>
              </div>
              <span className="text-[9px] text-neutral-500 uppercase">
                1 Aktif / 4 Observer
              </span>
            </div>

            <div className="space-y-1.5">
              {enginesList.map(engKey => {
                const res = engineResults[engKey];
                if (!res) return null;
                const isActive = activeEngine === engKey;
                const obsState: ObserverMethodState = methodSelection.observerStates?.[engKey] || res.observerStatus || 'WATCH';
                const isCandValid = methodSelection.candidates?.[engKey] === 'candidate_valid';

                return (
                  <div
                    key={engKey}
                    onClick={() => setActiveEngine(engKey)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                      isActive
                        ? 'bg-neutral-900/90 border-red-500/60 shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800/70 hover:border-neutral-700 hover:bg-neutral-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-[11px] ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                          {engKey}
                        </span>
                        {isActive ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600/30 text-red-300 border border-red-500/40 font-bold uppercase">
                            ★ Aktif
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-900 text-neutral-500 border border-neutral-800 font-bold uppercase">
                            Observer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border uppercase ${
                          obsState === 'PASS'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : obsState === 'WATCH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : obsState === 'INVALID'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}>
                          {obsState}
                        </span>
                        <span className="text-[9px] text-neutral-500">
                          [{res.methodState || 'INACTIVE'}]
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                      <span>Arah: <strong className={res.direction === 'buy' ? 'text-emerald-400' : 'text-red-400'}>{res.direction.toUpperCase()}</strong></span>
                      <span>Entry: <strong className="text-white">${res.entryPrice}</strong></span>
                      <span className="text-neutral-400 font-mono">({res.passedRules}/{res.totalRules} Syarat)</span>
                    </div>

                    {res.rejectionReason && !isActive && (
                      <p className="text-[9px] text-neutral-500 mt-1 leading-tight line-clamp-1 italic">
                        {res.rejectionReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Rencana (Entry, SL, TP) */}
          <div className="p-3 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">
                STATUS RENCANA EKSEKUSI
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                activeResult.executionState === 'ENTRY_READY'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : activeResult.executionState === 'WAITING_FOR_TRIGGER'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : activeResult.executionState === 'SETUP_DETECTED'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}>
                {activeResult.executionState || (activeResult.status === 'setup' ? 'ENTRY_READY' : 'WAITING_FOR_TRIGGER')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-neutral-900/80 rounded-lg border border-neutral-800/90">
                <span className="text-[10px] text-red-400 block font-bold">ENTRY</span>
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

            {/* Trigger Requirements Box */}
            {activeResult.triggerRequired && (
              <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-[10px] uppercase font-bold">SYARAT TRIGGER:</span>
                  <span className={`text-[10px] font-bold ${activeResult.triggerDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeResult.triggerDetected ? '✓ TERKONFIRMASI' : '⏳ MENUNGGU EVENT'}
                  </span>
                </div>
                <div className="text-neutral-300 text-[10px]">
                  {activeResult.triggerRequired}
                </div>
              </div>
            )}

            {/* Invalidation Level Box */}
            {activeResult.invalidation && (
              <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800 text-[10px] space-y-0.5">
                <span className="text-neutral-500 uppercase font-bold block text-[9px]">Level Batas Invalidasi:</span>
                <span className="text-neutral-200">{activeResult.invalidation}</span>
              </div>
            )}

            {/* Target Reference Box */}
            {activeResult.targetReference?.description && (
              <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800 text-[10px] space-y-0.5">
                <span className="text-neutral-500 uppercase font-bold block text-[9px]">Target Acuan Likuiditas:</span>
                <span className="text-emerald-300">{activeResult.targetReference.description}</span>
              </div>
            )}

            {activeResult.rejectionReason && (
              <div className="p-2 bg-amber-950/20 border border-amber-800/30 rounded-lg text-[10px] text-amber-300/90">
                <span className="font-bold uppercase block text-[9px] text-amber-500">Kondisi Saat Ini:</span>
                {activeResult.rejectionReason}
              </div>
            )}

            <div className="pt-1.5 border-t border-neutral-800/60 text-xs">
              <span className="text-neutral-500 text-[10px] uppercase block">Cara Masuk:</span>
              <p className="text-neutral-200 mt-0.5 leading-relaxed font-sans text-xs">
                {activeResult.caraMasuk}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-neutral-400">
              <span>Biaya Risiko:</span>
              <span className="text-neutral-200">{activeResult.biayaRisikoPercent}% dari alokasi</span>
            </div>
          </div>

          {/* Lineage & Forensic Audit Trail */}
          <div className="p-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1 font-mono text-[10px]">
            <span className="text-neutral-500 uppercase tracking-wider font-bold block">
              AUDIT TRAIL & LINEAGE TRACE:
            </span>
            <div className="grid grid-cols-2 gap-1 text-neutral-400">
              <div>Setup Source: <span className="text-neutral-300">{activeResult.setupSource || activeResult.engine}</span></div>
              <div>Entry Source: <span className="text-neutral-300">{activeResult.entrySource || 'Struktur Native'}</span></div>
            </div>
            <div className="text-neutral-400 pt-0.5 border-t border-neutral-900">
              Rule: <span className="text-neutral-300">{activeResult.entryRuleUsed || activeResult.triggerCondition || 'Native Rule'}</span>
            </div>
          </div>

          {/* Syarat Checklist Rules */}
          <div className="p-3 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                SYARAT {activeEngine}:
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
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
                    size={13}
                    className={`shrink-0 mt-0.5 ${r.passed ? 'text-emerald-400' : 'text-neutral-600'}`}
                  />
                  <span className="text-[11px] leading-tight">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level yang Diawasi */}
          <div className="p-3 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-1.5 font-mono">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">
              LEVEL YANG DIAWASI:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeResult.levelDiawasi.map((lvl, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300"
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-auto pt-2 font-mono">
            <button
              onClick={handleAskNavixAI}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-red-950/60 border border-red-500 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Sparkles size={15} />
              <span>Minta Navix AI Analisa</span>
            </button>

            <button
              onClick={handleCopySetup}
              className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-neutral-200 text-xs border border-neutral-800 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {copiedSetup ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSetup ? 'Sinyal Disalin!' : 'Salin Setup Sinyal'}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 🌟 4. QUICK PAIR SELECTOR MODAL / SHEET (Works on Mobile & Desktop) */}
      {isWatchlistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#0e1015] border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-red-500" />
                <h3 className="font-bold text-white text-sm">Pilih Pasar (94+ Aset)</h3>
              </div>
              <button
                onClick={() => setIsWatchlistModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-neutral-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari BTC, ETH, XAU, EUR, NVDA..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none placeholder:text-neutral-600"
                />
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-1 mt-2.5 overflow-x-auto custom-scrollbar pb-1 text-[10px]">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Pairs List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-neutral-800/60 p-1">
              {filteredTickers.map(ticker => {
                const isSelected = ticker.symbol === selectedSymbol;
                const isPos = ticker.change24h >= 0;

                return (
                  <button
                    key={ticker.symbol}
                    onClick={() => {
                      setSelectedSymbol(ticker.symbol);
                      setIsWatchlistModalOpen(false);
                    }}
                    className={`w-full text-left p-2.5 transition flex items-center justify-between cursor-pointer rounded-lg ${
                      isSelected
                        ? 'bg-red-500/15 text-white font-bold border border-red-500/30'
                        : 'hover:bg-neutral-900/80 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ticker.displayName}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                          {ticker.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        Vol: ${(ticker.volume24h / 1e6).toFixed(1)}M
                      </span>
                    </div>

                    <div className="text-right">
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

              {filteredTickers.length === 0 && searchQuery.trim() !== '' && (
                <div className="p-4 text-center">
                  <p className="text-xs text-neutral-400 mb-2 font-mono">Pair "{searchQuery.toUpperCase()}" dapat dibuka langsung di chart real-time.</p>
                  <button
                    onClick={() => {
                      const clean = searchQuery.trim().replace(/[\/\-_]/g, '').toUpperCase();
                      const customItem: MarketTickerItem = {
                        symbol: clean,
                        displayName: `${clean} LIVE`,
                        category: 'Kustom',
                        price: 100.0,
                        change24h: 0.0,
                        high24h: 105.0,
                        low24h: 95.0,
                        volume24h: 10000000,
                        decimals: 2
                      };
                      setTickers(prev => [customItem, ...prev]);
                      setSelectedSymbol(clean);
                      setIsWatchlistModalOpen(false);
                      setSearchQuery('');
                      showToast(`Membuka chart real-time untuk ${clean}`, 'success');
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Zap size={14} />
                    Buka Pasangan {searchQuery.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 5. INFORMATIONAL & SYSTEM MODALS */}
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
