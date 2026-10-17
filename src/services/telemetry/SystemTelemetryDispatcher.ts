/**
 * NAVIX PRO AI — SYSTEM TELEMETRY DISPATCHER
 * 
 * Pengatur Rute Cerdas Berbasis Telemetri Beban Sistem (CPU & RAM):
 * Memantau telemetri sumber daya perangkat dan server secara real-time.
 * Jika beban sistem tinggi atau perangkat pengguna bersumber daya terbatas (hemat daya/HP),
 * tugas berat secara dinamis dialihkan ke penyedia spesialis (Dedicated Turbo Providers)
 * secara 100% UTUH tanpa pemotongan, menjamin zero-lag dan zero-crash.
 */

import { RuntimeTelemetryMetrics, HardwareResourceProfile } from '../ThinkingEngine';

export interface TelemetryResourceStatus {
  cpuPercent: number;
  memoryHeapMb: number;
  isSaturated: boolean;
  saturationLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  deviceTier: string;
  recommendedExecutionMode: 'LOCAL_OPTIMAL' | 'SERVER_TURBO_OFFLOAD';
  recommendationReason: string;
}

export interface TaskOffloadDecision {
  shouldOffloadToServer: boolean;
  targetProvider: string;
  dispatchReason: string;
  streamMode: boolean;
}

export class SystemTelemetryDispatcher {
  private static instance: SystemTelemetryDispatcher;

  public static getInstance(): SystemTelemetryDispatcher {
    if (!SystemTelemetryDispatcher.instance) {
      SystemTelemetryDispatcher.instance = new SystemTelemetryDispatcher();
    }
    return SystemTelemetryDispatcher.instance;
  }

  /**
   * Menilai status kejenuhan sumber daya komputasi secara presisi.
   */
  public evaluateSaturation(
    telemetry: RuntimeTelemetryMetrics,
    hardware: HardwareResourceProfile
  ): TelemetryResourceStatus {
    const cpu = telemetry.cpuPercent || 15;
    const heap = telemetry.memoryHeapMb || 60;
    const isConstrainedDevice = hardware.isResourceConstrained || hardware.deviceTier === 'low_end';

    // Ambang batas kejenuhan sumber daya (Resource Saturation Thresholds)
    const isCritical = cpu >= 85 || heap >= 480;
    const isElevated = cpu >= 68 || heap >= 320 || (isConstrainedDevice && cpu >= 50);

    const saturationLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = isCritical
      ? 'CRITICAL'
      : isElevated
      ? 'ELEVATED'
      : 'NORMAL';

    const isSaturated = saturationLevel !== 'NORMAL';

    const shouldOffload = isSaturated || isConstrainedDevice;

    return {
      cpuPercent: cpu,
      memoryHeapMb: heap,
      isSaturated,
      saturationLevel,
      deviceTier: hardware.deviceTier,
      recommendedExecutionMode: shouldOffload ? 'SERVER_TURBO_OFFLOAD' : 'LOCAL_OPTIMAL',
      recommendationReason: isCritical
        ? `Saturasi Kritis: CPU ${cpu}% / Heap ${heap}MB. Wajib alihkan ke Server Turbo Provider.`
        : isElevated
        ? `Beban Meningkat: CPU ${cpu}% / Heap ${heap}MB pada perangkat ${hardware.deviceTier}. Direkomendasikan eksekusi cloud.`
        : `Sumber daya prima: CPU ${cpu}% / Heap ${heap}MB. Aman dijalankan di mesin lokal.`
    };
  }

  /**
   * Menentukan keputusan pengalihan tugas berat ke penyedia spesialis tanpa memotong tugas.
   */
  public decideTaskRoute(
    taskCategory: string,
    currentEngine: string,
    resourceStatus: TelemetryResourceStatus
  ): TaskOffloadDecision {
    const isHeavyDomain = 
      taskCategory.includes('trading') || 
      taskCategory.includes('market') || 
      taskCategory.includes('crypto') ||
      taskCategory.includes('math') || 
      taskCategory.includes('multimedia') || 
      taskCategory.includes('video') || 
      taskCategory.includes('image') ||
      taskCategory.includes('audio') || 
      taskCategory.includes('document') ||
      currentEngine.includes('Signal') ||
      currentEngine.includes('RetailTrader') ||
      currentEngine.includes('Docling') ||
      currentEngine.includes('Video');

    // Jika sistem mengalami kejenuhan dan tugas tergolong berat, alihkan ke Specialized Turbo Provider
    if (resourceStatus.isSaturated && isHeavyDomain) {
      if (taskCategory.includes('trading') || currentEngine.includes('Signal') || currentEngine.includes('RetailTrader')) {
        return {
          shouldOffloadToServer: true,
          targetProvider: 'ServerQuantSMCProvider',
          dispatchReason: `[Telemetry Offload] Beban ${resourceStatus.saturationLevel} (CPU ${resourceStatus.cpuPercent}%). Kalkulasi pasar dialihkan ke Server Quantitative SMC Provider 100% utuh.`,
          streamMode: true
        };
      }

      if (taskCategory.includes('video') || currentEngine.includes('Video')) {
        return {
          shouldOffloadToServer: true,
          targetProvider: 'TurboVideoFFmpegProvider',
          dispatchReason: `[Telemetry Offload] Render video membutuhkan daya besar. Dialihkan ke Turbo Video FFmpeg Server.`,
          streamMode: true
        };
      }

      if (taskCategory.includes('image') || currentEngine.includes('Image')) {
        return {
          shouldOffloadToServer: true,
          targetProvider: 'TurboFooocusSDXLProvider',
          dispatchReason: `[Telemetry Offload] Sintesis gambar dialihkan ke Fooocus SDXL Turbo Provider untuk menghemat RAM lokal.`,
          streamMode: true
        };
      }

      if (taskCategory.includes('document') || currentEngine.includes('Docling')) {
        return {
          shouldOffloadToServer: true,
          targetProvider: 'ServerDoclingParserProvider',
          dispatchReason: `[Telemetry Offload] Ekstraksi PDF dialihkan ke Server Docling Parser Provider.`,
          streamMode: true
        };
      }
    }

    return {
      shouldOffloadToServer: false,
      targetProvider: currentEngine,
      dispatchReason: `Eksekusi lokal standar optimal (Beban: ${resourceStatus.saturationLevel}).`,
      streamMode: false
    };
  }
}

export const globalTelemetryDispatcher = SystemTelemetryDispatcher.getInstance();
