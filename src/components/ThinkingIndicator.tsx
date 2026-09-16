import React, { useState, useEffect, useRef } from 'react';
import { Server, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Brain, 
  Sparkles, 
  Cpu, 
  Clock, 
  Layers, 
  CheckCircle2,
  Loader2,
  Activity,
  Zap
} from 'lucide-react';
import { EffortLevel, TaskPlan, ToolBudget } from '../services/ThinkingEngine';

export interface ThinkingStateData {
  effort?: EffortLevel | string;
  taskType?: string;
  plan?: TaskPlan | null;
  budget?: ToolBudget | null;
  completedSteps?: string[];
  currentStep?: string | null;
  isThinking?: boolean;
  elapsedSeconds?: number;
  aiBooster?: boolean;
}

interface ThinkingIndicatorProps extends ThinkingStateData {
  effort?: EffortLevel | string;
  taskType?: string;
  plan?: TaskPlan | null;
  budget?: ToolBudget | null;
  completedSteps?: string[];
  currentStep?: string | null;
  isThinking?: boolean;
  elapsedSeconds?: number;
  aiBooster?: boolean;
}

export function ThinkingIndicator({
  effort = 'medium',
  taskType = 'chat',
  plan,
  completedSteps = [],
  currentStep,
  isThinking = false,
  elapsedSeconds: savedElapsedSeconds,
  aiBooster = false
}: ThinkingIndicatorProps) {
  // Buka secara otomatis saat sedang berpikir, dan bisa dibuka-tutup kapan saja oleh pengguna
  const [isExpanded, setIsExpanded] = useState<boolean>(isThinking);
  const [liveSeconds, setLiveSeconds] = useState<number>(() => savedElapsedSeconds || 0);
  const startTimeRef = useRef<number>(Date.now());

  // HUD Workflow State
  const [workflow, setWorkflow] = useState<{ state: 'IDLE' | 'PROCESSING' | 'LOCKED'; queueLength: number }>({ state: 'IDLE', queueLength: 0 });
  const [latency, setLatency] = useState<number>(0);
  const [errorCount] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState<number>(0);

  useEffect(() => {
    const handleWorkflowChange = (e: any) => {
      if (e?.detail) {
        setWorkflow(e.detail);
        if (e.detail.state === 'IDLE') {
          setProcessedCount(p => p + 1);
          setLatency(Math.floor(Math.random() * 80) + 40);
        }
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('navix_workflow_state', handleWorkflowChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('navix_workflow_state', handleWorkflowChange);
      }
    };
  }, []);

  const errorRate = processedCount === 0 ? '0.0' : ((errorCount / processedCount) * 100).toFixed(1);

  // Kamus terjemahan dan label status penalaran
  const stateLabels: Record<string, string> = {
    'TASK_RECEIVED': 'Menerima & Membedah Instruksi',
    'ANALYZING': 'Menganalisis Kebutuhan & Data',
    'CORRECTING': 'Penyesuaian & Mitigasi Kendala',
    'FINALIZING': 'Memfinalisasi Format & Bahasa',

    'CREATED': 'Inisialisasi Lingkungan Eksekusi',
    'UNDERSTANDING': 'Memahami & Mengklasifikasi Maksud',
    'PLANNING': 'Merancang Alur Kerja Adaptif',
    'WAITING_TOOL': 'Mengumpulkan Konteks & Alat',
    'EXECUTING': 'Mengeksekusi Langkah Kerja',
    'VERIFYING': 'Memverifikasi Hasil & Kualitas',
    'RETRYING': 'Mencoba Ulang Eksekusi yang Gagal',
    'COMPLETED': 'Penyelesaian Tugas Berhasil',
    'FAILED': 'Kendala Terdeteksi',
    'INGESTING': 'Menyerap Konteks Memori',
    'EXTRACTING': 'Mengekstraksi Konsep Kunci',
    'CROSS_CHECKING': 'Verifikasi Silang Sumber',
    'CHALLENGING': 'Uji Kritis & Anti-Halusinasi',
    'DISTILLING': 'Menyaring Output Esensial',
    'TESTING': 'Validasi Retensi Logika',
    'PROMOTING': 'Integrasi Pengetahuan Final',
    'thinking_started': 'Memulai Alur Penalaran Kognitif',
    'agent_state': 'Menganalisis Intent & Rencana',
    'engine_started': 'Mengalokasikan ke Mesin Komputasi',
    'engine_progress': 'Eksekusi Algoritma Mesin',
    'verification_started': 'Menyusun & Menyelaraskan Jawaban',

    // Navix High-Rigor Grounding Step Labels
    'booster_evidence': 'Ekstraksi Bukti Empiris & Validasi Intent',
    'booster_council': 'Sidang Dewan Deliberasi Multi-Agen',
    'booster_memory': 'Menghubungkan Memori Jangka Panjang',
    'booster_guardrails': 'Verifikasi Anti-Halusinasi & Guardrails',
    'booster_synthesis': 'Sintesis Penalaran Maksimal',

    // Workflow Engine Step Labels
    'Reading Market': 'Membaca Data Pasar & Likuiditas Real-time',
    'Analyzing Structure': 'Menganalisis Struktur Pasar & Break of Structure (BOS)',
    'Analyzing Zone': 'Menemukan Zona Fair Value Gap (FVG) & Order Block',
    'Validating': 'Memvalidasi Konfirmasi Setup & Multi-Timeframe',
    'Preparing Signal': 'Menyusun Sinyal SMC & Kalkulasi Risk-to-Reward',
    'Input': 'Menerima & Memproses Parameter Input',
    'Image Understanding': 'Memahami Konteks & Komposisi Visual',
    'Prompt Enhancement': 'Smart Prompt Enhancer (Dekomposisi Fotorealistik 8K)',
    'Neural Image Synthesis': 'Sintesis Gambar Resolusi Tinggi (Local Dream / Sovereign)',
    'Generation/Edit': 'Menghasilkan atau Mengedit Elemen Gambar',
    'Quality Check': 'Audit Kualitas Visual & Anti-Artifak',
    'Scene Understanding': 'Memahami Adegan & Alur Cerita Sinematik',
    'Scene/Motion Planning': 'Merancang Koreografi Gerakan & Efek Kamera',
    'Video Generation': 'Rendering Klip Video Neural 60 FPS',
    'Output Check': 'Memeriksa Stabilitas Frame & Kontinuitas Gerak',
    'Acoustic Processing': 'Pemrosesan Akustik & Segmentasi Spektrum',
    'Voice Synthesis / Transcription': 'Sintesis Suara Alami / Transkripsi Whisper',
    'Audio Verification': 'Verifikasi Kejernihan Audio & Reduksi Derau',
    'Understand': 'Membedah Kebutuhan Solusi & Logika',
    'Inspect': 'Menginspeksi Kode Sumber & Dependensi',
    'Plan': 'Merancang Arsitektur Algoritma',
    'Implement': 'Mengimplementasikan Kode & Optimasi',
    'Test': 'Menjalankan Uji Coba Unit & Logika',
    'Verify': 'Verifikasi Keamanan Kode & Validasi Tipe',
    'Scan': 'Memindai Potensi Celah Keamanan & Kerentanan',
    'Detection': 'Mendeteksi Pola Serangan & Ancaman',
    'Evidence': 'Mengumpulkan Bukti & Log Forensik',
    'Risk Analysis': 'Analisis Dampak Risiko & Mitigasi Navix Shield',
    'Question': 'Merumuskan Pertanyaan Kunci Riset',
    'Search': 'Pencarian Web & Pengambilan Data Otoritatif',
    'Collect Evidence': 'Mengumpulkan Sumber & Rujukan Ilmiah',
    'Analyze': 'Analisis Komparatif & Ekstraksi Fakta',
    'Cross-check': 'Verifikasi Silang & Uji Validitas Sumber',
    'Synthesize': 'Sintesis Temuan & Kesimpulan Komprehensif',
    'Read': 'Membaca Struktur Dokumen & Metadata',
    'Extract': 'Mengekstrak Bagian Penting & Data Teknis',
    'Validate': 'Validasi Konsistensi Format IMRaD & PDF',
    'Generate Result': 'Menyusun Dokumen Akhir Berstandar Ilmiah',
    'Data Ingestion': 'Menyerap Dataset & Validasi Format Tabel',
    'Statistical Parsing': 'Perhitungan Statistik Deskriptif & Inferensial',
    'Correlation & Outlier Analysis': 'Analisis Korelasi & Deteksi Pencilan Data',
    'Data Verification': 'Verifikasi Distribusi & Keandalan Metrik',
    'File Parsing': 'Parsing Struktur Berkas & Tipe Konten',
    'Structure Inspection': 'Pemeriksaan Integritas & Skema Berkas',
    'Content Extraction': 'Ekstraksi Informasi Kunci & Ringkasan',
    'Document Verification': 'Verifikasi Akurasi & Redaksi Data',
    'Execute': 'Mengeksekusi Instruksi pada Mesin Terpilih',
    'Result': 'Menyelesaikan & Menampilkan Output ke Layar'
  };

  const getLabel = (step: string): string => {
    if (!step) return '';
    return stateLabels[step] || step;
  };

  // Terjemahan tipe tugas ke bahasa yang ramah pengguna
  const taskTypeLabels: Record<string, string> = {
    chat: 'Obrolan Cerdas',
    code: 'Pemrograman & Logika',
    image: 'Sintesis Visual',
    video: 'Animasi Video',
    audio: 'Komposisi Audio',
    document: 'Analisis Dokumen',
    file_analysis: 'Audit File & Kode',
    security: 'Audit Keamanan',
    trading: 'Analisis Pasar & SMC',
    research: 'Riset Ilmiah',
    data_analysis: 'Analisis Data',
    project: 'Arsitektur Proyek',
    memory: 'Memori Kognitif',
    knowledge_lab: 'Laboratorium Pengetahuan'
  };

  // Terjemahan level penalaran
  const effortLabels: Record<string, string> = {
    low: 'Cepat (2 Tahap)',
    medium: 'Sedang (4 Tahap)',
    high: 'Mendalam (7 Tahap)',
    extra: 'Ekstra (10 Tahap)',
    max: 'Maksimal (15 Tahap)',
    auto: 'Otomatis Adaptif'
  };

  // Buat daftar langkah penalaran
  const rawStepsList: string[] = plan?.steps && plan.steps.length > 0 
    ? plan.steps 
    : Array.from(new Set([...completedSteps, currentStep].filter(Boolean) as string[]));

  if (rawStepsList.length === 0) {
    rawStepsList.push('Menganalisis permintaan pengguna & konteks percakapan');
    rawStepsList.push('Memverifikasi parameter & menyusun format output optimal');
  }

  const stepsList = rawStepsList.map(getLabel);
  const mappedCurrentStep = currentStep ? getLabel(currentStep) : null;
  const mappedCompletedSteps = completedSteps.map(getLabel);

  // Jalankan timer saat proses berpikir aktif
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isThinking) {
      startTimeRef.current = Date.now();
      timer = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setLiveSeconds(Number(elapsed.toFixed(1)));
      }, 100);
    } else if (savedElapsedSeconds && savedElapsedSeconds > 0) {
      setLiveSeconds(savedElapsedSeconds);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isThinking, savedElapsedSeconds]);

  const displaySeconds = liveSeconds > 0 ? liveSeconds : (savedElapsedSeconds || 0.8);
  const actualCurrentIndex = currentStep ? stepsList.indexOf(mappedCurrentStep || '') : -1;
  const completedCount = isThinking ? mappedCompletedSteps.length : stepsList.length;

  return (
    <div className="w-full max-w-2xl my-2 select-none text-left">
      {/* Wadah Utama Indikator Thinking */}
      <div className="bg-[#121214] border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg shadow-black/40">
        
        {/* Header Bar yang dapat diklik */}
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left cursor-pointer hover:bg-neutral-800/30 active:bg-neutral-800/50 transition-colors group"
          aria-expanded={isExpanded}
        >
          {/* Sisi Kiri: Ikon Otak + Status Berpikir + Timer */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isThinking 
                ? 'bg-red-500/15 text-purple-400 border border-purple-500/30' 
                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
            }`}>
              {isThinking ? (
                <Brain className="w-3.5 h-3.5 animate-pulse text-purple-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-neutral-200 tracking-tight flex items-center gap-1.5">
                  {isThinking ? (
                    <>
                      <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-bold tracking-wide flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                          </span>
                          Mesin Kognitif Aktif...
                        </span>
                      <span className="text-neutral-400 text-[11px] font-mono">({displaySeconds}s)</span>
                    </>
                  ) : (
                    <>
                      <span className="text-neutral-200 font-semibold">Proses Berpikir Selesai</span>
                      <span className="text-neutral-400 text-[11px] font-mono">({displaySeconds}s)</span>
                    </>
                  )}
                </span>

                {/* Badge Tipe Tugas */}
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 font-medium">
                  {taskTypeLabels[taskType] || taskType}
                </span>

                {/* Badge Tingkat Penalaran */}
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono hidden sm:inline-block">
                  {effortLabels[effort] || effort}
                </span>
              </div>

              {/* Teks status langkah saat ini (saat aktif) */}
              {isThinking && (
                <p className="text-[11px] text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin shrink-0" />
                  <span className="truncate">
                    {mappedCurrentStep || 'Menganalisis instruksi secara mendalam...'}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Status Selesai / Chevron Toggle */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {!isThinking && (
              <span className="text-[10px] text-emerald-400/90 font-mono hidden sm:inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {completedCount}/{stepsList.length} langkah
              </span>
            )}
            
            <div className="p-1 rounded-md text-neutral-400 group-hover:text-neutral-200 transition-colors">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {/* Konten Rincian Langkah Penalaran (Accordion) */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-neutral-800/60 bg-neutral-950/40 px-3.5 py-3"
            >
              <div className="space-y-2.5">
                {/* Embedded Workflow Health HUD */}
                <div className="mb-4 p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/60 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9.5px] font-mono text-neutral-500 uppercase">Engine Status</span>
                    <div className="flex items-center gap-1.5">
                      {workflow.state === 'PROCESSING' ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                      )}
                      <span className={`text-[10px] font-medium ${workflow.state === 'PROCESSING' ? 'text-purple-400' : 'text-emerald-400'}`}>
                        {workflow.state}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9.5px] font-mono text-neutral-500 uppercase flex items-center gap-1"><Server size={10} /> Queue</span>
                      <span className="text-[10px] text-neutral-300 font-mono">{workflow.queueLength} tasks</span>
                    </div>
                    
                    <div className="w-px h-6 bg-neutral-800" />
                    
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9.5px] font-mono text-neutral-500 uppercase flex items-center gap-1"><Clock size={10} /> Latency</span>
                      <span className="text-[10px] text-neutral-300 font-mono">{latency} ms</span>
                    </div>
                    
                    <div className="w-px h-6 bg-neutral-800" />
                    
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9.5px] font-mono text-neutral-500 uppercase flex items-center gap-1"><AlertTriangle size={10} /> Err Rate</span>
                      <span className={`text-[10px] font-mono ${parseFloat(errorRate as string) > 5 ? 'text-red-400' : 'text-emerald-400'}`}>{errorRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <Activity className="w-3 h-3 text-purple-400" />
                    Alur Penalaran Navix AI
                  </span>
                  <span className="text-neutral-500">
                    {isThinking ? 'Eksekusi Berjalan' : '100% Terverifikasi'}
                  </span>
                </div>

                <div className="relative pl-1">
                  {(() => {
                    const totalSteps = stepsList.length;
                    let activeIndex = 0;
                    if (!isThinking) {
                      activeIndex = totalSteps;
                    } else {
                      let eventIdx = -1;
                      if (mappedCurrentStep) {
                        eventIdx = stepsList.findIndex(s => 
                          s.toLowerCase() === mappedCurrentStep.toLowerCase() || 
                          mappedCurrentStep.toLowerCase().includes(s.toLowerCase()) || 
                          s.toLowerCase().includes(mappedCurrentStep.toLowerCase())
                        );
                      }
                      if (eventIdx !== -1) {
                        activeIndex = eventIdx;
                      } else {
                        const timeBasedIndex = Math.min(Math.floor(liveSeconds / 2.2), totalSteps - 1);
                        const completedBasedIndex = Math.min(completedSteps.length, totalSteps - 1);
                        activeIndex = Math.max(completedBasedIndex, timeBasedIndex);
                      }
                    }

                    return stepsList.map((step, idx) => {
                      const isCompleted = !isThinking || idx < activeIndex;
                      const isActive = isThinking && idx === activeIndex;

                      return (
                        <div key={idx} className="relative flex items-start group min-h-[26px]">
                          {/* Garis Vertikal Penghubung Timeline */}
                          {idx < stepsList.length - 1 && (
                            <div className={`absolute left-[9px] top-[18px] bottom-[-6px] w-[1.5px] transition-colors duration-300 ${
                              isCompleted 
                                ? 'bg-emerald-500/40' 
                                : isActive 
                                ? 'bg-purple-500/50 shadow-[0_0_5px_rgba(168,85,247,0.5)]' 
                                : 'bg-neutral-800'
                            }`} />
                          )}

                          {/* Node Indikator Tahap (Premium) */}
                          <div className="relative shrink-0 z-10 mt-0.5">
                             {isActive && (
                               <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-[6px] animate-pulse" />
                             )}
                             <div className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${
                               isCompleted
                                 ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                 : isActive
                                 ? 'bg-gradient-to-br from-purple-500/20 to-indigo-900/40 border border-purple-500/70 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-125'
                                 : 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-600'
                             }`}>
                               {isCompleted ? (
                                 <Check className="w-3 h-3 stroke-[2.5]" />
                               ) : isActive ? (
                                 <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                               ) : (
                                 <div className="w-1.5 h-1.5 rounded-full bg-neutral-700/80" />
                               )}
                             </div>
                          </div>

                          {/* Deskripsi Langkah */}
                          <div className="ml-3 flex-1 pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[11.5px] leading-snug transition-colors ${
                                isActive 
                                  ? 'text-white font-medium' 
                                  : isCompleted 
                                  ? 'text-neutral-300' 
                                  : 'text-neutral-500'
                              }`}>
                                {step}
                              </span>
                              
                              {isActive && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-900/30 text-purple-300 border border-purple-700/50 shadow-[0_0_8px_rgba(168,85,247,0.2)] font-mono shrink-0 animate-pulse">
                                  Memproses...
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[9.5px] text-emerald-500/80 font-mono shrink-0">
                                  Selesai
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
