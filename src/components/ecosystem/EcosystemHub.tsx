import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Database, 
  Cloud, 
  HardDrive, 
  Search, 
  Play, 
  RefreshCw, 
  ExternalLink,
  Zap,
  Lock,
  Sliders,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { globalDeliberationVault, DeliberationAuditRecord } from '../../services/DeliberationVaultService';
import { globalMarketStream, MarketTickerSnapshot, SmcMarketEvent } from '../../services/trading/MarketStreamService';
import { globalBacktestSandbox, BacktestResult, SmcStrategyType } from '../../services/trading/BacktestSandboxEngine';
import { NavixSkillRouter } from '../../services/skills/mcp/McpSkillRouter';

interface EcosystemHubProps {
  onClose?: () => void;
}

export const EcosystemHub: React.FC<EcosystemHubProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'market' | 'sandbox' | 'mcp'>('vault');

  // --- TAB 1: DELIBERATION VAULT STATE ---
  const [audits, setAudits] = useState<DeliberationAuditRecord[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<DeliberationAuditRecord | null>(null);
  const [verifyingHash, setVerifyingHash] = useState<string | null>(null);
  const [hashVerifyResult, setHashVerifyResult] = useState<{ id: string; valid: boolean } | null>(null);

  // --- TAB 2: LIVE MARKET STREAM STATE ---
  const [tickers, setTickers] = useState<MarketTickerSnapshot[]>([]);
  const [smcEvents, setSmcEvents] = useState<SmcMarketEvent[]>([]);

  // --- TAB 3: SMC BACKTEST SANDBOX STATE ---
  const [backtestParams, setBacktestParams] = useState({
    symbol: 'XAUUSD',
    timeframe: '15m' as '1m' | '5m' | '15m' | '1h' | '4h' | '1d',
    strategy: 'SMC_ORDER_BLOCK' as SmcStrategyType,
    riskRewardRatio: 2.5,
    initialBalance: 10000,
    riskPercent: 1.0,
    candleCount: 300
  });
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  // --- TAB 4: MCP SKILLS STATE ---
  const [mcpSkills, setMcpSkills] = useState<any[]>([]);
  const [mcpQuery, setMcpQuery] = useState('');
  const [mcpRunningTool, setMcpRunningTool] = useState<string | null>(null);
  const [mcpExecutionOutput, setMcpExecutionOutput] = useState<any | null>(null);

  // Subscribe to Vault
  useEffect(() => {
    const unsub = globalDeliberationVault.subscribe((records) => {
      setAudits(records);
      if (!selectedAudit && records.length > 0) {
        setSelectedAudit(records[0]);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to Market Stream
  useEffect(() => {
    const unsubTickers = globalMarketStream.subscribeTickers((list) => {
      setTickers(list);
    });
    const unsubEvents = globalMarketStream.subscribeEvents((event) => {
      setSmcEvents((prev) => [event, ...prev.slice(0, 19)]);
    });
    return () => {
      unsubTickers();
      unsubEvents();
    };
  }, []);

  // Load MCP Skills
  useEffect(() => {
    const skills = NavixSkillRouter.getAvailableSkills();
    setMcpSkills(skills);
    NavixSkillRouter.discoverSkills('everything').then(() => {
      setMcpSkills(NavixSkillRouter.getAvailableSkills());
    });
  }, []);

  // Verify Hash Action
  const handleVerifyHash = async (record: DeliberationAuditRecord) => {
    setVerifyingHash(record.auditId);
    try {
      const isValid = await globalDeliberationVault.verifyIntegrity(record);
      setHashVerifyResult({ id: record.auditId, valid: isValid });
    } catch {
      setHashVerifyResult({ id: record.auditId, valid: false });
    } finally {
      setVerifyingHash(null);
    }
  };

  // Run Backtest Action
  const handleRunBacktest = async () => {
    setBacktestRunning(true);
    try {
      const res = await globalBacktestSandbox.runBacktest(backtestParams);
      setBacktestResult(res);
    } catch (err: any) {
      console.error('Backtest run error:', err);
    } finally {
      setBacktestRunning(false);
    }
  };

  // Run MCP Tool Test
  const handleRunMcpTool = async (toolName: string) => {
    setMcpRunningTool(toolName);
    setMcpExecutionOutput(null);
    try {
      const res = await NavixSkillRouter.routeSkill(toolName, { message: 'Navix Studio Health Check Ping' });
      setMcpExecutionOutput(res);
    } catch (err: any) {
      setMcpExecutionOutput({ error: err.message || 'Execution failed' });
    } finally {
      setMcpRunningTool(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 font-sans select-none overflow-hidden">
      {/* Top Console Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-wide text-neutral-100">NAVIX PRO AI</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 rounded">
                ECOSYSTEM HUB
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Tri-Tier Persistence · Real-Time Streaming · SMC Sandbox · MCP Protocol
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-lg space-x-1">
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'vault'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deliberation Vault</span>
            {audits.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-neutral-950 text-neutral-400 rounded-full border border-neutral-800">
                {audits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'market'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Market Stream</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'sandbox'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SMC Quantitative Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'mcp'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>MCP Skills Hub</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded border border-neutral-800 transition"
          >
            Kembali ke Chat
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        {/* ========================================================================= */}
        {/* TAB 1: DELIBERATION VAULT */}
        {/* ========================================================================= */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column: Audit Records List */}
            <div className="col-span-5 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden">
              <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold tracking-wide text-neutral-200">
                    DEWAN DELIBERASI AUDIT TRAIL
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center space-x-1">
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span>IDB</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3 text-emerald-400" />
                    <span>Ledger</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center space-x-1">
                    <Cloud className="w-3 h-3 text-amber-400" />
                    <span>Cloud</span>
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40 p-2 space-y-1.5">
                {audits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-neutral-500">
                    <ShieldCheck className="w-8 h-8 mb-2 stroke-1 text-neutral-600" />
                    <p className="text-xs">Belum ada rekaman deliberasi sesi ini.</p>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Kirim pesan atau analisis pasar di chat untuk memicu sidang dewan dan Quality Gate.
                    </p>
                  </div>
                ) : (
                  audits.map((record) => {
                    const isSelected = selectedAudit?.auditId === record.auditId;
                    const passed = record.verificationStatus.passed;
                    return (
                      <div
                        key={record.auditId}
                        onClick={() => setSelectedAudit(record)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-neutral-800/90 border-indigo-500/50 shadow-sm'
                            : 'bg-neutral-900/30 border-neutral-800/50 hover:bg-neutral-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[11px] text-indigo-400 font-medium">
                            {record.auditId}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 line-clamp-1 mb-2 font-medium">
                          {record.originalPrompt}
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-950 font-mono text-[10px] text-neutral-300 border border-neutral-800">
                              {record.pilgunSelection.selectedEngine}
                            </span>
                            <span className="text-neutral-500 text-[10px] font-mono">
                              CPU {record.telemetrySnapshot.cpuPercent}%
                            </span>
                          </div>
                          <span
                            className={`flex items-center space-x-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              passed
                                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                                : 'bg-red-950/50 text-red-300 border border-red-800/50'
                            }`}
                          >
                            {passed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                            <span>{passed ? 'GATE PASS' : 'GATE REJECT'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Selected Record Forensic Breakdown */}
            <div className="col-span-7 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden">
              {selectedAudit ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* Header & Cryptographic Integrity Card */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono text-neutral-400">AUDIT IDENTIFIER</span>
                        <h4 className="text-sm font-semibold font-mono text-indigo-300">{selectedAudit.auditId}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVerifyHash(selectedAudit)}
                          disabled={verifyingHash === selectedAudit.auditId}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition"
                        >
                          <RefreshCw className={`w-3 h-3 ${verifyingHash === selectedAudit.auditId ? 'animate-spin' : ''}`} />
                          <span>Uji Integritas Hash</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800 font-mono text-xs text-neutral-300 break-all flex items-center justify-between">
                      <span className="truncate pr-2 text-[11px]">
                        SHA-256: <span className="text-emerald-400">{selectedAudit.integrityHash}</span>
                      </span>
                      {hashVerifyResult?.id === selectedAudit.auditId && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          hashVerifyResult.valid 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                            : 'bg-red-950 text-red-300 border border-red-700'
                        }`}>
                          {hashVerifyResult.valid ? 'VALID 100%' : 'ALTERED'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                      <div className="p-2 rounded bg-neutral-900/50 border border-neutral-800/60">
                        <span className="text-neutral-500 block text-[10px]">TIER 1 (INDEXEDDB)</span>
                        <span className="text-emerald-400 font-semibold">Active & Cached</span>
                      </div>
                      <div className="p-2 rounded bg-neutral-900/50 border border-neutral-800/60">
                        <span className="text-neutral-500 block text-[10px]">TIER 2 (SERVER LEDGER)</span>
                        <span className="text-cyan-400 font-semibold">Ring Buffer 500</span>
                      </div>
                      <div className="p-2 rounded bg-neutral-900/50 border border-neutral-800/60">
                        <span className="text-neutral-500 block text-[10px]">TIER 3 (FIRESTORE)</span>
                        <span className="text-amber-400 font-semibold">Synced Cloud</span>
                      </div>
                    </div>
                  </div>

                  {/* Dewan Deliberasi Split (4 Agen) */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-neutral-400 font-mono block">
                      DEWAN DELIBERASI KONSENSUS
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Agent Horizon */}
                      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-200">🎯 Agent Horizon</span>
                          <span className="text-[10px] font-mono text-indigo-400">Intent Auditor</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {selectedAudit.councilVotes.horizon.recommendation}
                        </p>
                      </div>

                      {/* Agent Veritas */}
                      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-200">🛡️ Agent Veritas</span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {selectedAudit.councilVotes.veritas.factualConfidence}% Confidence
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {selectedAudit.councilVotes.veritas.critique}
                        </p>
                      </div>

                      {/* Agent Apex */}
                      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-200">⚡ Agent Apex</span>
                          <span className="text-[10px] font-mono text-cyan-400">Pilgun Arbiter</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Routing ke: <span className="font-mono text-neutral-200">{selectedAudit.councilVotes.apex.primaryEngine}</span> (Sequence: {selectedAudit.councilVotes.apex.sequence.join(' ➔ ')})
                        </p>
                      </div>

                      {/* Agent Sovereign */}
                      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-200">⚖️ Agent Sovereign</span>
                          <span className="text-[10px] font-mono text-amber-400">
                            Rigor {selectedAudit.councilVotes.sovereign.rigorScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {selectedAudit.councilVotes.sovereign.consensusSummary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Quality Gate Details */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-300 font-mono">
                        QUALITY GATE VERIFICATION REPORT
                      </span>
                      <span className={`text-xs font-mono font-semibold ${
                        selectedAudit.verificationStatus.passed ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        Score: {selectedAudit.verificationStatus.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {selectedAudit.verificationStatus.evidence}
                    </p>
                    {selectedAudit.verificationStatus.issues.length > 0 && (
                      <div className="p-2 rounded bg-red-950/30 border border-red-900/40 text-[11px] text-red-300 font-mono space-y-1">
                        {selectedAudit.verificationStatus.issues.map((iss, idx) => (
                          <div key={idx}>• {iss}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
                  Pilih salah satu audit untuk melihat dekonstruksi forensic.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE MARKET STREAM */}
        {/* ========================================================================= */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left: Tickers Board */}
            <div className="col-span-8 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden">
              <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold tracking-wide text-neutral-200">
                    REAL-TIME MARKET TICKERS (SSE STREAM)
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>STREAMING LATENCY &lt; 15MS</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50">
                {tickers.map((t) => {
                  const isUp = t.change24h >= 0;
                  return (
                    <div key={t.symbol} className="p-4 hover:bg-neutral-800/20 transition-all flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-neutral-100">{t.displayName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                            {t.symbol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] font-mono text-neutral-400">
                          <span>24h H: {t.high24h.toFixed(t.decimals)}</span>
                          <span>·</span>
                          <span>24h L: {t.low24h.toFixed(t.decimals)}</span>
                          <span>·</span>
                          <span>Vol: {t.volume24h.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* SMC Status Indicators */}
                      {t.smcStatus && (
                        <div className="flex items-center space-x-2 text-[10px] font-mono">
                          <span className={`px-2 py-0.5 rounded border ${
                            t.smcStatus.trend === 'BULLISH' 
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' 
                              : 'bg-red-950/40 text-red-300 border-red-800/40'
                          }`}>
                            {t.smcStatus.trend}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-neutral-950 text-indigo-300 border border-neutral-800">
                            {t.smcStatus.lastStructure}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-neutral-950 text-amber-300 border border-neutral-800">
                            {t.smcStatus.liquidityZone}
                          </span>
                        </div>
                      )}

                      {/* Live Price & Change */}
                      <div className="text-right space-y-1">
                        <div className="text-base font-semibold font-mono text-neutral-100">
                          ${t.price.toFixed(t.decimals)}
                        </div>
                        <div className={`text-xs font-mono font-medium flex items-center justify-end space-x-1 ${
                          isUp ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isUp ? '+' : ''}{t.change24h}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Real-time SMC Event Feed */}
            <div className="col-span-4 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden">
              <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold tracking-wide text-neutral-200">
                    SMC INSTITUTIONAL EVENT FEED
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {smcEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-neutral-500">
                    <Activity className="w-8 h-8 mb-2 stroke-1 text-neutral-600 animate-pulse" />
                    <p className="text-xs">Menunggu sinyal struktural SMC berikutnya...</p>
                  </div>
                ) : (
                  smcEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-400 font-semibold">{ev.type}</span>
                        <span className="text-neutral-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-neutral-200 leading-relaxed">
                        {ev.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1">
                        <span>Simbol: {ev.symbol}</span>
                        <span>Level: ${ev.price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: QUANTITATIVE SMC SANDBOX */}
        {/* ========================================================================= */}
        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left: Controls */}
            <div className="col-span-4 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-800">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold tracking-wide text-neutral-200">
                  PARAMETER SMC BACKTEST
                </span>
              </div>

              {/* Pair */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium">Instrumen / Pasangan</label>
                <select
                  value={backtestParams.symbol}
                  onChange={(e) => setBacktestParams({ ...backtestParams, symbol: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
                >
                  <option value="XAUUSD">XAUUSD (Gold Spot)</option>
                  <option value="BTCUSDT">BTCUSDT (Bitcoin Perpetual)</option>
                  <option value="ETHUSDT">ETHUSDT (Ethereum Perpetual)</option>
                  <option value="EURUSD">EURUSD (Euro Forex)</option>
                  <option value="SOLUSDT">SOLUSDT (Solana Perpetual)</option>
                </select>
              </div>

              {/* Timeframe */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium">Timeframe</label>
                <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                  {(['1m', '5m', '15m', '1h', '4h'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setBacktestParams({ ...backtestParams, timeframe: tf })}
                      className={`py-1.5 rounded border text-center transition ${
                        backtestParams.timeframe === tf
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium">Model Strategi SMC</label>
                <select
                  value={backtestParams.strategy}
                  onChange={(e) => setBacktestParams({ ...backtestParams, strategy: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
                >
                  <option value="SMC_ORDER_BLOCK">Order Block Mitigation + Displacement</option>
                  <option value="SMC_FVG_REVERSAL">Fair Value Gap (FVG) Imbalance Fill</option>
                  <option value="SMC_LIQUIDITY_SWEEP">Liquidity Sweep (BSL/SSL) + CHoCH</option>
                </select>
              </div>

              {/* Risk:Reward Ratio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Risk : Reward Ratio</span>
                  <span className="font-mono text-emerald-400">1 : {backtestParams.riskRewardRatio.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.5"
                  value={backtestParams.riskRewardRatio}
                  onChange={(e) => setBacktestParams({ ...backtestParams, riskRewardRatio: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Initial Balance */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium">Modal Awal (USD)</label>
                <input
                  type="number"
                  value={backtestParams.initialBalance}
                  onChange={(e) => setBacktestParams({ ...backtestParams, initialBalance: parseFloat(e.target.value) || 10000 })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Run Action */}
              <button
                onClick={handleRunBacktest}
                disabled={backtestRunning}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs transition disabled:opacity-50 mt-4"
              >
                {backtestRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                ) : (
                  <Play className="w-4 h-4 fill-current text-neutral-950" />
                )}
                <span>{backtestRunning ? 'Menjalankan Simulasi...' : 'Jalankan Backtest SMC'}</span>
              </button>
            </div>

            {/* Right: Results Dashboard */}
            <div className="col-span-8 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden p-5">
              {backtestResult ? (
                <div className="flex-1 overflow-y-auto space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] font-mono text-neutral-400 block mb-1">WIN RATE</span>
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        {backtestResult.winRate}%
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {backtestResult.winningTrades}W / {backtestResult.losingTrades}L
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] font-mono text-neutral-400 block mb-1">PROFIT FACTOR</span>
                      <div className="text-xl font-bold font-mono text-indigo-400">
                        {backtestResult.profitFactor.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Sharpe: {backtestResult.sharpeRatio}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] font-mono text-neutral-400 block mb-1">NET PROFIT</span>
                      <div className={`text-xl font-bold font-mono ${
                        backtestResult.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ${backtestResult.netProfit.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        ({backtestResult.netProfitPercent}%)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] font-mono text-neutral-400 block mb-1">MAX DRAWDOWN</span>
                      <div className="text-xl font-bold font-mono text-amber-400">
                        {backtestResult.maxDrawdownPercent}%
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Total {backtestResult.totalTrades} Trades
                      </span>
                    </div>
                  </div>

                  {/* Trades Log Table */}
                  <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                    <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span>JURNAL EKSEKUSI PERDAGANGAN ({backtestResult.trades.length} TRANSAKSI)</span>
                      <span>VALIDATED BY VERIFICATION ENGINE</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-neutral-900/60 text-neutral-400 text-[11px] sticky top-0">
                          <tr>
                            <th className="p-2.5">Waktu</th>
                            <th className="p-2.5">Tipe</th>
                            <th className="p-2.5">Entry</th>
                            <th className="p-2.5">Exit</th>
                            <th className="p-2.5">PnL ($)</th>
                            <th className="p-2.5">Hasil</th>
                            <th className="p-2.5">Alasan SMC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40 text-[11px]">
                          {backtestResult.trades.map((tr) => (
                            <tr key={tr.id} className="hover:bg-neutral-900/40">
                              <td className="p-2.5 text-neutral-400">{tr.dateStr.slice(5, 16)}</td>
                              <td className={`p-2.5 font-semibold ${tr.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tr.type}
                              </td>
                              <td className="p-2.5">${tr.entryPrice}</td>
                              <td className="p-2.5">${tr.exitPrice}</td>
                              <td className={`p-2.5 font-semibold ${tr.pnlDollar >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tr.pnlDollar >= 0 ? '+' : ''}${tr.pnlDollar}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  tr.status === 'WIN' 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                    : 'bg-red-950 text-red-300 border border-red-800'
                                }`}>
                                  {tr.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-neutral-400 truncate max-w-[200px]">{tr.setupReason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-center p-6 space-y-2">
                  <BarChart3 className="w-12 h-12 stroke-1 text-neutral-600 mb-2" />
                  <p className="text-sm text-neutral-300 font-medium">Belum ada simulasi yang dijalankan</p>
                  <p className="text-xs text-neutral-500 max-w-sm">
                    Pilih parameter instrumen dan klik &quot;Jalankan Backtest SMC&quot; untuk menguji keakuratan setup likuiditas secara empiris.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MCP SKILLS HUB */}
        {/* ========================================================================= */}
        {activeTab === 'mcp' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-7 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden">
              <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold tracking-wide text-neutral-200">
                    MODEL CONTEXT PROTOCOL (MCP) TOOL REGISTRY
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
                  <span className="font-mono text-amber-400">{mcpSkills.length}</span>
                  <span>Tools Aktif</span>
                </div>
              </div>

              <div className="p-3 border-b border-neutral-800/60 bg-neutral-950">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Cari alat atau kapabilitas MCP..."
                    value={mcpQuery}
                    onChange={(e) => setMcpQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {mcpSkills
                  .filter((s) => !mcpQuery || s.name.toLowerCase().includes(mcpQuery.toLowerCase()) || (s.description && s.description.toLowerCase().includes(mcpQuery.toLowerCase())))
                  .map((skill) => (
                    <div
                      key={skill.name}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-semibold text-neutral-200">{skill.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-amber-300 border border-neutral-800">
                            {skill.serverName}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 max-w-md line-clamp-1">
                          {skill.description || 'Tools terstandarisasi Model Context Protocol'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRunMcpTool(skill.name)}
                        disabled={mcpRunningTool === skill.name}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-mono bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{mcpRunningTool === skill.name ? 'Running...' : 'Test Run'}</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: MCP Output Console */}
            <div className="col-span-5 flex flex-col h-full bg-neutral-900/40 border border-neutral-800/80 rounded-xl overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-semibold font-mono text-neutral-300">
                  HASIL EKSEKUSI MCP PROTOCOL
                </span>
                <span className="text-[11px] font-mono text-neutral-500">JSON SCHEMA VALIDATED</span>
              </div>

              <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-300 overflow-y-auto">
                {mcpExecutionOutput ? (
                  <pre className="text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(mcpExecutionOutput, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-neutral-600 text-xs">
                    <Terminal className="w-8 h-8 mb-2 stroke-1" />
                    <p>Pilih salah satu alat MCP di sebelah kiri dan klik &quot;Test Run&quot; untuk melihat payload balasan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
