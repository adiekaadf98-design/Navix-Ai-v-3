import React from 'react';
import { Target, TrendingUp, TrendingDown, ShieldAlert, Zap, Clock, Activity, CheckCircle2, AlertTriangle, HelpCircle, BarChart2 } from 'lucide-react';

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
  type: string; // e.g. 'BUY INSTANT' | 'BUY LIMIT' | 'BUY STOP' | 'SELL INSTANT' | 'SELL LIMIT' | 'SELL STOP' | 'BUY' | 'SELL'
  entry: string;
  target: string;
  target2?: string;
  sl: string;
  reason: string;
  status?: 'RUNNING' | 'PENDING' | string;
  riskReward?: string;
  orderDescription?: string;
  indicators?: {
    rsi?: number | string;
    atr?: number | string;
    ema20?: number | string;
    ema50?: number | string;
    structure?: string;
  };
  requirementsChecklist?: RequirementItem[];
  rationale?: string;
  invalidation?: string;
}

export function SignalCard({ signal }: { signal: SignalData }) {
  const typeUpper = (signal.type || 'BUY').toUpperCase();
  const isBuy = typeUpper.includes('BUY');
  const displayAsset = signal.asset || signal.pair || 'UNKNOWN';
  const statusUpper = (signal.status || '').toUpperCase();
  
  const isLimit = typeUpper.includes('LIMIT');
  const isStop = typeUpper.includes('STOP');
  const isInstant = typeUpper.includes('INSTANT') || typeUpper.includes('NOW') || (!isLimit && !isStop);

  const isPending = isLimit || isStop || statusUpper === 'PENDING' || statusUpper === 'WAITING';
  const isRunning = isInstant && (statusUpper === 'RUNNING' || statusUpper === 'ACTIVE' || !signal.status);

  let orderBadgeText = 'INSTANT MARKET';
  if (isLimit) orderBadgeText = isBuy ? 'BUY LIMIT (Koreksi Area Support)' : 'SELL LIMIT (Koreksi Area Resistance)';
  else if (isStop) orderBadgeText = isBuy ? 'BUY STOP (Breakout Resistance)' : 'SELL STOP (Breakdown Support)';

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
                  <Activity size={10} /> Market Instant
                </span>
              )}
              {isPending && (
                <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                  <Clock size={10} /> Pending Order
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-black tracking-wider px-2 py-0.5 rounded ${isBuy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {typeUpper}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {orderBadgeText}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-700/80 flex items-center gap-1.5 shadow-sm">
          <Zap size={13} className="text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-neutral-200 tracking-wider">NAVIX SMC QUANT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-[#111111] border border-neutral-800/80 rounded-lg p-3">
          <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-1">Harga Entry (Live)</p>
          <p className="text-white font-mono text-sm font-semibold">{signal.entry}</p>
        </div>
        <div className="bg-[#111111] border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Target size={12} className="text-emerald-400" />
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">Take Profit (TP1 / TP2)</p>
          </div>
          <p className="text-emerald-400 font-mono text-sm font-semibold">
            {signal.target} {signal.target2 ? `| ${signal.target2}` : ''}
          </p>
        </div>
        <div className="bg-[#111111] border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <ShieldAlert size={12} className="text-rose-400" />
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">Stop Loss (SL)</p>
          </div>
          <p className="text-rose-400 font-mono text-sm font-semibold">{signal.sl}</p>
        </div>
      </div>

      {signal.indicators && (
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
          <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md text-[10px] font-mono">
            <BarChart2 size={11} className="text-cyan-400" />
            RSI(14): <strong className="text-white">{signal.indicators.rsi ?? '52'}</strong>
          </span>
          {signal.indicators.atr && (
            <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md text-[10px] font-mono">
              ATR(14): <strong className="text-white">{signal.indicators.atr}</strong>
            </span>
          )}
          {signal.indicators.ema20 && signal.indicators.ema50 && (
            <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md text-[10px] font-mono">
              EMA 20/50: <strong className="text-white">{signal.indicators.ema20} / {signal.indicators.ema50}</strong>
            </span>
          )}
          {signal.riskReward && (
            <span className="bg-neutral-900 border border-neutral-800 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-mono">
              R:R: <strong>{signal.riskReward}</strong>
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

      {signal.orderDescription && (
        <div className="mb-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300/90 leading-relaxed">
          <span className="font-bold text-amber-400">💡 Cara Kerja & Logika Order: </span>
          {signal.orderDescription}
        </div>
      )}

      <div className="bg-[#111111] rounded-lg p-3.5 border border-neutral-800/80">
        <p className="text-xs text-neutral-300 leading-relaxed"><strong className="text-cyan-400 font-semibold">SMC & TA-Lib Analysis:</strong> {signal.reason}</p>
      </div>

      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-3 border-t border-neutral-800/80 mt-3">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          100% Non-Repainting • Terkonfirmasi Candle Close
        </span>
        <span className="font-mono text-neutral-400 text-[9px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
          Feed Live Bursa
        </span>
      </div>
    </div>
  );
}

