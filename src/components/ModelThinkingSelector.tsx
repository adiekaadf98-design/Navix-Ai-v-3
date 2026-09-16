import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, Sparkles, X, Brain, Zap, Cpu, Flame, Layers } from 'lucide-react';
import { EffortLevel } from '../services/ThinkingEngine';

interface ModelThinkingSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  effortLevel: EffortLevel | string;
  setEffortLevel: (effort: EffortLevel | string) => void;
  thinkingMode: boolean;
  setThinkingMode: (enabled: boolean) => void;
}

export function ModelThinkingSelector({
  isOpen,
  onClose,
  selectedModel,
  onModelChange,
  effortLevel,
  setEffortLevel,
  thinkingMode,
  setThinkingMode
}: ModelThinkingSelectorProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  const models = [
    {
      id: 'gemini-3.6-flash',
      name: 'Navix Flash',
      badge: '⚡ TERPOPULER',
      icon: Zap,
      desc: 'Cepat & efisien. Ideal untuk percakapan sehari-hari dan eksekusi cepat.',
      defaultEffort: 'medium'
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Navix Pro',
      badge: '🧠 PENALARAN TINGGI',
      icon: Brain,
      desc: 'Sangat cerdas. Dirancang untuk logika rumit, coding, sains, & analisis bisnis.',
      defaultEffort: 'high'
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Navix Lite',
      badge: '💨 ULTRA FAST',
      icon: Cpu,
      desc: 'Ringan dan hemat kuota. Respons kilat untuk tugas-tugas sederhana.',
      defaultEffort: 'low'
    }
  ];

  const effortLevels: {
    id: EffortLevel;
    name: string;
    isDefault?: boolean;
    info: string;
    pattern: string;
  }[] = [
    {
      id: 'low',
      name: 'Rendah',
      info: 'Kecepatan maksimum dengan sintesis langsung.',
      pattern: 'Pola Berpikir: 2 Langkah (Identifikasi intent -> Sintesis langsung)'
    },
    {
      id: 'medium',
      name: 'Sedang',
      isDefault: true,
      info: 'Keseimbangan ideal antara penalaran kontekstual dan kecepatan.',
      pattern: 'Pola Berpikir: 4 Langkah (Konteks -> Strategi -> Eksekusi -> Finalisasi)'
    },
    {
      id: 'high',
      name: 'Tinggi',
      info: 'Penalaran mendalam dengan analisis multi-sudut pandang & verifikasi kode.',
      pattern: 'Pola Berpikir: 7 Langkah + Audit sintaks & validasi memori'
    },
    {
      id: 'extra',
      name: 'Ekstra',
      info: 'Perencanaan multi-tahap, mitigasi risiko & orkestrasi tool otomatis.',
      pattern: 'Pola Berpikir: 10 Langkah + Self-refine pass 2 & audit kualitas'
    },
    {
      id: 'max',
      name: 'Maks',
      info: 'Full AGI pipeline, verifikasi berlapis, audit edge-case & fallback chain.',
      pattern: 'Pola Berpikir: 15 Langkah AGI (Risk matrix, Verification gate, Output polish)'
    }
  ];

  // Remove duplicate low
  const uniqueEfforts = [
    {
      id: 'low',
      name: 'Rendah',
      info: 'Kecepatan maksimum dengan sintesis langsung.',
      pattern: 'Pola Berpikir: 2 Langkah (Identifikasi intent -> Sintesis langsung)'
    },
    {
      id: 'medium',
      name: 'Sedang',
      isDefault: true,
      info: 'Keseimbangan ideal antara penalaran kontekstual dan kecepatan.',
      pattern: 'Pola Berpikir: 4 Langkah (Konteks -> Strategi -> Eksekusi -> Finalisasi)'
    },
    {
      id: 'high',
      name: 'Tinggi',
      info: 'Penalaran mendalam dengan analisis multi-sudut pandang & verifikasi kode.',
      pattern: 'Pola Berpikir: 7 Langkah + Audit sintaks & validasi memori'
    },
    {
      id: 'extra',
      name: 'Ekstra',
      info: 'Perencanaan multi-tahap, mitigasi risiko & orkestrasi tool otomatis.',
      pattern: 'Pola Berpikir: 10 Langkah + Self-refine pass 2 & audit kualitas'
    },
    {
      id: 'max',
      name: 'Maks',
      info: 'Full AGI pipeline, verifikasi berlapis, audit edge-case & fallback chain.',
      pattern: 'Pola Berpikir: 15 Langkah AGI (Risk matrix, Verification gate, Output polish)'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#18181b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-neutral-200"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-base text-neutral-100">Model AI & Tingkatan Berpikir</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-5 max-h-[75vh] sm:max-h-[80vh] overflow-y-auto space-y-5 sm:space-y-6">
            
            {/* Model Selector Section */}
            <div>
              <label className="text-[11px] sm:text-xs font-semibold text-neutral-400 tracking-wider uppercase block mb-2.5">
                Pilih Model Navix AI
              </label>
              <div className="space-y-2">
                {models.map(m => {
                  const Icon = m.icon;
                  const isSelected = selectedModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => onModelChange(m.id)}
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-neutral-800/90 border-blue-500/60 ring-1 ring-blue-500/30' 
                          : 'bg-neutral-900/50 border-neutral-800/80 hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-blue-500/15 text-blue-400' : 'bg-neutral-800 text-neutral-400'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="font-semibold text-sm text-neutral-100">{m.name}</span>
                          <span className="text-[9px] sm:text-[10px] font-mono font-medium text-neutral-300 bg-neutral-800 border border-neutral-700/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">{m.desc}</p>
                      </div>
                      <div className="pt-0.5 shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-700 bg-neutral-900'}`}>
                          {isSelected && <Check size={12} strokeWidth={2.5} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-neutral-800" />

            {/* Explanation Banner (Claude Style) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-400 leading-relaxed flex items-start gap-2.5">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                Upaya yang lebih tinggi berarti respons yang lebih menyeluruh, tetapi membutuhkan waktu lebih lama dan menggunakan batas Anda lebih cepat.
              </span>
            </div>

            {/* Effort Level Selection List (Claude Style) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
                  Tingkatan Berpikir (Reason Effort)
                </label>
                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Info size={12} />
                  <span>Pola Berpikir</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {uniqueEfforts.map(eff => {
                  const isSelected = effortLevel === eff.id;
                  return (
                    <div
                      key={eff.id}
                      onClick={() => setEffortLevel(eff.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-neutral-800/90 text-neutral-100 border border-neutral-700' 
                          : 'hover:bg-neutral-800/40 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium text-sm">{eff.name}</span>
                        {eff.isDefault && (
                          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                            Bawaan
                          </span>
                        )}
                        {eff.id === 'max' && (
                          <span className="text-[10px] text-amber-400 font-mono">ⓘ</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-neutral-400 hidden sm:inline">
                          {eff.info}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show pattern detail if info clicked */}
              {showInfo && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 text-xs font-mono text-neutral-400"
                >
                  <div className="font-bold text-neutral-200">Pola Berpikir Per Tingkatan:</div>
                  {uniqueEfforts.map(eff => (
                    <div key={eff.id} className="text-[11px]">
                      <span className="text-amber-400">{eff.name}:</span> {eff.pattern}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <hr className="border-neutral-800" />

            {/* Pemikiran Toggle Switch (Claude Style) */}
            <div className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className={thinkingMode ? "text-amber-400" : "text-neutral-500"} />
                  <span className="font-medium text-sm text-neutral-100">Pemikiran</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Berpikir untuk tugas yang lebih kompleks
                </p>
              </div>

              <button 
                onClick={() => setThinkingMode(!thinkingMode)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out p-1 cursor-pointer ${
                  thinkingMode ? 'bg-blue-600' : 'bg-neutral-700'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-md ${
                    thinkingMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-900/60 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md text-center"
            >
              Simpan & Terapkan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
