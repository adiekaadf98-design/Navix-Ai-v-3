import React from 'react';
import { StrategyEngineType, EngineAnalysisResult } from '../../types/cloudMarket';

interface AtrDistanceBarProps {
  engines: Record<StrategyEngineType, EngineAnalysisResult>;
  activeEngine: StrategyEngineType;
  onSelectEngine: (engine: StrategyEngineType) => void;
}

export const AtrDistanceBar: React.FC<AtrDistanceBarProps> = ({
  engines,
  activeEngine,
  onSelectEngine
}) => {
  // Count stats
  const allResults = Object.values(engines);
  const setupCount = allResults.filter(e => e.status === 'setup').length;
  const pantauCount = allResults.filter(e => e.status === 'pantau').length;

  const engineKeys: StrategyEngineType[] = ['SMC', 'ICHIMOKU', 'EMA200', 'SNR', 'FIBONACCI'];

  // Map ATR distance (0 to 3.5 ATR) to 0% - 100% of the bar
  const getPercentPosition = (atrVal: number) => {
    const clamped = Math.min(3.2, Math.max(0.1, atrVal));
    return (clamped / 3.2) * 100;
  };

  return (
    <div className="w-full bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-2.5">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-200">Jarak ATR</span>
          <span className="text-[11px] text-neutral-400 font-mono">
            Rentang jarak harga ke titik eksekusi acuan
          </span>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono bg-neutral-950 px-2.5 py-1 rounded-full border border-neutral-800">
          <span className="text-emerald-400 font-bold">{setupCount} setup</span>
          <span className="text-neutral-500">•</span>
          <span className="text-amber-400 font-semibold">{pantauCount} pantau</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">status 5 mesin</span>
        </div>
      </div>

      {/* Main ATR Track */}
      <div className="relative w-full h-8 bg-neutral-950 rounded-lg border border-neutral-800/80 px-4 flex items-center overflow-hidden">
        {/* Background Zone Indicators */}
        <div className="absolute inset-0 flex text-[10px] font-mono text-neutral-600 uppercase">
          <div className="w-[35%] h-full border-r border-neutral-800/60 flex items-center justify-start pl-2 bg-emerald-500/[0.03]">
            &lt; 1 ATR (Zona Eksekusi)
          </div>
          <div className="w-[35%] h-full border-r border-neutral-800/60 flex items-center justify-start pl-2 bg-amber-500/[0.03]">
            1 - 2 ATR (Pantau)
          </div>
          <div className="w-[30%] h-full flex items-center justify-start pl-2 bg-neutral-800/[0.05]">
            &gt; 2 ATR (Di luar batas)
          </div>
        </div>

        {/* Current Price Marker */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 animate-pulse" />
          <span className="text-[10px] font-semibold text-cyan-300 font-mono ml-0.5">Harga</span>
        </div>

        {/* Strategy Engine Badges on the Track */}
        <div className="absolute inset-x-12 inset-y-0 relative flex items-center">
          {engineKeys.map(key => {
            const engine = engines[key];
            if (!engine) return null;
            const pos = getPercentPosition(engine.atrDistanceVal);
            const isSelected = activeEngine === key;
            const isSetup = engine.status === 'setup';

            return (
              <button
                key={key}
                onClick={() => onSelectEngine(key)}
                style={{ left: `${pos}%` }}
                className={`absolute -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all cursor-pointer z-20 ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-900 border-white shadow-lg ring-2 ring-emerald-500/50 scale-105 font-bold'
                    : isSetup
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                }`}
                title={`${engine.name}: ${engine.atrDistanceVal} ATR (${engine.status})`}
              >
                <span>{key.toLowerCase()}</span>
                <span className="text-[9px] opacity-75">{engine.atrDistanceVal}x</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
