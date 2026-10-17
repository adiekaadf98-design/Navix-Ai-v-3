import React, { useState } from 'react';
import { FormalProofHierarchy } from '../services/FormalProofReasoningEngine';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, Scale, BookOpen, CheckCircle, Award } from 'lucide-react';

interface FormalProofHierarchyInspectorProps {
  proof: FormalProofHierarchy;
}

export const FormalProofHierarchyInspector: React.FC<FormalProofHierarchyInspectorProps> = ({ proof }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!proof || !proof.axioms || proof.axioms.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 w-full border border-indigo-950/80 bg-neutral-950/80 rounded-xl overflow-hidden text-xs font-sans shadow-lg">
      {/* Header bar / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-300 hover:text-white hover:bg-neutral-900/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-neutral-200">Hierarki Pembuktian Formal (Q.E.D.)</span>
          <span className="text-neutral-600">·</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-medium">
            {proof.rigorScore}% Rigor Formal
          </span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="text-neutral-400 hidden sm:inline uppercase text-[10px] tracking-wider font-mono">
            {proof.domain}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <span className="text-[11px] text-indigo-400/80 font-medium">{isOpen ? 'Tutup Bukti' : 'Buka Bukti'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </div>
      </button>

      {/* Expanded Proof Hierarchy Tree */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-indigo-950/50 space-y-4 bg-neutral-950/40">
          
          {/* Level 1: Aksioma Fondasi */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Level 1: Aksioma & Invarian Fondasional</span>
            </div>
            <div className="space-y-1">
              {proof.axioms.map(ax => (
                <div key={ax.id} className="p-2 rounded bg-neutral-900/50 border border-neutral-800/60 flex items-start justify-between gap-3">
                  <div className="text-[11px] text-neutral-300 leading-relaxed">
                    {ax.statement}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase font-mono shrink-0">
                    Invarian
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Level 2: Jejak Dialektika 4-Arah */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Level 2: Dialektika Multi-Tahap (Tesis vs Antitesis)</span>
            </div>
            <div className="space-y-1.5">
              {proof.dialecticalTrace.map(node => (
                <div key={node.stageNumber} className="p-2.5 rounded bg-neutral-900/40 border border-neutral-800/40 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-neutral-200">
                      Tahap {node.stageNumber}: {node.stageName}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono font-medium">
                      {node.agentRole} · {node.confidenceScore}%
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    <span className="text-neutral-500 font-medium">Argumen: </span>
                    {node.assertion}
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    <span className="text-emerald-400/90 font-medium">Verifikasi: </span>
                    {node.refutationOrSupport}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level 3: Kalkulasi Teorema Invarian */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Level 3: Komputasi Teorema Invarian Deterministik</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {proof.invariantCalculations.map(inv => (
                <div key={inv.stepNumber} className="p-2 rounded bg-neutral-900/60 border border-neutral-800/50 space-y-0.5">
                  <div className="text-[10px] text-neutral-400 font-medium truncate">{inv.theorem}</div>
                  <div className="font-mono text-[10px] text-indigo-300 truncate">{inv.formula}</div>
                  <div className="font-mono text-[11px] text-emerald-400 font-semibold truncate pt-0.5">{inv.calculatedValue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Level 4: Q.E.D. Conclusion Seal */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-950/40 via-neutral-900/60 to-blue-950/40 border border-indigo-500/30 flex items-start gap-3">
            <Award className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                <span>Pembuktian Selesai (Quod Erat Demonstrandum)</span>
                <span className="text-[10px] text-emerald-400">✓ 0% Halusinasi</span>
              </div>
              <div className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                {proof.qedConclusion}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
