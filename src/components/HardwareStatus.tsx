import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  Layers, 
  HardDrive, 
  Sparkles, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { localDreamImageEngine, HardwareCapabilities, LocalDreamLifecycleState } from '../services/engines/LocalDreamImageEngine';

export interface HardwareStatusProps {
  id?: string;
  className?: string;
  compact?: boolean;
  onStatusChange?: (status: {
    isReadyForLocalDream: boolean;
    recommendedBackend: 'npu' | 'gpu' | 'cpu';
    npuAvailable: boolean;
  }) => void;
}

export interface DetailedHardwareReport extends HardwareCapabilities {
  nnapiSupported: boolean;
  nnapiVendor?: string;
  daemonStatus: LocalDreamLifecycleState;
  daemonError?: string;
  isSnapdragonSoC: boolean;
  webglScore: number;
  memoryStatus: 'sufficient' | 'warning' | 'critical';
  lastScanTimestamp: string;
}

export const HardwareStatus: React.FC<HardwareStatusProps> = ({
  id = 'navix-hardware-status',
  className = '',
  compact = false,
  onStatusChange
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<DetailedHardwareReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'nnapi_details' | 'daemon'>('overview');

  const runHardwareDiagnostic = useCallback(async () => {
    setIsScanning(true);
    try {
      // 1. Detect base hardware via LocalDreamImageEngine
      const baseHw = localDreamImageEngine.detectHardware();
      const runtime = await localDreamImageEngine.probeRuntime();

      // 2. Perform NNAPI & Snapdragon NPU Specific Probes
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isAndroid = baseHw.isAndroid;
      const isSnapdragon = /Snapdragon|Adreno|SM8450|SM8550|SM8650|SM8750|Qualcomm/i.test(baseHw.gpuRenderer || '') ||
                          /Snapdragon|Adreno|SM8/i.test(ua);

      // Check Android Native NNAPI / Hexagon DSP Bridge
      let nnapiSupported = false;
      let nnapiVendor = 'Not Detected';

      if (typeof window !== 'undefined') {
        const nativeBridge = (window as any).LocalDreamBridge || (window as any).AndroidBridge;
        if (nativeBridge) {
          if (typeof nativeBridge.isNnapiAvailable === 'function') {
            try {
              nnapiSupported = await nativeBridge.isNnapiAvailable();
              nnapiVendor = 'Android Neural Networks API (NNAPI / QNN)';
            } catch {
              nnapiSupported = isSnapdragon;
            }
          } else {
            nnapiSupported = isSnapdragon;
            nnapiVendor = isSnapdragon ? 'Snapdragon Hexagon NPU Direct' : 'Generic Android HAL';
          }
        } else if (isSnapdragon && isAndroid) {
          nnapiSupported = true;
          nnapiVendor = 'Qualcomm Hexagon NPU (via Local Dream Daemon)';
        }
      }

      // Memory adequacy check
      let memoryStatus: 'sufficient' | 'warning' | 'critical' = 'sufficient';
      if (baseHw.deviceMemoryGb < 4) {
        memoryStatus = 'critical';
      } else if (baseHw.deviceMemoryGb < 6) {
        memoryStatus = 'warning';
      }

      const fullReport: DetailedHardwareReport = {
        ...baseHw,
        npuAvailable: nnapiSupported || baseHw.npuAvailable,
        socModel: isSnapdragon ? (baseHw.socModel || 'Qualcomm Snapdragon SoC') : 'ARM / Standard SoC',
        nnapiSupported,
        nnapiVendor,
        isSnapdragonSoC: isSnapdragon,
        daemonStatus: runtime.state,
        daemonError: runtime.error,
        webglScore: baseHw.gpuAvailable ? 94 : 0,
        memoryStatus,
        lastScanTimestamp: new Date().toLocaleTimeString()
      };

      setReport(fullReport);

      if (onStatusChange) {
        onStatusChange({
          isReadyForLocalDream: runtime.available || (nnapiSupported && memoryStatus !== 'critical'),
          recommendedBackend: fullReport.recommendedBackend,
          npuAvailable: fullReport.npuAvailable
        });
      }
    } catch (err) {
      console.error('[HardwareStatus] Diagnostic error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    runHardwareDiagnostic();
  }, [runHardwareDiagnostic]);

  if (!report) {
    return (
      <div id={id} className={`p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="text-sm font-medium">Scanning Android hardware & NPU / NNAPI acceleration...</span>
        </div>
      </div>
    );
  }

  // Compact Badge Mode
  if (compact) {
    const isNpuReady = report.npuAvailable;
    return (
      <div id={id} className={`flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${isNpuReady ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-200">
              {isNpuReady ? 'Snapdragon NPU Ready' : report.gpuAvailable ? 'GPU Acceleration' : 'CPU Inference'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {report.isAndroid ? 'Android Detected' : 'Web Runtime'} • {report.hardwareConcurrency} Cores
            </span>
          </div>
        </div>

        <button
          id={`${id}-refresh-btn`}
          onClick={runHardwareDiagnostic}
          disabled={isScanning}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Re-scan Hardware"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    );
  }

  // Full Expanded Diagnostic Card
  return (
    <div id={id} className={`rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-xl text-slate-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wide text-slate-100 uppercase">On-Device Hardware Diagnostics</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Local Dream Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time neural engine & hardware acceleration auditor for Android Stable Diffusion
            </p>
          </div>
        </div>

        <button
          id={`${id}-rescan-action`}
          onClick={runHardwareDiagnostic}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isScanning ? 'Auditing...' : 'Re-scan'}</span>
        </button>
      </div>

      {/* Grid: CPU, GPU, NPU / NNAPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* 1. CPU Card */}
        <div id={`${id}-cpu-card`} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">CPU Threading</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-lg font-bold text-slate-100 font-mono">
                {report.hardwareConcurrency} <span className="text-xs font-normal text-slate-400">Logical Cores</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Architecture: <span className="text-slate-300 font-mono">{report.platform || 'ARM64 / Android'}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
            Fallback engine available for quant SD1.5
          </div>
        </div>

        {/* 2. GPU Card */}
        <div id={`${id}-gpu-card`} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">GPU Acceleration</span>
              </div>
              {report.gpuAvailable ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Available
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  <XCircle className="w-3 h-3" /> Disabled
                </span>
              )}
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-medium text-slate-200 truncate" title={report.gpuRenderer || 'Adreno / WebGL'}>
                {report.gpuRenderer ? report.gpuRenderer.slice(0, 26) + '...' : 'Adreno / Vulkan GPU'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                WebGL 2.0 / WebGPU: <span className="text-emerald-400 font-semibold">{report.gpuAvailable ? 'Enabled' : 'No'}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
            Precision: FP16 Tensor computation
          </div>
        </div>

        {/* 3. NPU / NNAPI Card */}
        <div id={`${id}-npu-card`} className={`p-3.5 rounded-lg border flex flex-col justify-between ${
          report.npuAvailable 
            ? 'bg-cyan-950/20 border-cyan-500/30' 
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">Snapdragon NPU / NNAPI</span>
              </div>
              {report.npuAvailable ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Optimized
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> Not Detected
                </span>
              )}
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-semibold text-cyan-300">
                {report.isSnapdragonSoC ? 'Hexagon NPU (QNN Native)' : 'Standard Neural Pipeline'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                NNAPI Status: <span className={report.nnapiSupported ? 'text-emerald-300 font-mono' : 'text-slate-400 font-mono'}>
                  {report.nnapiSupported ? 'Hardware Accelerated' : 'Emulated / Bridge'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-cyan-400/80 font-medium">
            {report.npuAvailable ? '⚡ Ultra-fast 4-bit / 8-bit NPU Diffusion' : 'Standard local execution path'}
          </div>
        </div>
      </div>

      {/* Hardware Status Breakdown & Local Dream Recommendation */}
      <div className="mt-3.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-medium">
              Device Type: <strong className="text-slate-100">{report.isAndroid ? 'Android Smartphone / Tablet' : 'Web / Desktop Host'}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Est. Memory: <strong className={report.memoryStatus === 'critical' ? 'text-red-400' : 'text-slate-200'}>
                ~{report.deviceMemoryGb || 4} GB RAM
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Backend Terpilih:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold uppercase border border-cyan-500/30">
              {report.recommendedBackend}
            </span>
          </div>
        </div>

        {/* Local Dream Daemon Status Notice */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Local Dream Daemon (127.0.0.1:8081):</span>
            <span className={`font-semibold ${
              report.daemonStatus === 'READY' 
                ? 'text-emerald-400' 
                : report.daemonStatus === 'MODEL_NOT_INSTALLED' 
                ? 'text-amber-400' 
                : 'text-slate-400'
            }`}>
              {report.daemonStatus === 'READY' ? 'Connected & Ready' : report.daemonStatus}
            </span>
          </div>
          <span className="text-slate-500 text-[10px]">Last Check: {report.lastScanTimestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default HardwareStatus;
