import React, { useState, useEffect } from 'react';
import { X, Activity, ShieldCheck, Cpu, RefreshCw, CheckCircle2, AlertTriangle, Sliders, Zap, Check } from 'lucide-react';
import { globalHealthSentinel, FleetHealthSummary, MachineHealthRecord } from '../services/ContinuousHealthSentinel';
import { globalUserMandateRegistry, UserMandateProfile } from '../services/UserMandateRegistry';

interface MachineFleetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MachineFleetStatusModal: React.FC<MachineFleetStatusModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'mandate'>('fleet');
  const [fleetSummary, setFleetSummary] = useState<FleetHealthSummary>(globalHealthSentinel.getFleetSummary());
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'core' | 'opensource' | 'mcp'>('all');
  const [isAuditing, setIsAuditing] = useState(false);
  const [mandateProfile, setMandateProfile] = useState<UserMandateProfile>(globalUserMandateRegistry.getProfile());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFleetSummary(globalHealthSentinel.getFleetSummary());
      setMandateProfile(globalUserMandateRegistry.getProfile());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const updated = await globalHealthSentinel.auditFleet();
      setFleetSummary(updated);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveMandate = () => {
    globalUserMandateRegistry.updateProfile(mandateProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const filteredMachines = fleetSummary.machines.filter(m => {
    if (categoryFilter === 'all') return true;
    return m.category === categoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-neutral-200 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <span>Pusat Armada & Penegakan Mandat NAVIX PRO</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                  {fleetSummary.overallFleetHealth}% Prima
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Audit detak jantung mesin kontinu, kepatuhan instruksi mutlak, dan otomasi target proaktif.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900/30 text-xs">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'fleet'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Audit Armada Mesin ({fleetSummary.totalMachines})</span>
          </button>
          <button
            onClick={() => setActiveTab('mandate')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'mandate'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Penegakan Mandat Mutlak (Kepatuhan)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'fleet' ? (
            <div className="space-y-4">
              {/* Metric Quick Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Status Optimal</div>
                  <div className="text-xl font-bold text-emerald-400 tabular-nums">
                    {fleetSummary.optimalCount} <span className="text-xs text-neutral-500 font-normal">/ {fleetSummary.totalMachines}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Rerata Latensi Mesin</div>
                  <div className="text-xl font-bold text-blue-400 tabular-nums font-mono">
                    {fleetSummary.averageLatencyMs} <span className="text-xs text-neutral-500 font-normal">ms</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Degradasi / Offline</div>
                  <div className="text-xl font-bold text-neutral-300 tabular-nums">
                    {fleetSummary.degradedCount + fleetSummary.offlineCount} <span className="text-xs text-emerald-500 font-normal">Auto-Healed</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400">Audit Diagnostik</div>
                    <div className="text-xs text-neutral-300 font-medium mt-0.5">Kontinu Otomatis</div>
                  </div>
                  <button
                    onClick={handleRunAudit}
                    disabled={isAuditing}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors disabled:opacity-50"
                    title="Audit Armada Sekarang"
                  >
                    <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin text-blue-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  {(['all', 'core', 'opensource', 'mcp'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-md capitalize transition-colors ${
                        categoryFilter === cat
                          ? 'bg-neutral-800 text-neutral-100 font-medium border border-neutral-700'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      {cat === 'opensource' ? 'Open Source' : cat}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-neutral-500">
                  Menampilkan {filteredMachines.length} mesin aktif
                </span>
              </div>

              {/* Machines List Table */}
              <div className="space-y-2">
                {filteredMachines.map(m => {
                  const isOptimal = m.status === 'OPTIMAL' || m.status === 'HEALTHY';
                  return (
                    <div
                      key={m.engineName}
                      className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/60 flex items-center justify-between gap-4 hover:border-neutral-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isOptimal ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-100 text-sm">{m.engineName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase tracking-wider font-mono">
                              {m.category}
                            </span>
                            <span className="text-[11px] text-emerald-400 font-mono">
                              {m.healthScore}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                            <span>{m.diagnosticMessage}</span>
                            <span className="text-neutral-600">·</span>
                            <span className="text-[11px] text-neutral-500">{m.capabilities.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-medium text-neutral-300 tabular-nums">
                          {m.latencyMs}ms
                        </div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                          {m.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Tab Mandate */
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs space-y-1">
                <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Protokol Kepatuhan Mutlak (Zero-Disobedience Policy)</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Pengaturan ini mengunci model AI agar 100% tunduk pada kriteria Anda: dilarang menjawab nanggung,
                  dilarang basa-basi kosong, dilarang halusinasi, dan wajib menyertakan bukti komputasi mesin nyata.
                </p>
              </div>

              {/* Strictness Level Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Tingkat Keketatan Kepatuhan Mandat
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ABSOLUTE', title: 'Mutlak (Absolute)', desc: '0% toleransi halusinasi atau teks malas' },
                    { id: 'HIGH', title: 'Tinggi (High)', desc: 'Penegakan ketat standar institusional' },
                    { id: 'FLEXIBLE', title: 'Fleksibel', desc: 'Cocok untuk obrolan bebas non-teknis' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setMandateProfile(prev => ({ ...prev, strictnessLevel: lvl.id as any }))}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        mandateProfile.strictnessLevel === lvl.id
                          ? 'border-blue-500 bg-blue-500/10 text-neutral-100'
                          : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-neutral-200">{lvl.title}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rule Toggles */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Mandat Mutlak Spesifik
                </label>

                {[
                  {
                    key: 'prohibitPleasantries',
                    title: 'Dilarang Basa-Basi Pembuka (Anti-Pleasantry)',
                    desc: 'Melarang kalimat seperti "Tentu, saya siap membantu". AI langsung memberikan solusi di baris pertama.'
                  },
                  {
                    key: 'tradingInstantSignalRequired',
                    title: 'Wajib Blok Kode json signal Institusional',
                    desc: 'Setiap analisis pasar finansial/kripto wajib menyertakan blok kode json signal institusional non-repainting.'
                  },
                  {
                    key: 'singlePassMediaRenderRequired',
                    title: 'Rendering Media Presisi 1 Kali (Anti-Loop)',
                    desc: 'Menghasilkan artefak visual/video/audio tepat satu kali tanpa perulangan atau duplikasi di chat.'
                  },
                  {
                    key: 'proactiveGoalDecompositionEnabled',
                    title: 'Otomasi Target Multi-Langkah Proaktif',
                    desc: 'Mendekomposisi tujuan makro pengguna menjadi rantai eksekusi mesin berantai tanpa perlu dituntun satu per satu.'
                  },
                  {
                    key: 'zeroPlaceholderEnforced',
                    title: 'Larangan Keras Placeholder Kode (Zero-Placeholder)',
                    desc: 'Dilarang menyajikan kode terpotong dengan komentar "// TODO" atau "// rest of code".'
                  }
                ].map(item => (
                  <label
                    key={item.key}
                    className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4 cursor-pointer hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-neutral-200">{item.title}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean((mandateProfile as any)[item.key])}
                      onChange={(e) => setMandateProfile(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {isSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    Mandat berhasil diperbarui!
                  </span>
                )}
                <button
                  onClick={handleSaveMandate}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
                >
                  Terapkan & Kunci Mandat Pengguna
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-500">
          <span>NAVIX PRO AI Engine Architecture v4.2</span>
          <span>Fail-Closed Empiric Quality Gate Active</span>
        </div>
      </div>
    </div>
  );
};
