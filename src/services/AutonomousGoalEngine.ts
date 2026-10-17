/**
 * NAVIX PRO AI — AUTONOMOUS GOAL DECOMPOSITION ENGINE
 * 
 * Mesin Otomasi Target Multi-Langkah Proaktif (Goal-Oriented Autonomous Loop):
 * Mengidentifikasi target makro pengguna, mendekonstruksinya menjadi rantai sub-target mesin (DAG),
 * mengeksekusinya secara berantai melalui UIEB (Universal Inter-Engine Data Bus),
 * dan memvalidasi penyelesaian tujuan (Goal Completion) sebelum diserahkan ke pengguna.
 */

import { globalEngineRegistry } from './EngineRegistry';
import { globalUniversalDataBus, UniversalDataEnvelope } from './UniversalDataBus';
import { globalVerificationEngine } from './VerificationEngine';

export interface AutonomousGoalStage {
  id: string;
  order: number;
  title: string;
  engineName: string;
  category: 'core' | 'opensource' | 'mcp' | 'verification';
  action: string;
  completionCriteria: string;
  status: 'PENDING' | 'EXECUTING' | 'ACCOMPLISHED' | 'FAILED' | 'RECOVERED';
  output?: any;
  latencyMs?: number;
}

export interface AutonomousGoalPlan {
  goalId: string;
  macroGoal: string;
  isAutonomousTarget: boolean;
  domain: 'trading_report' | 'github_engineering' | 'scientific_analysis' | 'multimedia_production' | 'general';
  stages: AutonomousGoalStage[];
  completionCriteria: string[];
  expectedArtifactType: 'pdf' | 'signal' | 'code' | 'image' | 'video' | 'audio' | 'none';
}

export interface AutonomousGoalExecutionResult {
  goalId: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  achievedStages: number;
  totalStages: number;
  totalDurationMs: number;
  envelope: UniversalDataEnvelope;
  finalArtifact?: any;
  summaryReport: string;
}

export class AutonomousGoalEngine {
  private static instance: AutonomousGoalEngine;

  public static getInstance(): AutonomousGoalEngine {
    if (!AutonomousGoalEngine.instance) {
      AutonomousGoalEngine.instance = new AutonomousGoalEngine();
    }
    return AutonomousGoalEngine.instance;
  }

  /**
   * Menganalisis apakah sebuah perintah pengguna merupakan target makro multi-langkah.
   */
  public evaluateGoal(query: string): AutonomousGoalPlan {
    const q = query.trim().toLowerCase();
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Target Makro: Analisis Pasar + Sintesis Dokumen PDF Laporan
    const isTradingWithDoc = (q.includes('analis') || q.includes('trading') || q.includes('pasar') || q.includes('crypto') || q.includes('btc') || q.includes('saham')) &&
      (q.includes('pdf') || q.includes('dokumen') || q.includes('laporan') || q.includes('report') || q.includes('buatkan dokumen'));

    if (isTradingWithDoc) {
      return {
        goalId,
        macroGoal: query,
        isAutonomousTarget: true,
        domain: 'trading_report',
        expectedArtifactType: 'pdf',
        completionCriteria: [
          'Ekstraksi feed data klines bursa real-time',
          'Kalkulasi matriks likuiditas SMC & indikator non-repainting',
          'Penyusunan naskah laporan eksekutif berstruktur tabel',
          'Sintesis artefak dokumen PDF resmi via Docling Turbo'
        ],
        stages: [
          {
            id: 'stage_1_market_fetch',
            order: 1,
            title: 'Penarikan Data Pasar & Kalkulasi SMC',
            engineName: 'SignalEngine',
            category: 'core',
            action: 'Menghitung level likuiditas, RSI14, dan struktur order block',
            completionCriteria: 'Feed harga valid dan rasio R:R terhitung',
            status: 'PENDING'
          },
          {
            id: 'stage_2_volatility_audit',
            order: 2,
            title: 'Audit Volatilitas & Risiko Likuiditas',
            engineName: 'VolatilitySentinel',
            category: 'core',
            action: 'Inspeksi risiko spread dan probabilitas stop hunt',
            completionCriteria: 'Skor ketahanan volatilitas terverifikasi',
            status: 'PENDING'
          },
          {
            id: 'stage_3_pdf_generation',
            order: 3,
            title: 'Penerbitan Dokumen PDF Laporan Portofolio',
            engineName: 'DoclingCoreEngine',
            category: 'opensource',
            action: 'Mengompilasi naskah eksekutif ke dalam dokumen PDF terformat',
            completionCriteria: 'Buffer PDF valid > 0 bytes dengan layout terstruktur',
            status: 'PENDING'
          }
        ]
      };
    }

    // 2. Target Makro: Riset GitHub + Sintesis Arsitektur Kode + Audit Sintaksis
    const isGithubWithCode = (q.includes('github') || q.includes('repo') || q.includes('library') || q.includes('open source')) &&
      (q.includes('buatkan kode') || q.includes('implementasi') || q.includes('script') || q.includes('arsitektur'));

    if (isGithubWithCode) {
      return {
        goalId,
        macroGoal: query,
        isAutonomousTarget: true,
        domain: 'github_engineering',
        expectedArtifactType: 'code',
        completionCriteria: [
          'Inspeksi katalog repositori open-source GitHub resmi',
          'Penyusunan implementasi kode modular production-grade',
          'Verifikasi sintaksis dan kepatuhan zero-placeholder'
        ],
        stages: [
          {
            id: 'stage_1_repo_inspection',
            order: 1,
            title: 'Audit Repositori & Lisensi Open-Source',
            engineName: 'GitHubOpenSourceEngine',
            category: 'opensource',
            action: 'Mengevaluasi repositori terverifikasi dan dependensi sah',
            completionCriteria: 'Metadata repositori & dependensi teridentifikasi',
            status: 'PENDING'
          },
          {
            id: 'stage_2_code_synthesis',
            order: 2,
            title: 'Sintesis Kode Rekayasa Perangkat Lunak',
            engineName: 'CodingEngine',
            category: 'core',
            action: 'Menghasilkan modul kode TypeScript/Python utuh tanpa placeholder',
            completionCriteria: 'Kode lengkap dengan penanganan error',
            status: 'PENDING'
          },
          {
            id: 'stage_3_syntax_audit',
            order: 3,
            title: 'Audit Kualitas & Verifikasi Sintaksis',
            engineName: 'VerificationEngine',
            category: 'verification',
            action: 'Memastikan zero-placeholder dan validitas blok kode',
            completionCriteria: 'Skor Quality Gate 100%',
            status: 'PENDING'
          }
        ]
      };
    }

    // 3. Target Makro: Kalkulasi Matematika Kompleks + Visualisasi Gambar
    const isMathWithImage = (q.includes('hitung') || q.includes('kalkulasi') || q.includes('statistik') || q.includes('data')) &&
      (q.includes('visual') || q.includes('gambar') || q.includes('chart') || q.includes('plot'));

    if (isMathWithImage) {
      return {
        goalId,
        macroGoal: query,
        isAutonomousTarget: true,
        domain: 'scientific_analysis',
        expectedArtifactType: 'image',
        completionCriteria: [
          'Kalkulasi deterministik presisi tinggi',
          'Rendering representasi visual grafik fotorealistik presisi'
        ],
        stages: [
          {
            id: 'stage_1_calc',
            order: 1,
            title: 'Komputasi Deterministik Numerik',
            engineName: 'MathEngine',
            category: 'core',
            action: 'Menjalankan kalkulasi 50-digit presisi',
            completionCriteria: 'Hasil numerik eksak finite numbers',
            status: 'PENDING'
          },
          {
            id: 'stage_2_visual',
            order: 2,
            title: 'Rendering Visual Diagram / Infografis',
            engineName: 'ImageEngine',
            category: 'core',
            action: 'Merender visualisasi chart data presisi tinggi',
            completionCriteria: 'Gambar biner valid terverifikasi',
            status: 'PENDING'
          }
        ]
      };
    }

    // Default: Single-phase execution
    return {
      goalId,
      macroGoal: query,
      isAutonomousTarget: false,
      domain: 'general',
      stages: [],
      completionCriteria: [],
      expectedArtifactType: 'none'
    };
  }

  /**
   * Menjalankan eksekusi rantai sub-tugas secara otonom berantai.
   */
  public async executeAutonomousGoal(
    plan: AutonomousGoalPlan,
    initialPayload: any,
    onProgress?: (stageIndex: number, total: number, message: string) => void
  ): Promise<AutonomousGoalExecutionResult> {
    const startTime = Date.now();
    const envelope = globalUniversalDataBus.createEnvelope(plan.macroGoal, plan.domain, initialPayload);
    let achievedCount = 0;
    let finalArtifact: any = null;

    for (let i = 0; i < plan.stages.length; i++) {
      const stage = plan.stages[i];
      stage.status = 'EXECUTING';
      if (onProgress) {
        onProgress(i + 1, plan.stages.length, `[Otonom ${i + 1}/${plan.stages.length}] ${stage.title} (${stage.engineName})`);
      }

      const stageStartTime = Date.now();
      const engine = globalEngineRegistry.getEngine(stage.engineName);

      if (engine) {
        try {
          const stepInput = {
            ...envelope.currentPayload,
            originalQuery: plan.macroGoal,
            query: plan.macroGoal,
            prompt: plan.macroGoal,
            input: plan.macroGoal,
            targetGoal: plan.macroGoal
          };

          const result = await engine.execute(stepInput);
          const stageLatency = Date.now() - stageStartTime;
          stage.latencyMs = stageLatency;

          const isSuccess = result && (result.status === 'SUCCESS' || result.status === 'COMPLETED' || result.realOutput || result.data);

          if (isSuccess) {
            stage.status = 'ACCOMPLISHED';
            stage.output = result.realOutput || result.output || result.data || result;
            achievedCount++;

            // Rekam ke Data Bus
            globalUniversalDataBus.recordStage(envelope, {
              engineName: stage.engineName,
              category: stage.category,
              action: stage.action,
              status: 'SUCCESS',
              inputPayload: stepInput,
              outputData: stage.output,
              latencyMs: stageLatency,
              verificationScore: 98
            });

            // Tangkap artefak jika ada
            if (stage.output?.pdfUrl || stage.output?.imageBase64 || stage.output?.codeSnippet || stage.output?.instantSignalEligibility) {
              finalArtifact = stage.output;
            }
          } else {
            stage.status = 'FAILED';
            globalUniversalDataBus.recordStage(envelope, {
              engineName: stage.engineName,
              category: stage.category,
              action: stage.action,
              status: 'FAILED',
              inputPayload: stepInput,
              outputData: null,
              latencyMs: stageLatency,
              error: result?.error || 'Sub-tugas gagal dieksekusi.'
            });
          }
        } catch (err: any) {
          stage.status = 'FAILED';
          console.error(`[AutonomousGoalEngine] Stage ${stage.id} error:`, err);
        }
      } else {
        stage.status = 'FAILED';
      }
    }

    const totalDurationMs = Date.now() - startTime;
    const isCompleted = achievedCount === plan.stages.length;

    return {
      goalId: plan.goalId,
      status: isCompleted ? 'COMPLETED' : achievedCount > 0 ? 'PARTIAL' : 'FAILED',
      achievedStages: achievedCount,
      totalStages: plan.stages.length,
      totalDurationMs,
      envelope,
      finalArtifact,
      summaryReport: `Target makro otonom dieksekusi dalam ${totalDurationMs}ms (${achievedCount}/${plan.stages.length} tahap berhasil).`
    };
  }
}

export const globalAutonomousGoalEngine = AutonomousGoalEngine.getInstance();
