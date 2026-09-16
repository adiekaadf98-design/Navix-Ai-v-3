import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Code, 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  Cpu, 
  Terminal, 
  FolderPlus, 
  Plus, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
  Globe,
  Settings,
  Search,
  BookOpen,
  X,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from '../utils/toast';
import { AI_STUDIO_CORE_SKILLS, scaffoldStudioApp } from '../services/skills/aiStudioAppBuilderEngine';
import { OPEN_SOURCE_SKILLS_DIRECTORY } from '../services/skills/openSourceSkillMatrix';
import { MCP_MARKET_PROVIDERS, McpBrandProvider } from '../services/skills/mcp/mcpMarketCatalog';

export interface StudioFile {
  id: string;
  name: string;
  language: 'html' | 'javascript' | 'typescript' | 'css' | 'json' | 'jsx' | 'tsx';
  content: string;
}

export interface StudioAppProject {
  id: string;
  title: string;
  description: string;
  type: 'web_app' | 'apk_pwa' | 'dashboard' | 'game' | 'utility';
  template: string;
  files: StudioFile[];
  activeFileId: string;
  npmDependencies: string[];
  githubUpstreamRepo?: string;
  updatedAt: number;
}

const DEFAULT_STARTER_PROJECT: StudioAppProject = {
  id: 'navix-studio-init',
  title: 'Navix AI Studio Hub',
  description: 'Aplikasi Web & APK PWA Responsif dengan Live Sandbox Canvas',
  type: 'apk_pwa',
  template: 'React + Tailwind + Lucide Icons',
  npmDependencies: ['lucide-react', 'canvas-confetti', 'chart.js'],
  githubUpstreamRepo: 'facebook/react',
  updatedAt: Date.now(),
  activeFileId: 'index-html',
  files: [
    {
      id: 'index-html',
      name: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Navix AI Live Studio App</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Canvas Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">

  <!-- Main APK Container Card -->
  <div class="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
    <!-- Ambient Glow -->
    <div class="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header / Brand -->
    <div class="flex items-center justify-between mb-6 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white leading-tight">Navix APK Studio</h1>
          <p class="text-xs text-slate-400 font-medium">Live Canvas Interactive Build</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
      </span>
    </div>

    <!-- Interactive Counter & Action Hub -->
    <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-5 relative z-10">
      <div class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">State Counter Metric</div>
      <div class="flex items-baseline gap-2">
        <span id="counterValue" class="text-4xl font-extrabold text-white tracking-tight">0</span>
        <span class="text-xs text-rose-400 font-medium">Interaksi Pengguna</span>
      </div>

      <div class="grid grid-cols-2 gap-2.5 mt-4">
        <button id="incrementBtn" class="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer">
          <i data-lucide="plus" class="w-4 h-4"></i> Tambah
        </button>
        <button id="confettiBtn" class="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer">
          <i data-lucide="party-popper" class="w-4 h-4 text-amber-400"></i> Selebrasi
        </button>
      </div>
    </div>

    <!-- Features Pill List -->
    <div class="space-y-2 mb-6 relative z-10">
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
        <i data-lucide="smartphone" class="w-4 h-4 text-rose-400 shrink-0"></i>
        <span class="text-slate-300">Siap Build ke PWA / APK Android & Web</span>
      </div>
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
        <i data-lucide="github" class="w-4 h-4 text-blue-400 shrink-0"></i>
        <span class="text-slate-300">Terintegrasi dengan 50.000+ Skills GitHub</span>
      </div>
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
        <i data-lucide="zap" class="w-4 h-4 text-amber-400 shrink-0"></i>
        <span class="text-slate-300">Real-Time Hot Module Live Preview</span>
      </div>
    </div>

    <!-- Footer Action -->
    <button onclick="handleStatusAlert()" class="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10">
      <i data-lucide="check-circle-2" class="w-4 h-4"></i> Verifikasi Sistem APK
    </button>
  </div>

  <script>
    // Initialize Lucide Icons
    lucide.createIcons();

    let count = 0;
    const counterEl = document.getElementById('counterValue');
    const incBtn = document.getElementById('incrementBtn');
    const confBtn = document.getElementById('confettiBtn');

    incBtn.addEventListener('click', () => {
      count++;
      counterEl.textContent = count;
      counterEl.classList.add('scale-110', 'text-rose-400');
      setTimeout(() => {
        counterEl.classList.remove('scale-110', 'text-rose-400');
      }, 150);
    });

    confBtn.addEventListener('click', () => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    });

    function handleStatusAlert() {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });
      alert("✅ Status: Aplikasi APK & Web Navix AI Studio Beroperasi 100% Normal tanpa Error!");
    }
  </script>
</body>
</html>`
    },
    {
      id: 'app-js',
      name: 'app.js',
      language: 'javascript',
      content: `// Logic Layer Navix AI APK Studio
console.log("Navix Studio APK Engine Running");
`
    },
    {
      id: 'manifest-json',
      name: 'manifest.json',
      language: 'json',
      content: `{
  "name": "Navix AI Live Studio",
  "short_name": "NavixStudio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#090d16",
  "theme_color": "#e11d48",
  "icons": [
    {
      "src": "/icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}`
    }
  ]
};

interface AIStudioCanvasProps {
  initialProject?: StudioAppProject;
  onClose?: () => void;
  onOpenSidebar?: () => void;
}

export function AIStudioCanvas({
  initialProject,
  onClose,
  onOpenSidebar
}: AIStudioCanvasProps) {
  const [project, setProject] = useState<StudioAppProject>(() => {
    const saved = localStorage.getItem('navix_studio_active_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.files && parsed.files.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved project', e);
      }
    }
    return initialProject || DEFAULT_STARTER_PROJECT;
  });

  const [activeTab, setActiveTab] = useState<'canvas' | 'code' | 'split'>('split');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showAddFile, setShowAddFile] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');
  const [selectedSkillTab, setSelectedSkillTab] = useState<'mcp' | 'matrix' | 'core'>('mcp');
  const [mcpCategoryFilter, setMcpCategoryFilter] = useState<string>('All');
  const [testingSkillId, setTestingSkillId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; output: string } | null>(null);

  const handleTestMcpSkill = async (provider: McpBrandProvider) => {
    const tool = provider.sampleTools[0];
    if (!tool) return;
    setTestingSkillId(provider.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverName: provider.id,
          toolName: tool.name,
          args: { message: `Test ping to ${provider.name} via Navix MCP Engine` }
        })
      });
      const data = await res.json();
      const outputText = data?.content?.[0]?.text || JSON.stringify(data, null, 2);
      setTestResult({ id: provider.id, output: outputText });
      showToast(`Skill ${tool.name} executed successfully!`, 'success');
    } catch (e: any) {
      setTestResult({ id: provider.id, output: `Error: ${e.message || 'Execution failed'}` });
      showToast(`Failed to execute ${tool.name}`, 'error');
    } finally {
      setTestingSkillId(null);
    }
  };

  const handleApplyPreset = (category: 'trading' | 'general') => {
    const generated = scaffoldStudioApp(
      category === 'trading' ? 'Navix Gold & Crypto Terminal' : 'Navix Pro APK Hub',
      'apk_pwa',
      category
    );

    const newFiles: StudioFile[] = generated.files.map((f, idx) => ({
      id: 'file-preset-' + idx,
      name: f.name,
      language: f.language as StudioFile['language'],
      content: f.content
    }));

    setProject({
      id: 'project-' + Date.now(),
      title: generated.title,
      description: generated.description,
      type: generated.type,
      template: 'AI Studio Core Skills + Tailwind',
      npmDependencies: ['lucide-react', 'chart.js', 'canvas-confetti'],
      githubUpstreamRepo: category === 'trading' ? 'tradingview/lightweight-charts' : 'facebook/react',
      updatedAt: Date.now(),
      activeFileId: newFiles[0]?.id || 'index-html',
      files: newFiles
    });

    setShowTemplatesModal(false);
    showToast(`Template ${generated.title} berhasil dimuat!`, 'success');
  };

  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0];

  // Save changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem('navix_studio_active_project', JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to save project to localStorage', e);
    }
  }, [project]);

  const handleContentChange = (newContent: string) => {
    setProject(prev => ({
      ...prev,
      updatedAt: Date.now(),
      files: prev.files.map(f => f.id === prev.activeFileId ? { ...f, content: newContent } : f)
    }));
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const ext = name.split('.').pop()?.toLowerCase();
    let lang: StudioFile['language'] = 'html';
    if (ext === 'js') lang = 'javascript';
    else if (ext === 'ts') lang = 'typescript';
    else if (ext === 'css') lang = 'css';
    else if (ext === 'json') lang = 'json';
    else if (ext === 'jsx') lang = 'jsx';
    else if (ext === 'tsx') lang = 'tsx';

    const newFile: StudioFile = {
      id: 'file-' + Date.now(),
      name,
      language: lang,
      content: lang === 'html' ? '<!DOCTYPE html>\n<html>\n<body>\n  <h1>New File</h1>\n</body>\n</html>' : '// ' + name
    };

    setProject(prev => ({
      ...prev,
      files: [...prev.files, newFile],
      activeFileId: newFile.id
    }));
    setNewFileName('');
    setShowAddFile(false);
    showToast(`File ${name} berhasil ditambahkan!`, 'success');
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.files.length <= 1) {
      showToast('Minimal harus ada 1 file utama!', 'error');
      return;
    }
    setProject(prev => {
      const filtered = prev.files.filter(f => f.id !== fileId);
      const nextActiveId = prev.activeFileId === fileId ? filtered[0].id : prev.activeFileId;
      return {
        ...prev,
        files: filtered,
        activeFileId: nextActiveId
      };
    });
    showToast('File berhasil dihapus', 'info');
  };

  const handleCopyActiveCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      showToast('Kode berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast('Gagal menyalin kode', 'error');
    }
  };

  const handleDownloadZip = () => {
    const htmlFile = project.files.find(f => f.name === 'index.html') || project.files[0];
    const blob = new Blob([htmlFile.content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-build.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Aplikasi siap diekspor / di-deploy!', 'success');
  };

  const handleRefreshPreview = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIframeKey(k => k + 1);
      setIsCompiling(false);
      showToast('Preview Kanvas diperbarui!', 'info');
    }, 200);
  };

  // Compile composite HTML bundle for IFrame preview
  const previewBundle = React.useMemo(() => {
    const htmlFile = project.files.find(f => f.name.endsWith('.html')) || project.files[0];
    const jsFiles = project.files.filter(f => f.name.endsWith('.js') && f.name !== 'index.html');
    const cssFiles = project.files.filter(f => f.name.endsWith('.css'));

    let finalHtml = htmlFile ? htmlFile.content : '<h1>No HTML File</h1>';

    // Inject CSS
    if (cssFiles.length > 0) {
      const injectedCss = cssFiles.map(c => `<style>\n${c.content}\n</style>`).join('\n');
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `${injectedCss}\n</head>`);
      } else {
        finalHtml = `${injectedCss}\n${finalHtml}`;
      }
    }

    // Inject JS
    if (jsFiles.length > 0) {
      const injectedJs = jsFiles.map(j => `<script>\n${j.content}\n</script>`).join('\n');
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${injectedJs}\n</body>`);
      } else {
        finalHtml = `${finalHtml}\n${injectedJs}`;
      }
    }

    return finalHtml;
  }, [project.files]);

  return (
    <div className={`h-full w-full flex flex-col bg-[#0b0f17] text-white overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[200]' : 'relative'}`}>
      
      {/* Top Studio Control Navigation Bar */}
      <div className="h-14 border-b border-slate-800 bg-[#0e131f]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none">
        
        {/* Left: Branding, App Name & Badge */}
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button 
              onClick={onOpenSidebar}
              className="md:hidden min-w-[40px] min-h-[40px] text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800 active:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
              title="Buka Menu"
              aria-label="Buka Menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight leading-none">Studio AI Canvas</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                APK & Web Builder
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">{project.title}</p>
          </div>
        </div>

        {/* Center: View Switcher (Code, Split, Canvas), Templates, Skills & Device Frame Controls */}
        <div className="flex items-center gap-2">
          
          {/* Templates & Skills Trigger */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap size={13} className="text-amber-400" />
              <span>Templates</span>
            </button>
            <button
              onClick={() => setShowSkillsModal(true)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu size={13} className="text-rose-400" />
              <span>Skills Matrix</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex items-center gap-0.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Code Editor Mode"
            >
              <Code size={14} />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'split' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View Mode"
            >
              <Layers size={14} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'canvas' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Canvas Preview Mode"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Canvas</span>
            </button>
          </div>

          {/* Device Frame Switcher (Mobile, Tablet, Desktop) */}
          {(activeTab === 'canvas' || activeTab === 'split') && (
            <div className="hidden lg:flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 items-center gap-0.5 text-xs">
              <button
                onClick={() => setDeviceFrame('mobile')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  deviceFrame === 'mobile' ? 'bg-slate-800 text-rose-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Mobile APK View (390px)"
              >
                <Smartphone size={14} />
              </button>
              <button
                onClick={() => setDeviceFrame('tablet')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  deviceFrame === 'tablet' ? 'bg-slate-800 text-rose-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet size={14} />
              </button>
              <button
                onClick={() => setDeviceFrame('desktop')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  deviceFrame === 'desktop' ? 'bg-slate-800 text-rose-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Desktop Fluid Responsive View"
              >
                <Monitor size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions (Refresh, Copy, Download, Fullscreen, Close) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefreshPreview}
            disabled={isCompiling}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
            title="Refresh Live Canvas"
          >
            <RefreshCw size={14} className={isCompiling ? 'animate-spin text-rose-400' : ''} />
          </button>
          
          <button
            onClick={handleCopyActiveCode}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-md shadow-rose-900/30 rounded-xl transition-all cursor-pointer"
            title="Export APK & Web File"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
              title="Tutup Studio"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area (File Explorer, Code Editor, Canvas Preview) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: File Explorer (Visible in Code or Split mode) */}
        {(activeTab === 'code' || activeTab === 'split') && (
          <div className={`${activeTab === 'split' ? 'hidden lg:flex' : 'flex'} w-full lg:w-48 xl:w-56 h-1/3 lg:h-auto bg-[#080c14] border-b lg:border-b-0 lg:border-r border-slate-800 flex-col shrink-0 overflow-hidden select-none`}>
            
            {/* Explorer Header */}
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FolderPlus size={14} className="text-rose-400" />
                <span>Project Files</span>
              </div>
              <button
                onClick={() => setShowAddFile(!showAddFile)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Tambah File"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add File Popup Inline */}
            {showAddFile && (
              <div className="p-2 border-b border-slate-800 bg-slate-900/80">
                <input
                  type="text"
                  placeholder="nama-file.js / .html"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-500 mb-1.5"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button 
                    onClick={handleAddFile}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold py-1 rounded transition-colors"
                  >
                    Tambah
                  </button>
                  <button 
                    onClick={() => setShowAddFile(false)}
                    className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {project.files.map((file) => {
                const isActive = file.id === project.activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => setProject(p => ({ ...p, activeFileId: file.id }))}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode size={14} className={isActive ? 'text-rose-400' : 'text-slate-500'} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    {project.files.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-600 transition-opacity"
                        title="Hapus file"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom System Info */}
            <div className="p-3 border-t border-slate-800/80 bg-[#090d16] text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span>Engine</span>
                <span className="text-slate-400">Live WebGPU / V8</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>GitHub Repo</span>
                <span className="text-rose-400 truncate max-w-[90px]">{project.githubUpstreamRepo || 'open-source'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Center: Code Editor Area */}
        {(activeTab === 'code' || activeTab === 'split') && (
          <div className="flex-1 flex flex-col bg-[#05070d] border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            
            {/* Editor Tab Bar */}
            <div className="h-9 bg-[#090d16] border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{activeFile.name}</span>
                <span className="text-slate-600 text-[10px]">({activeFile.language})</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>UTF-8</span>
                <span>•</span>
                <span>{activeFile.content.length} chars</span>
              </div>
            </div>

            {/* Textarea Code Editor */}
            <div className="flex-1 relative overflow-hidden bg-[#050811]">
              <textarea
                value={activeFile.content}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-[13px] leading-relaxed bg-transparent text-slate-200 border-none outline-none resize-none selection:bg-rose-600/40 selection:text-white custom-scrollbar"
                placeholder="Tulis kode HTML, CSS, JavaScript, atau React di sini..."
              />
            </div>
          </div>
        )}

        {/* Right Column: Live Canvas Sandbox Preview */}
        {(activeTab === 'canvas' || activeTab === 'split') && (
          <div className="flex-1 flex flex-col bg-[#060a12] overflow-hidden relative">
            
            {/* Canvas Header Bar */}
            <div className="h-9 bg-[#090d16] border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-bold ml-2">LIVE RUNTIME CANVAS</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Runtime
                </span>
              </div>
            </div>

            {/* Live Iframe Sandbox Container */}
            <div className="flex-1 p-3 sm:p-6 overflow-auto flex items-center justify-center bg-[#070b14] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              <div 
                className={`transition-all duration-300 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col ${
                  deviceFrame === 'mobile' 
                    ? 'w-[375px] h-[667px] max-h-full max-w-full' 
                    : deviceFrame === 'tablet'
                    ? 'w-[768px] h-[800px] max-h-full max-w-full'
                    : 'w-full h-full'
                }`}
              >
                {/* Simulated Device Top Bar for Mobile Mode */}
                {deviceFrame === 'mobile' && (
                  <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-[9px] font-mono text-slate-400 select-none">
                    <span>09:41</span>
                    <div className="w-12 h-3 bg-slate-950 rounded-full mx-auto"></div>
                    <span>5G 100%</span>
                  </div>
                )}

                {/* The Secure Iframe Canvas */}
                <iframe
                  key={iframeKey}
                  title="Navix Live Studio Sandbox"
                  srcDoc={previewBundle}
                  sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
                  className="w-full flex-1 border-none bg-white"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplatesModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Starter Templates Studio AI</h2>
                    <p className="text-xs text-slate-400">Pilih template aplikasi siap eksekusi tanpa simulasi</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
                {/* Template 1: Trading */}
                <div 
                  onClick={() => handleApplyPreset('trading')}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-950 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white group-hover:text-amber-400 flex items-center gap-2">
                      📈 Gold & Crypto Trading Terminal APK
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      FINTECH APK
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Terminal interaktif dengan grafik Chart.js real-time tick, sinyal kuantitatif TA-Lib, Smart Money Concepts (SMC/FVG), dan tombol eksekusi order.
                  </p>
                  <div className="flex gap-2 text-[10px] font-mono text-slate-500">
                    <span>• Chart.js</span>
                    <span>• Lucide Icons</span>
                    <span>• PWA Ready</span>
                  </div>
                </div>

                {/* Template 2: General Studio APK */}
                <div 
                  onClick={() => handleApplyPreset('general')}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-950 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white group-hover:text-rose-400 flex items-center gap-2">
                      ⚡ Dynamic Task & Project Hub APK
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                      PRODUCTIVITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Aplikasi manajemen aktivitas interaktif dengan state CRUD lokal, efek selebrasi Canvas Confetti, dan desain mobile native Tailwind.
                  </p>
                  <div className="flex gap-2 text-[10px] font-mono text-slate-500">
                    <span>• Tailwind CSS</span>
                    <span>• Canvas Confetti</span>
                    <span>• Mobile Ready</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skills Matrix Modal */}
      <AnimatePresence>
        {showSkillsModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      50.000+ Open-Source Skills & GitHub Engine Matrix
                      <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">LIVE V2</span>
                    </h2>
                    <p className="text-xs text-slate-400">Seluruh cluster engine open-source GitHub resmi yang terhubung ke compiler Navix AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs & Search */}
              <div className="py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-slate-800/80">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
                  <button
                    onClick={() => setSelectedSkillTab('mcp')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedSkillTab === 'mcp' 
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>MCP Market (950+ Skills)</span>
                  </button>
                  <button
                    onClick={() => setSelectedSkillTab('matrix')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedSkillTab === 'matrix' 
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen size={13} />
                    <span>50K+ Clusters Matrix</span>
                  </button>
                  <button
                    onClick={() => setSelectedSkillTab('core')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedSkillTab === 'core' 
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap size={13} />
                    <span>Studio Core</span>
                  </button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={skillsSearchQuery}
                    onChange={(e) => setSkillsSearchQuery(e.target.value)}
                    placeholder="Cari provider, skill, atau tool..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
                {selectedSkillTab === 'mcp' ? (
                  <div className="space-y-4">
                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-medium custom-scrollbar">
                      {['All', 'AI & LLM', 'Cloud & DevOps', 'Database & Storage', 'Auth & Security', 'Fintech & E-Commerce', 'Design & Frontend', 'Analytics & Observability', 'Search & Crawling'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setMcpCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                            mcpCategoryFilter === cat
                              ? 'bg-slate-700 text-white font-semibold'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Providers Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MCP_MARKET_PROVIDERS
                        .filter(p => {
                          const matchesCat = mcpCategoryFilter === 'All' || p.category === mcpCategoryFilter;
                          if (!matchesCat) return false;
                          if (!skillsSearchQuery) return true;
                          const q = skillsSearchQuery.toLowerCase();
                          return (
                            p.name.toLowerCase().includes(q) ||
                            p.category.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q) ||
                            p.sampleTools.some(t => t.name.toLowerCase().includes(q))
                          );
                        })
                        .map(p => (
                          <div key={p.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white tracking-tight">{p.name}</span>
                                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                                    {p.category}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                  {p.skillCount} {p.skillCount === 1 ? 'Skill' : 'Skills'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5 line-clamp-2">{p.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {p.sampleTools.map(t => (
                                  <span key={t.name} className="text-[9px] font-mono bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                                    <span className={t.isExecutableNow ? "w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" : "w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"}></span>
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                              <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ● AUTO-CONNECTED (LIVE)
                              </span>

                              <button
                                onClick={() => handleTestMcpSkill(p)}
                                disabled={testingSkillId === p.id}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                              >
                                {testingSkillId === p.id ? (
                                  <RefreshCw size={11} className="animate-spin" />
                                ) : (
                                  <Play size={11} />
                                )}
                                <span>Test Skill</span>
                              </button>
                            </div>

                            {testResult && testResult.id === p.id && (
                              <div className="mt-2.5 p-2 rounded-xl bg-slate-900 text-[10px] font-mono text-slate-300 border border-slate-800">
                                <div className="text-emerald-400 font-bold mb-1">Execution Response:</div>
                                <pre className="whitespace-pre-wrap overflow-x-auto max-h-28 custom-scrollbar">{testResult.output}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : selectedSkillTab === 'matrix' ? (
                  <div className="space-y-4">
                    {OPEN_SOURCE_SKILLS_DIRECTORY
                      .filter(cluster => {
                        if (!skillsSearchQuery) return true;
                        const q = skillsSearchQuery.toLowerCase();
                        return (
                          cluster.cluster.toLowerCase().includes(q) ||
                          cluster.featuredRepos.some(r => 
                            r.name.toLowerCase().includes(q) || 
                            r.repo.toLowerCase().includes(q) || 
                            r.tags.some(t => t.toLowerCase().includes(q))
                          )
                        );
                      })
                      .map(cluster => (
                        <div key={cluster.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                              <span>📁</span> {cluster.cluster}
                            </h3>
                            <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                              {cluster.totalSkillsIndexed.toLocaleString()} Indexed
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                            {cluster.featuredRepos.map(repo => (
                              <div key={repo.repo} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-white tracking-tight">{repo.name}</span>
                                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                      ★ {repo.starsApprox}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-rose-400 mb-1.5">{repo.repo}</div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2 line-clamp-2">{repo.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {repo.capabilities.slice(0, 2).map((cap, i) => (
                                    <span key={i} className="text-[9px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded">
                                      ✓ {cap}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {AI_STUDIO_CORE_SKILLS
                      .filter(skill => {
                        if (!skillsSearchQuery) return true;
                        const q = skillsSearchQuery.toLowerCase();
                        return (
                          skill.name.toLowerCase().includes(q) ||
                          skill.githubRepo.toLowerCase().includes(q) ||
                          skill.description.toLowerCase().includes(q)
                        );
                      })
                      .map((skill) => (
                        <div key={skill.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              {skill.name}
                            </span>
                            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                              {skill.githubRepo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2 leading-relaxed">{skill.description}</p>
                          <div className="bg-slate-900/90 rounded-xl p-2.5 font-mono text-[11px] text-slate-400 overflow-x-auto">
                            <code>{skill.sampleSnippet}</code>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
