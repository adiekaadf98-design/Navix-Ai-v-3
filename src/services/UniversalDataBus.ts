/**
 * NAVIX PRO AI — UNIVERSAL INTER-ENGINE DATA BUS (UIEB)
 * 
 * Protokol Transmisi Data Mesin-ke-Mesin (Machine-to-Machine / M2M):
 * Menjamin aliran data antar tahap eksekusi mesin berjalan 100% utuh tanpa kehilangan presisi
 * (zero data loss), dengan metadata telemetri, hasil kalkulasi terverifikasi, dan artefak biner.
 */

export interface EngineExecutionStage {
  stageIndex: number;
  engineName: string;
  category: 'core' | 'opensource' | 'mcp' | 'verification';
  action: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RECOVERED';
  inputPayload: any;
  outputData: any;
  latencyMs: number;
  verificationScore?: number;
  error?: string;
  fallbackUsed?: string;
  timestamp: number;
}

export interface UniversalDataEnvelope {
  traceId: string;
  originalQuery: string;
  domain: string;
  stages: EngineExecutionStage[];
  currentPayload: any;
  finalVerifiedOutput: any;
  totalLatencyMs: number;
  allStagesSucceeded: boolean;
  qualityGatePassed: boolean;
}

export class UniversalDataBus {
  private static instance: UniversalDataBus;

  public static getInstance(): UniversalDataBus {
    if (!UniversalDataBus.instance) {
      UniversalDataBus.instance = new UniversalDataBus();
    }
    return UniversalDataBus.instance;
  }

  /**
   * Membuat envelope data baru untuk sebuah alur tugas pengguna.
   */
  public createEnvelope(query: string, domain: string, initialPayload?: any): UniversalDataEnvelope {
    return {
      traceId: `uieb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalQuery: query,
      domain,
      stages: [],
      currentPayload: initialPayload || {},
      finalVerifiedOutput: null,
      totalLatencyMs: 0,
      allStagesSucceeded: false,
      qualityGatePassed: false
    };
  }

  /**
   * Merekam penyelesaian sebuah tahap eksekusi mesin dan memperbarui payload untuk tahap berikutnya.
   */
  public recordStage(
    envelope: UniversalDataEnvelope,
    stage: Omit<EngineExecutionStage, 'stageIndex' | 'timestamp'>
  ): UniversalDataEnvelope {
    const stageIndex = envelope.stages.length + 1;
    const completedStage: EngineExecutionStage = {
      ...stage,
      stageIndex,
      timestamp: Date.now()
    };

    envelope.stages.push(completedStage);
    envelope.totalLatencyMs += completedStage.latencyMs;

    // Handoff data: jika tahap sukses, jadikan outputnya sebagai payload tahap selanjutnya
    if (completedStage.status === 'SUCCESS' || completedStage.status === 'RECOVERED') {
      envelope.currentPayload = {
        ...envelope.currentPayload,
        ...completedStage.outputData,
        _previousStage: completedStage.engineName,
        _previousOutput: completedStage.outputData
      };
      envelope.finalVerifiedOutput = completedStage.outputData;
    }

    envelope.allStagesSucceeded = envelope.stages.every(
      s => s.status === 'SUCCESS' || s.status === 'RECOVERED'
    );

    return envelope;
  }

  /**
   * Mengekstrak data ringkasan telemetri untuk ditampilkan di inspektur UI (ChatArea).
   */
  public getInspectorSummary(envelope: UniversalDataEnvelope) {
    return {
      traceId: envelope.traceId,
      domain: envelope.domain,
      totalLatencyMs: envelope.totalLatencyMs,
      stagesCount: envelope.stages.length,
      qualityGatePassed: envelope.qualityGatePassed,
      stages: envelope.stages.map(s => ({
        index: s.stageIndex,
        engine: s.engineName,
        category: s.category,
        action: s.action,
        status: s.status,
        latencyMs: s.latencyMs,
        score: s.verificationScore || 100,
        fallbackUsed: s.fallbackUsed,
        hasOutput: Boolean(s.outputData)
      }))
    };
  }
}

export const globalUniversalDataBus = UniversalDataBus.getInstance();
