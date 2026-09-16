import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, Bot, Code2, LineChart, Cpu, Copy, Check, Server, Search, Activity, ShieldCheck, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { globalEngineRegistry } from '../services/EngineRegistry';
import { useAuthStore } from '../store/useAuthStore';
import { isDeveloperEmail } from '../services/auth';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExploreModal({ isOpen, onClose }: ExploreModalProps) {
  const { user } = useAuthStore();
  const isDeveloper = user?.role === 'developer' || isDeveloperEmail(user?.email);

  const [activeTab, setActiveTab] = useState<'engines' | 'models' | 'prompt'>('engines');
  const [copied, setCopied] = useState(false);
  const [engineSearch, setEngineSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [testingEngine, setTestingEngine] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: 'success' | 'error'; message: string; latencyMs: number }>>({});

  const allEngines = useMemo(() => {
    try {
      return globalEngineRegistry ? globalEngineRegistry.getAllEngines() : [];
    } catch {
      return [];
    }
  }, [isOpen]);

  const categories = ['ALL', 'Riset & Sains', 'Trading & Finansial', 'APK & Mobile', 'Media & Optik', 'Keamanan & Audit', 'Sistem & MCP'];

  const getEngineCategory = (name: string): string => {
    if (['AutonomousScientificLab', 'KnowledgeIngestionEngine', 'TriangulationEngine', 'AdversarialKnowledgeEngine', 'KnowledgeDistillationEngine', 'RetentionTestEngine', 'UncertaintyEngine'].includes(name)) return 'Riset & Sains';
    if (['TradingEngine', 'VolatilitySentinel', 'RetailTraderGitHubEngine', 'TradingViewService', 'ForexFactoryService', 'CryptoEngine', 'SignalEngine'].includes(name)) return 'Trading & Finansial';
    if (['AIStudioAppBuilderEngine', 'MobileEdgeOptimizer', 'CodingEngine', 'ProjectMapEngine', 'ImpactAnalyzer'].includes(name)) return 'APK & Mobile';
    if (['PhotorealismEngine', 'NmfInferenceEngine', 'ImageEngine', 'LocalDreamImageEngine', 'VideoEngine', 'AudioEngine', 'MusicEngine', 'VisionEngine', 'Shadow Orchestrator', 'shadow-engine'].includes(name)) return 'Media & Optik';
    if (['NavixShield', 'VerificationEngine', 'FailureIntelligenceEngine', 'FileEngine'].includes(name)) return 'Keamanan & Audit';
    return 'Sistem & MCP';
  };

  const filteredEngines = useMemo(() => {
    return allEngines.filter(e => {
      const cat = getEngineCategory(e.name);
      const matchesCat = selectedCategory === 'ALL' || cat === selectedCategory;
      const matchesQuery = e.name.toLowerCase().includes(engineSearch.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(engineSearch.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [allEngines, selectedCategory, engineSearch]);

  const handleTestEngine = async (name: string) => {
    setTestingEngine(name);
    const start = Date.now();
    try {
      const res = await globalEngineRegistry.executeEngine(name, { query: 'Navix AI Connectivity Ping Verification' });
      const latencyMs = Date.now() - start;
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: res.status === 'success' || res.status === 'SUCCESS' ? 'success' : 'error',
          message: res.message || 'Eksekusi selesai dengan normal.',
          latencyMs
        }
      }));
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          message: err?.message || 'Uji konektivitas gagal.',
          latencyMs
        }
      }));
    } finally {
      setTestingEngine(null);
    }
  };

  const models = [
    {
      name: "Navix Omega",
      badge: "Default",
      desc: "Balanced for general tasks, coding, and fast reasoning.",
      icon: <Bot className="text-blue-400" size={24} />,
      color: "border-blue-500/30 bg-blue-500/5",
    },
    {
      name: "Navix Advanced",
      badge: "Pro",
      desc: "Our most capable model for complex analysis and deep problem solving.",
      icon: <Sparkles className="text-red-500" size={24} />,
      color: "border-red-500 bg-red-500/10",
    },
    {
      name: "Navix Code-Spec",
      badge: "Beta",
      desc: "Specialized for advanced software engineering and debugging.",
      icon: <Code2 className="text-emerald-400" size={24} />,
      color: "border-emerald-500/30 bg-emerald-500/5",
    }
  ];

  const features = [
    { name: "Live Market Analysis", icon: <LineChart size={18} className="text-indigo-400" /> },
    { name: "Hyper-Fast Execution", icon: <Zap size={18} className="text-amber-400" /> },
    { name: "Quantum Reasoning", icon: <Cpu size={18} className="text-purple-400" /> }
  ];

  const masterPromptText = `# NAVIX AI SUPER-APP - ARCHITECTURE & BLUEPRINT PROMPT
You are a legendary elite software architect and full-stack developer. Your task is to build NAVIX AI - a highly polished, single-page, multi-engine autonomous super-app using React (Vite), Tailwind CSS, Express, and Google GenAI.

## 1. BRANDING & VISUAL IDENTITY (SWISS-MODERN TWILIGHT)
- **Aesthetic**: Swiss-Modern Minimalist coupled with dark, ambient cosmic slate. Use negative space generously to direct user attention. Avoid generic design fluff.
- **Colors**:
  - Background: Absolute pure black (#000000) for the viewport stage.
  - Active Card Surface: Deep carbon/charcoal (#0c0c0c to #121212) with a crisp, low-contrast 1px border (#1e1e1e) and a subtle 1px border highlights.
  - Primary Accent: Neon Red / Crimson (#ef4444) to signal alerts, actions, and critical data streams.
  - Alternate Accents: Emerald Green (#10b981) for Buy/Bullish signals, Sapphire Blue (#3b82f6) for scientific telemetry, Purple (#8b5cf6) for neural indicators.
- **Typography**:
  - Headings & Interface labels: Use "Space Grotesk" or "Inter" for high structural clarity and professional composure.
  - Numeric metrics, time-stamps, and terminal-logs: Always use "JetBrains Mono" or "Fira Code" to establish mathematical accuracy.

## 2. DYNAMIC WORKSPACE ROUTING (MULTI-ENGINE LAYOUT)
The interface is centered around a persistent, collapsable Sidebar providing real-time workspace views:
1. **Chat AI (Autonomous Orchestrator)**:
   - Dynamic terminal stream rendering beautiful markdown and real-time interactive widgets.
   - Core API routes (/api/chat) communicating with Gemini models using a custom proxy that handles parallel file attachments, image-generation (Navix AI Vision Engine), video animations, music synthesis, and satellite geo-tracking.
2. **Science Lab (Quantum Simulation)**:
   - Immersive scientific simulation workspace offering Interactive Physics particle tracking, DNA Gene sequence splicing, Chemistry reactor pressures, and Forensic toxicology.
3. **Doc Editor (Academic Reports)**:
   - Full-page document editor supporting live markdown edits, styling, and one-click PDF generation and downloads.

## 3. ENGINE ANALISIS TEKNIKAL REAL-TIME (DETERMINISTIC ANALYSIS)
The market analyzer doesn't guess or generate fake prices. It uses real APIs (Binance for Crypto, Yahoo Finance for Forex/Gold) and applies a rigorous multi-timeframe mathematical analysis (1H for structure, 15M for entries):
- **Harga Sekarang (Live Ticker)**: Extracts live prices.
- **Area Kejemput (Unmitigated Retest Zones)**:
  - **SMC Order Blocks**: Scans last 120 candles. Defines unmitigated Bullish OB as the last bearish candle prior to a strong bullish breakout, only considered mitigated if a future candle's low pierces below it.
  - **Fractal SnR**: Implements a 5-candle fractal peak filter and groups levels.
  - **Fibonacci OTE Levels**: Calculates 61.8% Golden Zone, 70.5% Optimal Entry, and 78.6% Deep discount/premium zones based on Major swing high/low coordinates.
  - **Fair Value Gaps (FVG)**: Implements 3-candle imbalance scans (unmitigated if price has not retested it).
- **Setup Recommendations**:
  - **Market Execution**: Active if price is currently touching a valid unmitigated Bullish/Bearish Order Block, recommending entry with tight SL and 1:3 R:R.
  - **Pending Limit Setup**: Recommends placing limit order at the nearest unmitigated OB if the price is currently sitting in mid-structure.
- **Structured Rendering**: Outputs a custom \`\`\`signal JSON block at the bottom of the message. The UI automatically parses this block and renders a glowing, live-trading **SignalCard** with target gauge bars.

## 4. CODEBASE FILE ARCHITECTURE
Provide modular code across these files to prevent generation cutoffs:
- \`server.ts\`: Express server running on port 3000, serving Vite build files in production, handling proxy endpoints, executing server-side Gemini API calls, and hosting the multi-timeframe candle technical engine.
- \`src/App.tsx\`: High-level state manager. Coordinates global sidebars, active view-ports, and user sessions.
- \`src/components/ChatArea.tsx\`: Primary console with support for file attachments, code block renderers, and custom card decoders.
- \`src/components/SignalCard.tsx\`: Glistening, fully interactive asset card displaying buy/sell alerts, entry margins, stop loss alerts, target bars, and SMC rationale.
- \`src/components/Sidebar.tsx\`: Master nav bar with modern buttons, system health status, and quick-action triggers.
- \`src/components/ScienceSandbox.tsx\`: Dynamic chart simulator using custom coordinate plotting for physics/biology tests.
- \`src/components/DocumentEditor.tsx\`: Text-processor interface with auto-save and PDF downloads.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full h-full sm:h-auto sm:max-w-3xl bg-[#0a0c10] sm:border border-neutral-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative p-6 sm:p-8 overflow-hidden shrink-0 border-b border-neutral-800/60 bg-neutral-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
              
              <button 
                onClick={onClose} 
                className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2.5 text-neutral-400 hover:text-white rounded-xl bg-neutral-900/60 sm:bg-transparent hover:bg-neutral-800 active:scale-95 transition-all z-50 cursor-pointer backdrop-blur-sm sm:backdrop-blur-none border border-neutral-800/50 sm:border-transparent"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 pr-8">
                <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-red-500/10 text-red-500 rounded-xl mb-3 sm:mb-4 border border-red-500/20">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight mb-1.5 sm:mb-2">Navix AI Autonomous Multi-Engine Matrix</h2>
                <p className="text-neutral-400 text-[11px] sm:text-sm max-w-xl leading-relaxed">
                  Seluruh mesin kecerdasan khusus, laboratorium riset empiris, pelindung volatilitas finansial, dan MCP runtime terhubung aktif dalam satu ekosistem otonom.
                </p>

                {/* Tab Switcher */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-5 p-1 bg-black/40 backdrop-blur-sm rounded-xl border border-neutral-800/60 w-fit">
                  <button
                    onClick={() => setActiveTab('engines')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'engines' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/20' : 'text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95'
                    }`}
                  >
                    <Server size={14} />
                    <span>Matrix Mesin ({allEngines.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('models')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'models' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/20' : 'text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95'
                    }`}
                  >
                    <Bot size={14} />
                    <span>Model AI & Fitur</span>
                  </button>
                  {isDeveloper && (
                    <button
                      onClick={() => setActiveTab('prompt')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'prompt' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/20' : 'text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95'
                      }`}
                    >
                      <Code2 size={14} />
                      <span>Blueprint Prompt</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 text-neutral-300 bg-transparent sm:bg-[#0a0a0a]/50 custom-scrollbar pb-safe">
              {activeTab === 'engines' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity size={16} className="text-emerald-400" />
                        Status Konektivitas Mesin Navix AI
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Menampilkan {filteredEngines.length} dari {allEngines.length} mesin terdaftar. Seluruh mesin terhubung ke Orchestrator.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        value={engineSearch}
                        onChange={(e) => setEngineSearch(e.target.value)}
                        placeholder="Cari mesin / kapabilitas..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none text-[11px] border-b border-neutral-800/40">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full shrink-0 font-medium transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold shadow-lg shadow-red-900/30 border border-red-500/50'
                            : 'bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800/80 active:scale-95'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Engine Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {filteredEngines.map((engine) => {
                      const test = testResults[engine.name];
                      const isTesting = testingEngine === engine.name;
                      const category = getEngineCategory(engine.name);

                      return (
                        <div
                          key={engine.name}
                          className="group relative p-4 rounded-2xl border border-neutral-800/60 bg-[#101216]/80 hover:bg-[#16191f] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                        >
                          {/* Subtle hover gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-3">
                                {/* Engine icon based on category */}
                                <div className="w-9 h-9 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors shrink-0">
                                  <Cpu size={16} />
                                </div>
                                <div className="flex flex-col">
                                  <h4 className="text-white text-sm font-semibold tracking-tight">{engine.name}</h4>
                                  <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                                    {category.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">OK</span>
                              </div>
                            </div>
                            <p className="text-[12px] text-neutral-400 leading-relaxed mb-4 line-clamp-2 group-hover:text-neutral-300 transition-colors">
                              {engine.description || 'Mesin pemroses khusus otonom Navix AI.'}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between gap-2 relative z-10 mt-auto">
                            <div className="text-[10px] text-neutral-500 font-mono truncate bg-neutral-950/50 px-2 py-1 rounded-md border border-neutral-800/40">
                              {test ? (
                                <span className={test.status === 'success' ? 'text-emerald-400 flex items-center gap-1.5' : 'text-red-400 flex items-center gap-1.5'}>
                                  {test.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                  {test.latencyMs}ms — {test.message.slice(0, 24)}...
                                </span>
                              ) : (
                                <span>Status: Idle</span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestEngine(engine.name);
                              }}
                              disabled={isTesting}
                              className="px-3 py-1.5 bg-neutral-800/80 hover:bg-red-600 hover:text-white text-neutral-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 border border-neutral-700/50 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20 active:scale-95"
                              title="Kirim Ping Verifikasi Eksekusi"
                            >
                              <Play size={11} className={isTesting ? 'animate-spin text-white' : ''} />
                              {isTesting ? 'Ping...' : 'Uji (Ping)'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'models' && (
                <div>
                  <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Model Utama (Core Models)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {models.map((model, idx) => (
                        <div key={idx} className={`group relative p-5 rounded-2xl border ${model.color} bg-[#101216]/80 hover:bg-[#16191f] cursor-pointer transition-all duration-300 overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                          
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-10 h-10 rounded-xl bg-neutral-900/80 border border-neutral-700/50 flex items-center justify-center text-neutral-300 group-hover:scale-110 transition-transform">
                                {model.icon}
                              </div>
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border ${model.badge === 'Pro' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-neutral-800/50 text-neutral-400 border-neutral-700/50'}`}>
                                {model.badge}
                              </span>
                            </div>
                            <h4 className="text-white text-sm font-bold tracking-tight mb-2">{model.name}</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">{model.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Fitur Mendatang (Upcoming Capabilities)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {features.map((feature, idx) => (
                        <div key={idx} className="group flex items-center gap-3 p-4 bg-[#101216]/80 hover:bg-[#16191f] rounded-2xl border border-neutral-800/60 transition-all cursor-pointer">
                          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                            {feature.icon}
                          </div>
                          <span className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prompt' && (
                <div>
                  <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-white font-bold flex items-center gap-2">
                          <Code2 className="text-red-500 animate-pulse" size={18} />
                          Master App Prompt Blueprint (One-Click Clone)
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          Salin seluruh prompt arsitektur ini untuk menduplikasi atau menjalankan seluruh alur kerja Navix AI super-app.
                        </p>
                      </div>
                      <button
                        onClick={handleCopyPrompt}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 self-start sm:self-center shadow-lg shadow-red-600/20 active:scale-95 cursor-pointer"
                      >
                        {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
                        {copied ? "Berhasil Disalin!" : "Salin Master Prompt"}
                      </button>
                    </div>
                    <div className="bg-black/40 border border-neutral-800/80 rounded-xl p-4 max-h-72 overflow-y-auto font-mono text-[11px] text-neutral-400 select-all scrollbar-thin">
                      <pre className="whitespace-pre-wrap break-all">{masterPromptText}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

