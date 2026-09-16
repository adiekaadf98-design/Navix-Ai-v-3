import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Brain, Cpu, MessageSquareQuote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeliberationVerdict, DeliberationDialogue } from '../services/council/DeliberationCouncilEngine';

interface DeliberationCardProps {
  verdict: DeliberationVerdict;
}

export const DeliberationCard: React.FC<DeliberationCardProps> = ({ verdict }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ZERO': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'LOW': return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
      case 'MEDIUM': return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      default: return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    }
  };

  return (
    <div className="w-full my-4 rounded-xl border border-neutral-800 bg-gradient-to-b from-[#111317] to-[#0a0c0e] shadow-2xl overflow-hidden">
      {/* Top Header Banner */}
      <div className="px-4 py-3 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 bg-neutral-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-950/60 border border-red-700/50 flex items-center justify-center text-red-400 shadow-sm">
            <Users size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono tracking-wider text-neutral-200 uppercase">
                Dewan Diskusi Di Balik Layar
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-red-900/30 text-red-400 border border-red-800/40">
                Anti-Ngawur & Anti-Malas
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Sidang 4 Agen Otonom Membedah Maksud & Validasi Mesin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 text-[11px] font-mono">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="text-neutral-400">Risiko Halusinasi:</span>
            <span className={`px-1.5 py-0.2 rounded font-bold ${getRiskColor(verdict.factCheckAudit.hallucinationRisk)}`}>
              {verdict.factCheckAudit.hallucinationRisk}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-800 bg-neutral-900 text-[11px] font-mono text-neutral-300">
            <Brain size={13} className="text-cyan-400" />
            <span className="font-bold text-cyan-300">{verdict.executionRigorScore}%</span>
            <span className="text-[10px] text-neutral-500">Rigor</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? "Tutup Dialog Dewan" : "Buka Dialog Dewan"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Consensus Summary Banner */}
      <div className="p-4 bg-neutral-950/40 border-b border-neutral-800/40">
        <div className="flex items-start gap-2.5">
          <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-neutral-200">
              Konsensus Dewan: <span className="text-amber-300/90 font-mono text-[11px]">{verdict.recommendedEngine.primaryEngine}</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              {verdict.consensusSummary}
            </p>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-800/40 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60">
            <span className="text-neutral-500 block text-[10px] uppercase">Fokus Maksud</span>
            <span className="text-neutral-300 line-clamp-1 font-sans">{verdict.deconstructedIntent.primaryGoal}</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60">
            <span className="text-neutral-500 block text-[10px] uppercase">Alur Mesin Pokok</span>
            <span className="text-cyan-400 line-clamp-1">{verdict.recommendedEngine.engineSequence.join(' ➔ ')}</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60">
            <span className="text-neutral-500 block text-[10px] uppercase">Factual Confidence</span>
            <span className="text-emerald-400">{verdict.factCheckAudit.factualConfidence}% Tervalidasi</span>
          </div>
        </div>
      </div>

      {/* Expandable Deliberation Dialogues */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-[#08090a]">
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <MessageSquareQuote size={13} className="text-red-400" />
                Transkrip Perdebatan Sidang Dewan Internal:
              </div>

              {verdict.dialogueLog.map((diag: DeliberationDialogue, idx: number) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg border border-neutral-800/70 bg-neutral-900/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-200">{diag.agentName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {diag.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      +{idx * 30}ms
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    "{diag.thought}"
                  </p>

                  {diag.critique && (
                    <div className="text-[11px] text-rose-300/90 bg-rose-950/20 px-2.5 py-1 rounded border border-rose-900/30">
                      <span className="font-semibold text-rose-400">Peringatan: </span>
                      {diag.critique}
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-300/90 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30">
                    <span className="font-semibold text-emerald-400">Rekomendasi Mutlak: </span>
                    {diag.recommendation}
                  </div>
                </div>
              ))}

              {/* Anti-laziness directives list */}
              {verdict.deconstructedIntent.antiLazinessDirectives.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] font-mono font-bold text-red-400 uppercase block mb-1">
                    Direktif Anti-Malas yang Diberlakukan:
                  </span>
                  <ul className="space-y-1">
                    {verdict.deconstructedIntent.antiLazinessDirectives.map((d, i) => (
                      <li key={i} className="text-xs text-neutral-300 flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-neutral-900/40 hover:bg-neutral-800/50 border-t border-neutral-800/60 text-center text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer"
      >
        <span>{isExpanded ? "Sembunyikan Argumen Dewan" : "Buka Perdebatan Lengkap Dewan (4 Agen)"}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
};
