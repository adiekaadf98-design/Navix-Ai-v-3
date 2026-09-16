import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Activity, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { ShadowEngineClient } from '../services/ShadowEngineClient';

export interface ShadowEngineData {
  job_id: string;
  pipeline: string;
}

interface Props {
  data: ShadowEngineData;
}

export const ShadowEngineCard: React.FC<Props> = ({ data }) => {
  const [status, setStatus] = useState<any>({
    status: 'QUEUED',
    progress: 0,
    current_stage: 'Waiting in queue',
    model: 'Initializing...'
  });
  const [telemetry, setTelemetry] = useState<any>({});
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/v1/telemetry');
        if (res.ok && active) {
          setTelemetry(await res.json());
        }
      } catch (e) {}
    };

    const telemetryInterval = setInterval(fetchTelemetry, 2000);
    fetchTelemetry();

    ShadowEngineClient.pollJobStatus(data.job_id, (updates) => {
      if (active) {
        setStatus(updates);
      }
    }).then((final) => {
      if (active) {
        setStatus(final);
        if (final.output_url) setOutput(final.output_url);
      }
    }).catch((err) => {
      if (active) {
        setStatus(prev => ({ ...prev, status: prev.status === 'QUEUED' || prev.status === 'PROCESSING' ? 'FAILED' : prev.status, error: err.message || err }));
      }
    }).finally(() => {
      clearInterval(telemetryInterval);
    });

    return () => {
      active = false;
      clearInterval(telemetryInterval);
    };
  }, [data.job_id]);

  const getStatusColor = () => {
    switch(status.status) {
      case 'QUEUED': return 'text-slate-400';
      case 'PROCESSING': return 'text-amber-500';
      case 'COMPLETED': return 'text-emerald-500';
      case 'FAILED':
      case 'QUOTA_EXCEEDED':
      case 'PAID_SERVICE_REQUIRED':
      case 'MODEL_NOT_AVAILABLE':
      case 'TIMEOUT':
      case 'CANCELLED': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 overflow-hidden relative shadow-lg my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 ${status.status === 'PROCESSING' ? 'animate-pulse' : ''}`}>
             <Cpu className={`w-4 h-4 ${getStatusColor()}`} />
          </div>
          <div>
            <h4 className="text-slate-200 font-bold tracking-tight uppercase text-sm">Shadow Engine</h4>
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2 mt-1">
              <span>{data.pipeline}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span>{data.job_id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${getStatusColor()}`}>
              {status.status}
            </span>
            {status.status === 'PROCESSING' && <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />}
            {status.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {['FAILED', 'QUOTA_EXCEEDED', 'PAID_SERVICE_REQUIRED', 'MODEL_NOT_AVAILABLE', 'TIMEOUT', 'CANCELLED'].includes(status.status) && <XCircle className="w-4 h-4 text-rose-500" />}
        </div>
      </div>

      {/* Main Content */}
      {!output ? (
        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-400">
              <span>{status.current_stage || 'Initializing...'}</span>
              <span>{status.progress || 0}%</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${['FAILED', 'QUOTA_EXCEEDED', 'PAID_SERVICE_REQUIRED', 'MODEL_NOT_AVAILABLE', 'TIMEOUT', 'CANCELLED'].includes(status.status) ? 'bg-rose-500' : 'bg-amber-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${status.progress || 0}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Error Message */}
          {['FAILED', 'QUOTA_EXCEEDED', 'PAID_SERVICE_REQUIRED', 'MODEL_NOT_AVAILABLE', 'TIMEOUT', 'CANCELLED'].includes(status.status) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 text-rose-400 text-xs">
               <AlertCircle className="w-4 h-4 shrink-0" />
               <p>{typeof status.error === "object" ? status.error.message : status.error}</p>
            </div>
          )}

          {/* Telemetry Footer */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800">
             <div className="p-2 bg-slate-900 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> GPU Load</div>
                <div className="text-xs font-mono text-slate-300">{telemetry.gpu_utilization || 'N/A'}</div>
             </div>
             <div className="p-2 bg-slate-900 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Latency</div>
                <div className="text-xs font-mono text-slate-300">{telemetry.avg_latency_ms ? telemetry.avg_latency_ms + 'ms' : 'N/A'}</div>
             </div>
             <div className="p-2 bg-slate-900 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Model</div>
                <div className="text-xs font-mono text-slate-300 truncate">{status.model || 'Loading'}</div>
             </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 relative group">
           {/* Assume Image for now, logic can be expanded */}
           {data.pipeline.includes('VIDEO') ? (
               <video src={output} controls className="w-full h-auto max-h-[400px] object-cover" autoPlay loop muted />
           ) : (
               <img src={output} alt="Generated result" className="w-full h-auto max-h-[400px] object-cover" />
           )}
           <div className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest flex items-center gap-1">
                 <CheckCircle2 className="w-3 h-3"/> Rendered by {status.model}
              </span>
           </div>
        </div>
      )}
    </div>
  );
};
