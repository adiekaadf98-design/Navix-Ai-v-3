import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronRight, 
  Check
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
    'collaborative_understanding': 'Kolaborasi Tim Multi-Model: Dekonstruksi & Pemeriksaan Silang',
    'collaborative_verification': 'Verifikasi Multi-Model & Konsensus Tim AI',
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
    <div className="w-full max-w-full my-1.5 select-none text-left font-sans">
      {/* Bar Status Text-Based Minimalis */}
      <div className="flex flex-col gap-1.5 py-1">
        {/* Baris Utama Indikator */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Indikator Status Pulsing / Checkmark */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isThinking ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
              )}

              <span className={`text-xs font-medium tracking-tight ${
                isThinking 
                  ? 'text-neutral-200' 
                  : 'text-neutral-400'
              }`}>
                {isThinking ? 'Mesin Kognitif Aktif' : 'Proses Berpikir Selesai'}
              </span>

              <span className="text-[11px] font-mono text-neutral-500">
                ({displaySeconds}s)
              </span>
            </div>

            {/* Separator Titik & Metadata Teks */}
            <span className="text-neutral-700 text-xs hidden sm:inline">·</span>

            <span className="text-[11px] text-neutral-400">
              {taskTypeLabels[taskType] || taskType}
            </span>

            <span className="text-neutral-700 text-xs hidden sm:inline">·</span>

            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              {effortLabels[effort] || effort}
            </span>

            {!isThinking && (
              <>
                <span className="text-neutral-700 text-xs hidden md:inline">·</span>
                <span className="text-[11px] text-neutral-500 hidden md:inline">
                  {completedCount}/{stepsList.length} tahap
                </span>
              </>
            )}
          </div>

          {/* Tombol Toggle Detail Ramping Text-Based */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 active:text-neutral-200 transition-colors py-0.5 px-1 rounded cursor-pointer"
            aria-expanded={isExpanded}
            title={isExpanded ? 'Sembunyikan alur penalaran' : 'Tampilkan alur penalaran'}
          >
            <span>{isExpanded ? 'Tutup alur' : 'Detail alur'}</span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Status Langkah Ringkas (Hanya saat alur ditutup) */}
        {isThinking && !isExpanded && (
          <div className="flex items-center gap-2 text-[11px] text-purple-400/90 pl-1 break-words">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-400"></span>
            </span>
            <span className="animate-pulse tracking-normal break-words">
              {mappedCurrentStep || 'Menganalisis instruksi secara mendalam...'}
            </span>
          </div>
        )}

        {/* Konten Rincian Alur Kerja (Progressive Step-by-Step, Tanpa Garis Kiri) */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden pt-1.5"
            >
              <div className="py-1 space-y-2">
                {/* Daftar Alur Langkah Teks Muncul Sekuensial Satu Per Satu */}
                <div className="space-y-2">
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
                        // Langkah bergeser bertahap setiap ~2 detik per proses
                        const timeBasedIndex = Math.min(Math.floor(liveSeconds / 2.0), totalSteps - 1);
                        const completedBasedIndex = Math.min(completedSteps.length, totalSteps - 1);
                        activeIndex = Math.max(completedBasedIndex, timeBasedIndex);
                      }
                    }

                    // HANYA tampilkan langkah yang sudah berjalan atau sedang aktif (muncul bertahap)
                    const visibleSteps = isThinking 
                      ? stepsList.slice(0, activeIndex + 1)
                      : stepsList;

                    return visibleSteps.map((step, idx) => {
                      const isCompleted = !isThinking || idx < activeIndex;
                      const isActive = isThinking && idx === activeIndex;

                      return (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="flex items-start gap-2.5 text-[12px] leading-relaxed break-words"
                        >
                          {/* Ikon: Centang untuk yang selesai, Titik Denyut Halus untuk yang aktif */}
                          <div className="mt-0.5 shrink-0 flex items-center justify-center w-4 h-4">
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] animate-in zoom-in-75 duration-150" />
                            ) : (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                              </span>
                            )}
                          </div>

                          {/* Teks Langkah */}
                          <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2 flex-wrap">
                            <span className={`${
                              isActive 
                                ? 'text-neutral-100 font-medium' 
                                : 'text-neutral-400'
                            } break-words transition-colors duration-200`}>
                              {step}
                            </span>

                            {isActive && (
                              <span className="text-[10px] text-purple-400/90 font-mono shrink-0 animate-pulse">
                                sedang memproses...
                              </span>
                            )}
                          </div>
                        </motion.div>
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
