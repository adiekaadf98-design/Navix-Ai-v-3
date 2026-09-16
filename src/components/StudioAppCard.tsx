import React, { useState } from 'react';
import { 
  Play, 
  Code2, 
  Eye, 
  Maximize2, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from '../utils/toast';

export interface StudioAppBlockData {
  title: string;
  type: 'apk' | 'web' | 'dashboard' | 'game';
  description?: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  code?: string;
  dependencies?: string[];
  githubRepo?: string;
}

interface StudioAppCardProps {
  data: StudioAppBlockData;
  onOpenFullCanvas?: (appData: StudioAppBlockData) => void;
}

export function StudioAppCard({ data, onOpenFullCanvas }: StudioAppCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [reloadKey, setReloadKey] = useState(0);

  const rawHtml = data.htmlCode || data.code || `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-900 text-white p-6 flex flex-col items-center justify-center min-h-screen">
  <div class="text-center space-y-4">
    <div class="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center mx-auto shadow-lg">
      <i data-lucide="sparkles" class="w-6 h-6"></i>
    </div>
    <h1 class="text-xl font-bold">${data.title}</h1>
    <p class="text-xs text-slate-400">${data.description || 'Aplikasi Live Canvas Navix AI Studio'}</p>
    <button class="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/30">
      Mulai Interaksi
    </button>
  </div>
  <script>lucide.createIcons();</script>
</body>
</html>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawHtml);
      setCopied(true);
      showToast('Source Code berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast('Gagal menyalin kode', 'error');
    }
  };

  return (
    <div className="w-full my-4 rounded-2xl border border-slate-800 bg-[#0d121f]/90 overflow-hidden shadow-2xl backdrop-blur-md">
      
      {/* Top Card Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-[#0e1626] to-slate-900 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-tight">{data.title}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                {data.type.toUpperCase()} BUILD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">{data.description || 'Studio Canvas Live Sandbox'}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Code */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showCode 
                ? 'bg-slate-800 text-rose-400 border-rose-500/30' 
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Code2 size={14} />
            <span className="hidden sm:inline">Source Code</span>
          </button>

          {/* Toggle Live Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              showPreview
                ? 'bg-rose-600 text-white shadow-rose-900/40 hover:bg-rose-500'
                : 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white hover:from-rose-500 hover:to-indigo-500'
            }`}
          >
            {showPreview ? <Eye size={14} /> : <Play size={14} />}
            <span>{showPreview ? 'Tutup Preview' : 'PREVIEW LIVE'}</span>
          </button>

          {/* Open in Dedicated Studio Canvas */}
          <button
            onClick={() => {
              if (onOpenFullCanvas) {
                onOpenFullCanvas(data);
              } else {
                const projectData = {
                  id: 'project-from-chat-' + Date.now(),
                  title: data.title,
                  description: data.description || 'Aplikasi Live Studio',
                  type: data.type === 'apk' ? 'apk_pwa' : 'web_app',
                  template: 'Studio AI Native',
                  npmDependencies: ['lucide-react', 'canvas-confetti'],
                  githubUpstreamRepo: data.githubRepo || 'facebook/react',
                  updatedAt: Date.now(),
                  activeFileId: 'index-html',
                  files: [
                    {
                      id: 'index-html',
                      name: 'index.html',
                      language: 'html',
                      content: rawHtml
                    }
                  ]
                };
                localStorage.setItem('navix_studio_active_project', JSON.stringify(projectData));
                window.dispatchEvent(new CustomEvent('open_studio_canvas'));
                showToast(`Membuka ${data.title} di Studio Canvas...`, 'info');
              }
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-all cursor-pointer"
            title="Buka di Full Studio Canvas"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Code Inspector Collapsible */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-800 bg-[#050811] overflow-hidden"
          >
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-rose-400" />
                <span>index.html (Tailwind + Standar Open Source)</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-60 custom-scrollbar leading-relaxed">
              <code>{rawHtml}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Interactive Preview Canvas */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 bg-[#080d1a] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Preview Toolbar */}
            <div className="w-full max-w-xl flex items-center justify-between mb-3 px-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    deviceMode === 'mobile' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Mobile APK (375px)</span>
                </button>
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    deviceMode === 'desktop' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor size={13} />
                  <span>Desktop Web</span>
                </button>
              </div>

              <button
                onClick={() => setReloadKey(k => k + 1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="Reload Canvas"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Sandbox IFrame */}
            <div 
              className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 ${
                deviceMode === 'mobile' ? 'w-[375px] h-[580px] max-w-full' : 'w-full max-w-3xl h-[520px]'
              }`}
            >
              {deviceMode === 'mobile' && (
                <div className="h-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 text-[8px] font-mono text-slate-500 select-none">
                  <span>09:41</span>
                  <div className="w-10 h-2 bg-slate-950 rounded-full mx-auto"></div>
                  <span>100%</span>
                </div>
              )}
              <iframe
                key={reloadKey}
                title="Navix AI Sandbox Card Preview"
                srcDoc={rawHtml}
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
                className="w-full h-full border-none bg-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
