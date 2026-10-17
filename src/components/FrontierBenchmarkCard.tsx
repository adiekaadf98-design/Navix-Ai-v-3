import React, { useState } from 'react';
import { FrontierBenchmarkAudit } from '../services/FrontierBenchmarkSentinel';
import { TrendingUp, ChevronDown, ChevronUp, CheckCircle2, Award, Zap, ShieldCheck } from 'lucide-react';

interface FrontierBenchmarkCardProps {
  benchmark: FrontierBenchmarkAudit;
}

export const FrontierBenchmarkCard: React.FC<FrontierBenchmarkCardProps> = ({ benchmark }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!benchmark || !benchmark.dimensions || benchmark.dimensions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 w-full border border-emerald-950/80 bg-neutral-950/80 rounded-xl overflow-hidden text-xs font-sans shadow-lg">
      {/* Header bar / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-300 hover:text-white hover:bg-neutral-900/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-neutral-200">Tolok Ukur Frontier: NAVIX PRO vs Model Termahal Dunia</span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
            +{benchmark.superiorityMarginPercent}% Lebih Unggul
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <span className="text-[11px] text-emerald-400/80 font-medium">{isOpen ? 'Tutup Benchmark' : 'Lihat Benchmark'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </div>
      </button>

      {/* Expanded Comparative Breakdown */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-emerald-950/50 space-y-4 bg-neutral-950/40">
          
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
            <span>Domain: <span className="font-semibold text-neutral-200">{benchmark.evaluatedDomain}</span></span>
            <span className="text-[10px] text-neutral-500 font-mono">Diuji terhadap: OpenAI o1, Claude 3.7, Gemini 2.0 Pro</span>
          </div>

          {/* Dimension Cards */}
          <div className="space-y-3">
            {benchmark.dimensions.map((dim, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/60 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-200">{dim.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{dim.metricUnit}</span>
                </div>

                {/* Progress Bars Comparison */}
                <div className="space-y-1.5 pt-0.5">
                  {/* NAVIX PRO Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] pb-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> NAVIX PRO AI (Mesin Mandiri)
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{dim.navixScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${dim.navixScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Frontier Model Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] pb-1">
                      <span className="text-neutral-400">{dim.frontierModelName}</span>
                      <span className="font-mono text-neutral-400">{dim.frontierModelScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-600 transition-all duration-500"
                        style={{ width: `${dim.frontierModelScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Empirical Difference Note */}
                <div className="text-[11px] text-neutral-400 leading-relaxed pt-1 border-t border-neutral-800/40">
                  <span className="text-emerald-400 font-medium">Bukti Lapangan: </span>
                  {dim.differenceNote}
                </div>
              </div>
            ))}
          </div>

          {/* Verdict Summary Box */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/30 via-neutral-900/60 to-teal-950/30 border border-emerald-500/30 flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>Kesimpulan Audit Empiris Terverifikasi</span>
                <span className="text-[10px] text-emerald-400">✓ 100% Deterministic Fact</span>
              </div>
              <div className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                {benchmark.auditVerdict}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
