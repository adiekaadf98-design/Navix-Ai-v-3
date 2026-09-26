import React from 'react';
import { Target, TrendingUp, TrendingDown, ShieldAlert, Zap, Clock, Activity, CheckCircle2, AlertTriangle, HelpCircle, BarChart2, ShieldCheck, Compass } from 'lucide-react';
import { StructureReference } from '../types/cloudMarket';

export interface RequirementItem {
  id?: string;
  name: string;
  condition?: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | string;
  measuredValue?: string;
  detail?: string;
}

export interface SignalData {
  asset?: string;
  pair?: string;
  symbol?: string;
  displayName?: string;
  type: string; // e.g. 'BUY INSTANT' | 'BUY LIMIT' | 'BUY STOP' | 'SELL INSTANT' | 'SELL LIMIT' | 'SELL STOP' | 'BUY' | 'SELL'
  tipeOrder?: string;
  entry: string | number;
  target?: string | number;
  tp?: string | number;
  target2?: string;
  sl: string | number;
  reason?: string;
  status?: 'RUNNING' | 'PENDING' | 'VALID' | 'WAITING' | string;
  riskReward?: string;
  rrRatio?: string;
  orderDescription?: string;
  caraMasuk?: string;
  indicators?: {
    rsi?: number | string;
    atr?: number | string;
    ema20?: number | string;
    ema50?: number | string;
    structure?: string;
  };
  requirementsChecklist?: RequirementItem[];
  checklist?: Array<{ id: string; label: string; passed: boolean }>;
  passedRules?: string;
  rationale?: string;
  invalidation?: string;
  rejectionReason?: string;
  structureReference?: StructureReference;
  marketCondition?: string;
  selectionReason?: string;
  activeEngine?: string;
  engineKey?: string;
  setupSource?: string;
  entrySource?: string;
}

export function SignalCard({ signal }: { signal: SignalData }) {
  const typeUpper = (signal.tipeOrder || signal.type || 'BUY').toUpperCase();
  const isBuy = typeUpper.includes('BUY');
  const displayAsset = signal.displayName || signal.asset || signal.pair || signal.symbol || 'MARKET ASSET';
  const statusUpper = (signal.status || '').toUpperCase();
  
  const isLimit = typeUpper.includes('LIMIT');
  const isStop = typeUpper.includes('STOP');
  const isInstant = typeUpper.includes('INSTANT') || typeUpper.includes('NOW') || (!isLimit && !isStop);

  const isPending = isLimit || isStop || statusUpper === 'PENDING' || statusUpper === 'WAITING';
  const isRunning = isInstant && (statusUpper === 'RUNNING' || statusUpper === 'ACTIVE' || statusUpper === 'VALID' || !signal.status);

  let orderBadgeText = 'INSTANT MARKET';
  if (isLimit) orderBadgeText = isBuy ? 'BUY LIMIT (Koreksi Area Support)' : 'SELL LIMIT (Koreksi Area Resistance)';
  else if (isStop) orderBadgeText = isBuy ? 'BUY STOP (Breakout Resistance)' : 'SELL STOP (Breakdown Support)';

  const entryDisplay = typeof signal.entry === 'number' ? `$${signal.entry.toLocaleString()}` : signal.entry;
  const targetDisplay = typeof signal.target === 'number' ? `$${signal.target.toLocaleString()}` : (signal.target || (typeof signal.tp === 'number' ? `$${signal.tp.toLocaleString()}` : signal.tp || '-'));
  const slDisplay = typeof signal.sl === 'number' ? `$${signal.sl.toLocaleString()}` : signal.sl;

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 rounded-xl p-5 shadow-xl shadow-black/60 relative overflow-hidden">
      {/* Top Bar Accent Glow */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${isBuy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {isBuy ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white tracking-tight">{displayAsset}</h3>
              {isRunning && (
                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase animate-pulse">
                  <Activity size={10} /> Market Valid
                </span>
              )}
              {isPending && (
                <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                  <Clock size={10} /> Pending Order
                </span>
              )}
              {signal.activeEngine && (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                  {signal.activeEngine}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-xs font-black tracking-wider px-2 py-0.5 rounded ${isBuy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {typeUpper}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {orderBadgeText}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-700/80 flex items-center gap-1.5 shadow-sm shrink-0">
          <Zap size={13} className="text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-neutral-200 tracking-wider">NAVIX INSTITUTIONAL</span>
        </div>
      </div>

      {signal.marketCondition && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 flex items-center justify-between gap-2 flex-wrap font-mono">
          <span className="text-neutral-400">Kondisi Pasar: <strong className="text-white">{signal.marketCondition}</strong></span>
          {signal.passedRules && <span className="text-emerald-400 font-semibold">Rules: {signal.passedRules} Lolos</span>}
        </div>
      )}

      {signal.rejectionReason && (
        <div className="mb-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-400">Catatan Validasi Ketat: </span>
            <span>{signal.rejectionReason}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-[#111111] border border-neutral-800/80 rounded-lg p-3">
          <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-1">Harga Entry</p>
          <p className="text-white font-mono text-sm font-semibold">{entryDisplay}</p>
        </div>
        <div className="bg-[#111111] border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Target size={12} className="text-emerald-400" />
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">Take Profit (TP)</p>
          </div>
          <p className="text-emerald-400 font-mono text-sm font-semibold">
            {targetDisplay} {signal.target2 ? `| ${signal.target2}` : ''}
          </p>
        </div>
        <div className="bg-[#111111] border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <ShieldAlert size={12} className="text-rose-400" />
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">Stop Loss (SL)</p>
          </div>
          <p className="text-rose-400 font-mono text-sm font-semibold">{slDisplay}</p>
        </div>
      </div>

      {/* Structure reference audit trail */}
      {signal.structureReference && (
        <div className="mb-3 bg-neutral-900/70 border border-neutral-800 rounded-lg p-2.5 text-[11px] font-mono text-neutral-300">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
            <Compass size={12} />
            <span>Referensi Struktur Nyata:</span>
          </div>
          <div className="space-y-1 text-neutral-400">
            {signal.structureReference.targetReference && (
              <div>Target Ref: <span className="text-white font-semibold">${signal.structureReference.targetReference.level}</span> ({signal.structureReference.targetReference.description})</div>
            )}
            {signal.structureReference.invalidationLevel !== undefined && (
              <div>Invalidasi Level: <span className="text-white font-semibold">${signal.structureReference.invalidationLevel}</span></div>
            )}
            {signal.structureReference.evidence && signal.structureReference.evidence.length > 0 && (
              <div className="text-[10px] text-neutral-400 italic">
                {signal.structureReference.evidence.slice(0, 2).join(' • ')}
              </div>
            )}
          </div>
        </div>
      )}

      {(signal.indicators || signal.riskReward || signal.rrRatio) && (
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
          {signal.indicators?.rsi !== undefined && (
            <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md text-[10px] font-mono">
              <BarChart2 size={11} className="text-cyan-400" />
              RSI(14): <strong className="text-white">{signal.indicators.rsi}</strong>
            </span>
          )}
          {signal.indicators?.atr && (
            <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md text-[10px] font-mono">
              ATR(14): <strong className="text-white">{signal.indicators.atr}</strong>
            </span>
          )}
          {signal.indicators?.ema20 && signal.indicators?.ema50 && (
            <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md text-[10px] font-mono">
              EMA 20/50: <strong className="text-white">{signal.indicators.ema20} / {signal.indicators.ema50}</strong>
            </span>
          )}
          {(signal.riskReward || signal.rrRatio) && (
            <span className="bg-neutral-900 border border-neutral-800 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-mono">
              R:R: <strong>{signal.riskReward || signal.rrRatio}</strong>
            </span>
          )}
        </div>
      )}

      {signal.requirementsChecklist && signal.requirementsChecklist.length > 0 && (
        <div className="mb-3 bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
          <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Checklist Syarat Eksekusi Sinyal:
          </div>
          <div className="space-y-1.5">
            {signal.requirementsChecklist.map((req, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                {req.status === 'PASSED' ? (
                  <span className="text-emerald-400 shrink-0 mt-0.5">✅</span>
                ) : req.status === 'WARNING' ? (
                  <span className="text-amber-400 shrink-0 mt-0.5">⚠️</span>
                ) : (
                  <span className="text-rose-400 shrink-0 mt-0.5">❌</span>
                )}
                <div>
                  <span className="font-semibold text-neutral-200">{req.name}: </span>
                  <span className="text-neutral-400">{req.measuredValue || req.condition || req.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {signal.checklist && signal.checklist.length > 0 && (
        <div className="mb-3 bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
          <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Checklist Aturan Metode Terpilih:
          </div>
          <div className="space-y-1 text-xs">
            {signal.checklist.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-neutral-300">
                <span>{c.passed ? '✅' : '⏳'}</span>
                <span className={c.passed ? 'text-neutral-200' : 'text-neutral-400'}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(signal.orderDescription || signal.caraMasuk) && (
        <div className="mb-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300/90 leading-relaxed">
          <span className="font-bold text-amber-400">💡 Cara Kerja & Logika Order: </span>
          {signal.orderDescription || signal.caraMasuk}
        </div>
      )}

      {signal.reason && (
        <div className="bg-[#111111] rounded-lg p-3.5 border border-neutral-800/80 mb-3">
          <p className="text-xs text-neutral-300 leading-relaxed"><strong className="text-cyan-400 font-semibold">Institutional TA Analysis:</strong> {signal.reason}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-3 border-t border-neutral-800/80">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          100% Non-Repainting • Real Structure Lock
        </span>
        <span className="font-mono text-neutral-400 text-[9px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
          Feed Live Bursa
        </span>
      </div>
    </div>
  );
}

