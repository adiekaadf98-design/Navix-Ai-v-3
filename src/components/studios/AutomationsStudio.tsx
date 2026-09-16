import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Play, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Menu, 
  ArrowRight, 
  Zap,
  RotateCw,
  Bell,
  Send
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface AutomationsStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AutomationsStudio: React.FC<AutomationsStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [workflows, setWorkflows] = useState(() => {
    try {
      const saved = localStorage.getItem('navix_automations_workflows');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_automations_workflows', e);
    }
    return [
    {
      id: 'wf-1',
      title: 'Daily Market SMC Scanner & Telegram Dispatch',
      trigger: 'Setiap Hari 07:00 WIB (Cron: 0 0 * * *)',
      steps: [
        'Scan real-time market structure XAU/USD, BTC, EUR/USD',
        'Panggil Navix Market Analyst untuk identifikasi BOS & FVG',
        'Buat visual snapshot ringkasan setup probabilitas tinggi',
        'Kirim dispatch alert otomatis ke channel Telegram / Slack'
      ],
      active: true,
      lastRun: 'Hari ini, 07:00 WIB'
    },
    {
      id: 'wf-2',
      title: 'GitHub PR Security & Quality Automated Audit',
      trigger: 'Webhook: On Pull Request Opened',
      steps: [
        'Ambil git diff perubahan kode pada commit PR',
        'Audit potensi celah OWASP & CWE vulnerability',
        'Tuliskan komentar rekomendasi mitigasi di halaman PR'
      ],
      active: true,
      lastRun: 'Kemarin, 21:40 WIB'
    },
    {
      id: 'wf-3',
      title: 'Auto-Index Google Drive PDFs to Knowledge Base',
      trigger: 'Drive Event: Berkas Baru di Folder Research',
      steps: [
        'Ekstrak teks dan tabel dari file PDF via OCR engine',
        'Pecah konten menjadi 500-token chunks dengan 50-token overlap',
        'Kalkulasi embedding 768-dim dan simpan ke Vector DB'
      ],
      active: false,
      lastRun: '3 hari yang lalu'
    }
  ];
  });

  useEffect(() => {
    localStorage.setItem('navix_automations_workflows', JSON.stringify(workflows));
  }, [workflows]);

  const [runningWf, setRunningWf] = useState<string | null>(null);

  const toggleWf = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const next = !w.active;
        showToast(
          next ? `Workflow '${w.title}' diaktifkan!` : `Workflow '${w.title}' dimatikan`,
          next ? 'success' : 'info'
        );
        return { ...w, active: next };
      }
      return w;
    }));
  };

  const handleRunNow = async (id: string) => {
    setRunningWf(id);
    showToast('Memulai eksekusi pipeline workflow otomatis...', 'info');

    setTimeout(() => {
      setRunningWf(null);
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, lastRun: 'Baru saja' } : w));
      showToast('Seluruh tahapan workflow berhasil dieksekusi 100%!', 'success');
    }, 2500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07080b] text-neutral-200 overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <header className="h-16 px-4 md:px-6 border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all md:hidden cursor-pointer"
            title="Buka Menu"
          >
            <Menu size={20} />
          </button>
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <GitBranch size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Automasi & Workflows
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Otomatisasi multi-langkah: Trigger → Condition → Action → Alert
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const title = prompt('Nama workflow baru:');
            if (title) {
              const newWf = {
                id: `wf-${Date.now()}`,
                title,
                trigger: 'Manual Trigger & Scheduled Cron',
                steps: ['Jalankan analisis AI', 'Simpan hasil ke database', 'Kirim notifikasi'],
                active: true,
                lastRun: 'Belum pernah'
              };
              setWorkflows(prev => [newWf, ...prev]);
              showToast(`Workflow '${title}' berhasil dibuat!`, 'success');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-red-950/50"
        >
          <Plus size={14} />
          <span>Buat Workflow Baru</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 hover:border-neutral-700 transition shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-red-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{wf.title}</h2>
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-neutral-500" />
                    <span>Trigger: {wf.trigger}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {onSendToChat && (
                  <button
                    onClick={() => onSendToChat(`[Jalankan Otomatisasi]: Tolong bantu saya menjalankan atau menyesuaikan workflow "${wf.title}" ini.`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-blue-600/30 text-xs font-semibold text-blue-400 border border-neutral-800 transition cursor-pointer"
                    title="Kirim instruksi ini ke Chat Utama"
                  >
                    <Send size={13} />
                  </button>
                )}
                <button
                  onClick={() => toggleWf(wf.id)}
                  className="cursor-pointer"
                  title={wf.active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {wf.active ? (
                    <ToggleRight size={28} className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size={28} className="text-neutral-600" />
                  )}
                </button>
                <button
                  onClick={() => handleRunNow(wf.id)}
                  disabled={runningWf === wf.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-600/30 text-xs font-semibold text-neutral-200 border border-neutral-800 transition cursor-pointer"
                >
                  {runningWf === wf.id ? (
                    <>
                      <RotateCw size={13} className="animate-spin text-red-400" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} className="fill-current" />
                      <span>Run Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Workflow Sequential Steps */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                Pipeline Rantai Eksekusi:
              </span>
              <div className="space-y-1.5 pt-1">
                {wf.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-mono font-bold text-red-400 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
              <span>Status: {wf.active ? 'Siap Berjalan Otomatis' : 'Jeda (Paused)'}</span>
              <span>Terakhir dijalankan: {wf.lastRun}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
