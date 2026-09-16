import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  ShieldCheck, 
  Search, 
  Menu, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Layers,
  Database,
  Cloud,
  FileSpreadsheet,
  Mail,
  Calendar,
  Video,
  GitBranch,
  Terminal,
  TrendingUp,
  MessageSquare,
  Send
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface AppConnectorsStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface ConnectorItem {
  id: string;
  name: string;
  handle: string;
  description: string;
  category: 'google' | 'microsoft' | 'dev' | 'pm' | 'crm' | 'database';
  provider: string;
  permissions: string[];
  connected: boolean;
}

export const AppConnectorsStudio: React.FC<AppConnectorsStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const initialConnectors: ConnectorItem[] = [
    {
      id: 'g-drive',
      name: 'Google Drive',
      handle: '@GoogleDrive',
      description: 'Mencari, membaca, mengunggah, dan mengorganisir dokumen serta berkas di Google Drive.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'g-sheets',
      name: 'Google Sheets',
      handle: '@GoogleSheets',
      description: 'Membaca spreadsheet, mengisi tabel kuantitatif, dan melakukan analisis data.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'g-slides',
      name: 'Google Slides',
      handle: '@GoogleSlides',
      description: 'Akses presentasi slide dan materi visual Google Slides.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read'],
      connected: true
    },
    {
      id: 'g-mail',
      name: 'Gmail',
      handle: '@Gmail',
      description: 'Mencari email penting, merangkum pesan masuk, dan membuat draf atau balasan.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'g-cal',
      name: 'Google Calendar',
      handle: '@GoogleCalendar',
      description: 'Mencari jadwal acara, memasang pengingat, dan menjadwalkan agenda meeting.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'g-meet',
      name: 'Google Meet',
      handle: '@GoogleMeet',
      description: 'Informasi konferensi video, tautan rapat, dan transkrip rapat.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read'],
      connected: true
    },
    {
      id: 'g-bigquery',
      name: 'Google BigQuery',
      handle: '@BigQuery',
      description: 'Query analitik skala besar di Google Cloud BigQuery.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read', 'Write', 'Execute'],
      connected: true
    },
    {
      id: 'g-contacts',
      name: 'Google Contacts',
      handle: '@GoogleContacts',
      description: 'Pencarian kontak dan direktori telepon/email Google.',
      category: 'google',
      provider: 'Google',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'ms-teams',
      name: 'Microsoft Teams',
      handle: '@MSTeams',
      description: 'Akses percakapan tim, channel, dan konteks kolaborasi Microsoft Teams.',
      category: 'microsoft',
      provider: 'Microsoft',
      permissions: ['Search', 'Read'],
      connected: true
    },
    {
      id: 'ms-outlook',
      name: 'Outlook Email',
      handle: '@Outlook',
      description: 'Pencarian email Outlook, balasan pesan, dan ringkasan email.',
      category: 'microsoft',
      provider: 'Microsoft',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'ms-calendar',
      name: 'Outlook Calendar',
      handle: '@OutlookCalendar',
      description: 'Akses agenda meeting dan kalender acara Outlook.',
      category: 'microsoft',
      provider: 'Microsoft',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'ms-todo',
      name: 'Microsoft To Do',
      handle: '@MSToDo',
      description: 'Daftar tugas harian dan pengingat Microsoft To Do.',
      category: 'microsoft',
      provider: 'Microsoft',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'azure-devops',
      name: 'Azure DevOps',
      handle: '@AzureDevOps',
      description: 'Repositori kode, pipeline CI/CD, dan work items Azure DevOps.',
      category: 'microsoft',
      provider: 'Microsoft',
      permissions: ['Search', 'Read', 'Write', 'Execute'],
      connected: true
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: '@GitHub',
      description: 'Akses kode repositori Bitbucket dan Pull Request, commit, dan issue.',
      category: 'dev',
      provider: 'GitHub',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      handle: '@GitLab',
      description: 'Integrasi repositori GitLab, MR, dan pelacak issue.',
      category: 'dev',
      provider: 'GitLab',
      permissions: ['Search', 'Read', 'Write', 'Execute'],
      connected: true
    },
    {
      id: 'jira',
      name: 'Jira Software',
      handle: '@Jira',
      description: 'Manajemen tiket, project backlog, bug tracking, dan status sprint Jira.',
      category: 'pm',
      provider: 'Atlassian',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'linear',
      name: 'Linear',
      handle: '@Linear',
      description: 'Manajemen isu dan proyek software modern Linear.',
      category: 'pm',
      provider: 'Linear App',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'notion',
      name: 'Notion',
      handle: '@Notion',
      description: 'Pencarian basis pengetahuan SOP, catatan internal, dan basis data Notion.',
      category: 'pm',
      provider: 'Notion Labs',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      handle: '@HubSpot',
      description: 'Manajemen kontak pelanggan, deal pipeline, dan riwayat aktivitas bisnis.',
      category: 'crm',
      provider: 'HubSpot',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'slack',
      name: 'Slack',
      handle: '@Slack',
      description: 'Pencarian riwayat pesan channel Slack dan pengiriman alert notifikasi.',
      category: 'crm',
      provider: 'Slack',
      permissions: ['Search', 'Read', 'Write'],
      connected: true
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      handle: '@PostgreSQL',
      description: 'Eksekusi query SQL aman dan pengambilan dataset relasional.',
      category: 'database',
      provider: 'PostgreSQL Global Development Group',
      permissions: ['Search', 'Read', 'Write', 'Execute'],
      connected: true
    },
    {
      id: 'supabase',
      name: 'Supabase',
      handle: '@Supabase',
      description: 'Database PostgreSQL hosted, Auth, dan Storage Supabase.',
      category: 'database',
      provider: 'Supabase Inc',
      permissions: ['Search', 'Read', 'Write', 'Execute'],
      connected: true
    },
    {
      id: 'tradingview',
      name: 'TradingView & Market Data',
      handle: '@TradingView',
      description: 'Scanning chart pasar realtime, indikator teknikal XAU/USD, forex, dan saham.',
      category: 'database',
      provider: 'TradingView',
      permissions: ['Search', 'Read', 'Execute'],
      connected: true
    },
    {
      id: 'binance',
      name: 'Binance Crypto Data',
      handle: '@Binance',
      description: 'Akses harga crypto realtime, orderbook, dan data transaksi Binance.',
      category: 'database',
      provider: 'Binance',
      permissions: ['Search', 'Read', 'Execute'],
      connected: true
    }
  ];

  const [connectors, setConnectors] = useState<ConnectorItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('navix_app_connectors_status');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return initialConnectors;
  });

  const toggleConnection = (id: string) => {
    setConnectors(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const nextState = !c.connected;
          showToast(
            nextState 
              ? `Konektor ${c.name} berhasil disambungkan!` 
              : `Konektor ${c.name} telah diputuskan`,
            nextState ? 'success' : 'info'
          );
          return { ...c, connected: nextState };
        }
        return c;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('navix_app_connectors_status', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const categories = [
    { id: 'all', label: 'Semua App' },
    { id: 'google', label: 'Google Workspace' },
    { id: 'microsoft', label: 'Microsoft' },
    { id: 'dev', label: 'Dev & Code' },
    { id: 'pm', label: 'Project Management' },
    { id: 'crm', label: 'CRM & Chat' },
    { id: 'database', label: 'Database & Crypto' }
  ];

  const filteredConnectors = connectors.filter(c => {
    const matchCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch = searchQuery === '' 
      || c.name.toLowerCase().includes(searchQuery.toLowerCase())
      || c.handle.toLowerCase().includes(searchQuery.toLowerCase())
      || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Share2 size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Ekosistem
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Hubungkan layanan eksternal untuk dipanggil otomatis oleh AI Chat & Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>OAuth 2.0 Encrypted</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Security Banner as shown in video */}
        <div className="p-4 rounded-2xl bg-[#0e1713] border border-emerald-500/30 flex items-start gap-3.5 shadow-lg">
          <ShieldCheck size={22} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-emerald-300">
              Protokol Keamanan & Privasi Navix AI
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Navix AI menggunakan konektor terenkripsi OAuth 2.0 & API Keys. Anda dapat memanggil layanan eksternal secara terarah dalam Obrolan AI menggunakan perintah sebutan seperti <span className="text-emerald-400 font-mono">@GoogleDrive</span>, <span className="text-emerald-400 font-mono">@Gmail</span>, <span className="text-emerald-400 font-mono">@GitHub</span>, atau <span className="text-emerald-400 font-mono">@TradingView</span>.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari konektor aplikasi (misal: Drive, GitHub, Notion, Supabase)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/80 text-xs text-neutral-200 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>

        {/* Category Pills Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Connectors List */}
        <div className="space-y-3">
          {filteredConnectors.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 hover:border-neutral-700 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-emerald-400">
                  <Database size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <span className="text-xs font-mono text-neutral-400">{c.handle}</span>
                  </div>
                  <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {c.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.2 rounded text-[9px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800"
                      >
                        {p}
                      </span>
                    ))}
                    <span className="text-[10px] text-neutral-500 ml-2">
                      Provider: {c.provider}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action Button */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    c.connected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                  }`}
                >
                  {c.connected ? 'TERHUBUNG' : 'TERPUTUS'}
                </span>
                {onSendToChat && c.connected && (
                  <button
                    onClick={() => onSendToChat(`[Gunakan Aplikasi]: Tolong bantu saya mengoperasikan ${c.name} untuk pekerjaan saya.`)}
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-blue-600 text-blue-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                    title="Gunakan aplikasi ini di Chat Utama"
                  >
                    <Send size={15} />
                  </button>
                )}
                <button
                  onClick={() => toggleConnection(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 ${
                    c.connected
                      ? 'bg-neutral-900 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                  }`}
                >
                  {c.connected ? 'Putuskan' : 'Sambungkan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
