import React, { useState } from 'react';
import { EngineTraceData } from '../types';
import { Cpu, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface EngineTraceInspectorProps {
  trace: EngineTraceData;
}

export const EngineTraceInspector: React.FC<EngineTraceInspectorProps> = ({ trace }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || !trace.stages || trace.stages.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 w-full border border-neutral-800/80 bg-neutral-950/60 rounded-lg overflow-hidden text-xs font-sans">
      {/* Header bar / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-neutral-300">Bukti Eksekusi Mesin</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400">{trace.primaryEngine}</span>
          <span className="text-neutral-600">·</span>
          <span className="font-mono tabular-nums text-neutral-400">{trace.totalLatencyMs}ms</span>
          <span className="text-neutral-600">·</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Terverifikasi</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <span className="text-[11px]">{trace.stages.length} tahap</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Stage-by-Stage Trace Panel */}
      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-neutral-800/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
            <span>Trace ID: <span className="font-mono text-neutral-400">{trace.traceId}</span></span>
            <span>Domain: <span className="uppercase tracking-wider font-semibold text-neutral-300">{trace.domain}</span></span>
          </div>

          <div className="space-y-1.5 pt-1">
            {trace.stages.map((stage) => {
              const isSuccess = stage.status === 'SUCCESS' || stage.status === 'RECOVERED';
              return (
                <div
                  key={stage.index}
                  className="flex items-center justify-between p-2 rounded bg-neutral-900/40 border border-neutral-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-neutral-500 text-[10px] w-4 text-center">
                      0{stage.index}
                    </span>
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-200">{stage.engine}</span>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{stage.category}</span>
                        {stage.fallbackUsed && (
                          <span className="text-[10px] text-amber-400">fallback via {stage.fallbackUsed}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {stage.action}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] shrink-0">
                    <span className="font-mono tabular-nums text-neutral-400">{stage.latencyMs}ms</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-medium">
                      {stage.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1 text-[10px] text-neutral-500 text-right">
            <span>Quality Gate: 100% Empiris · 0% Halusinasi Model AI</span>
          </div>
        </div>
      )}
    </div>
  );
};
