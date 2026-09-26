import { Key, 
  Menu, Plus, MessageSquare, Settings, Compass, Trash2, Shield, X, Beaker, FileText, Cloud, Sparkles, Layers, ChevronRight, Cpu, CreditCard,
  Image as ImageIcon, Video, Volume2, Folder, Bot, Share2, Puzzle, Database, GitBranch, Boxes, CandlestickChart, TrendingUp, Search, Camera, Clock3, LogOut, History,
  MoreVertical, Pencil, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChatSession, NavixAppView } from '../types';
import { SettingsModal } from './SettingsModal';
import { ExploreModal } from './ExploreModal';
import { PaymentModal } from './PaymentModal';
import { useAuthStore } from '../store/useAuthStore';
import { isDeveloperEmail } from '../services/auth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  currentView: NavixAppView;
  onSwitchView: (view: NavixAppView) => void;
  onOpenCommandPalette?: () => void;
}

export function Sidebar({ 
  isOpen, 
  setIsOpen, 
  onNewChat, 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onDeleteSession, 
  onRenameSession,
  currentView, 
  onSwitchView, 
  onOpenCommandPalette 
}: SidebarProps) {
  const { user, logout } = useAuthStore();
  const isDeveloper = user?.role === 'developer' || isDeveloperEmail(user?.email);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'studios'>('history');
  const [sessionSearch, setSessionSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Gemini AI-style session state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuSessionId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    if (isMobile) setIsOpen(false);
  };

  const filteredSessions = sessions.filter(s => 
    !sessionSearch.trim() || 
    (s.title && s.title.toLowerCase().includes(sessionSearch.toLowerCase())) ||
    s.messages.some(m => m.text && m.text.toLowerCase().includes(sessionSearch.toLowerCase()))
  );

  const workspaceGroups = [
    { 
      groupTitle: 'Core & Labs', 
      items: [
        { id: 'chat' as NavixAppView, label: 'Chat AI', badge: 'Live', desc: 'Orkestrator Multi-Engine', icon: <MessageSquare size={17} />, accentBorder: 'bg-red-500' },
        { id: 'studio' as NavixAppView, label: 'Studio AI', badge: 'Canvas', desc: 'Web & APK Builder Engine', icon: <Sparkles size={17} />, accentBorder: 'bg-rose-500' },
        { id: 'science' as NavixAppView, label: 'Science Lab', badge: 'Quantum', desc: 'Autonomous Scientific Lab', icon: <Beaker size={17} />, accentBorder: 'bg-cyan-500' },
        { id: 'document' as NavixAppView, label: 'Doc Editor', badge: 'IMRaD', desc: 'Laporan Ilmiah & PDF', icon: <FileText size={17} />, accentBorder: 'bg-emerald-500' },
        { id: 'cloud' as NavixAppView, label: 'Google Cloud', badge: 'Console', desc: 'Cloud Infrastructure Console', icon: <Cloud size={17} />, accentBorder: 'bg-blue-500' },
        { id: 'world_clock' as NavixAppView, label: 'World Clock', badge: 'Realtime', desc: 'Jam digital multi-zona', icon: <Clock3 size={17} />, accentBorder: 'bg-orange-500' },
        ...(isDeveloper ? [{ id: 'admin_dashboard' as NavixAppView, label: 'Admin Console', badge: 'Adieka', desc: 'Developer Router & Key Pool', icon: <Shield size={17} className="text-amber-400" />, accentBorder: 'bg-amber-500' }] : []),
      ] 
    },
    { 
      groupTitle: 'Multimedia', 
      items: [
        { id: 'stock_image_studio' as NavixAppView, label: 'Stok Gambar', badge: 'Library', desc: 'Library Stok Visual & Inspirasi', icon: <Camera size={17} />, accentBorder: 'bg-green-500' },
        { id: 'image_studio' as NavixAppView, label: 'Multimedia Images', badge: 'Visual', desc: 'Generate & upscale 8K visual', icon: <ImageIcon size={17} />, accentBorder: 'bg-red-500' },
        { id: 'video_studio' as NavixAppView, label: 'Multimedia Videos', badge: 'Motion', desc: 'Neural cinematic video clips', icon: <Video size={17} />, accentBorder: 'bg-rose-500' },
        { id: 'audio_studio' as NavixAppView, label: 'Audio & Speech', badge: 'TTS/STT', desc: 'Sintesis suara & transkripsi', icon: <Volume2 size={17} />, accentBorder: 'bg-amber-500' },
        { id: 'media_library' as NavixAppView, label: 'Library Center', badge: 'Database', desc: 'Katalog berkas & media asset', icon: <Folder size={17} />, accentBorder: 'bg-orange-500' },
      ] 
    },
    { 
      groupTitle: 'Ecosystem & Agents', 
      items: [
        { id: 'ai_agents' as NavixAppView, label: 'System Agents', badge: 'Agents', desc: 'Personas & Agent Builder', icon: <Bot size={17} />, accentBorder: 'bg-purple-500' },
        { id: 'app_connectors' as NavixAppView, label: 'Ekosistem Connectors', badge: 'OAuth 2.0', desc: 'Drive, Sheets, GitHub, dll', icon: <Share2 size={17} />, accentBorder: 'bg-emerald-500' },
        { id: 'plugins_sdk' as NavixAppView, label: 'Plugins & Addons', badge: 'Add-ons', desc: 'Marketplace, Extensions', icon: <Puzzle size={17} />, accentBorder: 'bg-indigo-500' },
        { id: 'api_keys' as NavixAppView, label: 'API Keys Pool', badge: 'Developer', desc: 'BaaS, Integrations, Usage', icon: <Key size={17} />, accentBorder: 'bg-purple-500' },
        { id: 'knowledge_base' as NavixAppView, label: 'Knowledge Base', badge: 'RAG', desc: 'Vector memory & embeddings', icon: <Database size={17} />, accentBorder: 'bg-amber-500' },
        { id: 'automations' as NavixAppView, label: 'Automasi Pipeline', badge: 'Pipelines', desc: 'Workflows & scheduled triggers', icon: <GitBranch size={17} />, accentBorder: 'bg-rose-500' },
        { id: 'projects_isolation' as NavixAppView, label: 'Projects Isolation', badge: 'Sandbox', desc: 'Terisolasi & multi-team', icon: <Boxes size={17} />, accentBorder: 'bg-blue-500' },
        { id: 'trading_desk' as NavixAppView, label: 'Cloud Market SMC', badge: 'Live 94+', desc: '94+ Pasar bergerak & 5 Mesin AI', icon: <CandlestickChart size={17} />, accentBorder: 'bg-emerald-500' },
      ] 
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsOpen(false)} 
            className="md:hidden fixed inset-0 bg-black/60 z-[80] cursor-pointer" 
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false} 
        animate={isMobile ? { x: isOpen ? 0 : -320, width: 280 } : { width: isOpen ? 280 : 68, x: 0 }} 
        transition={{ type: 'spring', damping: 28, stiffness: 300 }} 
        className={`h-full bg-[#0c0e14] border-r border-neutral-800 flex flex-col shrink-0 overflow-hidden shadow-2xl ${
          isMobile ? 'fixed inset-y-0 left-0 z-[100] max-w-[280px]' : 'relative z-20'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-4 shrink-0 flex items-center justify-between border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 flex items-center justify-center font-bold text-white shadow-lg shadow-red-950/40">
              N
            </div>
            {(isOpen || isMobile) && (
              <div>
                <div className="flex items-center gap-1.5">
                  <b className="text-xs text-white tracking-wide">NAVIX AI</b>
                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    OMEGA
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">Autonomous Intelligence</div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer" 
            aria-label={isMobile ? 'Tutup sidebar' : 'Toggle sidebar'}
          >
            {isMobile ? <X size={20} className="text-white" /> : <Menu size={19} />}
          </button>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3 pb-2">
          <button 
            onClick={() => handleAction(onNewChat)} 
            className="w-full min-h-[44px] flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-950/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus size={18} />
            {(isOpen || isMobile) && <span>Obrolan Baru</span>}
          </button>
        </div>

        {/* Tab Switcher: Riwayat Chat vs Workspace Studio */}
        {(isOpen || isMobile) && (
          <div className="px-3 pb-2">
            <div className="grid grid-cols-2 p-1 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSidebarTab('history')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  sidebarTab === 'history' 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <History size={14} />
                <span>Riwayat ({sessions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('studios')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  sidebarTab === 'studios' 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers size={14} />
                <span>Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-3 space-y-3 pt-1 pb-4 custom-scrollbar">
          {sidebarTab === 'history' && (isOpen || isMobile) ? (
            /* TAB 1: RIWAYAT PERCAKAPAN (CHAT SESSIONS LIST) */
            <div className="space-y-1.5">
              {/* Search filter for sessions */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Cari riwayat chat..."
                  className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-neutral-700 rounded-lg py-1.5 pl-7 pr-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none"
                />
              </div>

              <div className="px-1 text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase mb-1">
                Daftar Percakapan
              </div>

              {filteredSessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl my-2">
                  <MessageSquare size={20} className="mx-auto text-neutral-600 mb-1.5 opacity-50" />
                  <span>Belum ada obrolan</span>
                  <button 
                    onClick={() => handleAction(onNewChat)}
                    className="block mx-auto mt-2 text-[11px] text-red-400 hover:underline"
                  >
                    + Buat obrolan baru
                  </button>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = currentSessionId === session.id && currentView === 'chat';
                  const msgCount = session.messages?.length || 0;
                  const isEditing = editingSessionId === session.id;
                  const isMenuOpen = activeMenuSessionId === session.id;

                  if (isEditing) {
                    return (
                      <div
                        key={session.id}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full min-h-[44px] flex items-center gap-1.5 p-2 rounded-xl bg-neutral-800/95 border border-red-500/40 shadow-sm"
                      >
                        <MessageSquare size={14} className="text-red-400 shrink-0 ml-1" />
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (editTitleValue.trim() && onRenameSession) {
                                onRenameSession(session.id, editTitleValue.trim());
                              }
                              setEditingSessionId(null);
                            } else if (e.key === 'Escape') {
                              setEditingSessionId(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 min-w-0 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editTitleValue.trim() && onRenameSession) {
                              onRenameSession(session.id, editTitleValue.trim());
                            }
                            setEditingSessionId(null);
                          }}
                          className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors shrink-0"
                          title="Simpan nama"
                          aria-label="Simpan nama"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSessionId(null)}
                          className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors shrink-0"
                          title="Batal"
                          aria-label="Batal"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={session.id}
                      className="relative group"
                    >
                      <div
                        onClick={() => handleAction(() => {
                          onSelectSession(session.id);
                          onSwitchView('chat');
                        })}
                        className={`w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isActive
                            ? 'bg-neutral-800/90 text-white border-red-500/30 shadow-md shadow-red-950/10'
                            : 'text-neutral-300 hover:bg-neutral-900/80 hover:text-white border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                          <MessageSquare 
                            size={15} 
                            className={`shrink-0 ${isActive ? 'text-red-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} 
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate leading-snug">
                              {session.title || 'Obrolan Baru'}
                            </p>
                            <span className="text-[10px] text-neutral-400">
                              {msgCount} pesan
                            </span>
                          </div>
                        </div>

                        {/* Action buttons: Gemini-style 3 dots & Quick Delete */}
                        <div 
                          className="flex items-center gap-0.5 shrink-0" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Tombol Hapus Langsung (Quick Delete) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(session);
                            }}
                            className={`p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer ${
                              isMobile || isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            title="Hapus obrolan ini"
                            aria-label="Hapus obrolan"
                          >
                            <Trash2 size={13.5} />
                          </button>

                          {/* Menu 3-Titik ala Aplikasi Gemini AI */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuSessionId(activeMenuSessionId === session.id ? null : session.id);
                            }}
                            className={`p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer ${
                              isMobile || isActive || isMenuOpen ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            title="Menu opsi obrolan"
                            aria-label="Menu opsi"
                          >
                            <MoreVertical size={13.5} />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Menu Gemini AI */}
                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 top-full mt-1 z-40 w-44 bg-[#16181f] border border-neutral-700/80 rounded-xl shadow-2xl p-1.5 space-y-0.5 backdrop-blur-md"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSessionId(session.id);
                                setEditTitleValue(session.title || '');
                                setActiveMenuSessionId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-neutral-800/90 transition-colors text-left font-medium cursor-pointer"
                            >
                              <Pencil size={13} className="text-neutral-400 shrink-0" />
                              <span>Ganti nama</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuSessionId(null);
                                setSessionToDelete(session);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-medium cursor-pointer"
                            >
                              <Trash2 size={13} className="text-red-400 shrink-0" />
                              <span>Hapus obrolan</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* TAB 2: WORKSPACE GROUPS & STUDIOS */
            workspaceGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                {(isOpen || isMobile) && (
                  <div className="px-2 mb-1.5 text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                    {group.groupTitle}
                  </div>
                )}
                {group.items.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => handleAction(() => onSwitchView(item.id))} 
                      className={`w-full min-h-[42px] flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-white hover:bg-neutral-800/80 border transition-all ${
                        isActive ? 'bg-neutral-800 border-neutral-700 shadow-sm' : 'border-transparent'
                      } ${!isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'}`} 
                      title={item.label}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 ${isActive ? 'text-red-400' : 'text-neutral-300'}`}>
                          {item.icon}
                        </span>
                        {(isOpen || isMobile) && (
                          <span className="text-left min-w-0">
                            <span className="block text-xs font-semibold truncate">{item.label}</span>
                            <span className="block text-[10px] text-neutral-400 truncate">{item.desc}</span>
                          </span>
                        )}
                      </div>
                      {(isOpen || isMobile) && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-400 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="p-2.5 border-t border-neutral-800 space-y-1 shrink-0 bg-[#0a0c10]">
          {/* Upgrade & Pembayaran DANA Button */}
          <button 
            onClick={() => handleAction(() => setIsPaymentOpen(true))} 
            className={`w-full min-h-[40px] flex items-center gap-2.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-950/50 to-neutral-900 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 transition-colors ${
              !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
            }`}
            title="Langganan & Pembayaran DANA"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                <CreditCard size={16} />
              </span>
              {(isOpen || isMobile) && (
                <div className="text-left">
                  <span className="block text-xs font-bold text-white">Pembayaran & Kuota</span>
                  <span className="block text-[10px] text-blue-300">DANA • QRIS Resmi</span>
                </div>
              )}
            </div>
            {(isOpen || isMobile) && (
              <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                {user?.plan ? user.plan.toUpperCase() : 'PRO'}
              </span>
            )}
          </button>

          {/* Jelajah Engine & Ekosistem */}
          <button 
            onClick={() => handleAction(() => setIsExploreOpen(true))} 
            className={`w-full min-h-[38px] flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors ${
              !isOpen && !isMobile ? 'justify-center px-0' : ''
            }`}
            title="Jelajah Ekosistem AI"
          >
            <Compass size={17} className="text-amber-400" />
            {(isOpen || isMobile) && <span className="text-xs font-semibold">Jelajah Ekosistem</span>}
          </button>

          {/* Pengaturan */}
          <button 
            onClick={() => handleAction(() => setIsSettingsOpen(true))} 
            className={`w-full min-h-[38px] flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors ${
              !isOpen && !isMobile ? 'justify-center px-0' : ''
            }`}
            title="Pengaturan Sistem"
          >
            <Settings size={17} className="text-neutral-400" />
            {(isOpen || isMobile) && <span className="text-xs font-semibold">Pengaturan</span>}
          </button>

          {/* User Profile & Logout */}
          {(isOpen || isMobile) && user && (
            <div className="pt-2 mt-1 border-t border-neutral-800/80 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={user.avatar || 'https://ui-avatars.com/api/?name=User&background=4285F4&color=fff'} 
                  alt={user.name || 'User'} 
                  className="w-7 h-7 rounded-full object-cover border border-neutral-700 shrink-0" 
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name || 'User'}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                title="Keluar / Logout"
                aria-label="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ExploreModal isOpen={isExploreOpen} onClose={() => setIsExploreOpen(false)} />
      {isPaymentOpen && (
        <PaymentModal plan="pro" onClose={() => setIsPaymentOpen(false)} />
      )}

      {/* Modal Konfirmasi Hapus Obrolan (Gemini AI Style Dialog) */}
      <AnimatePresence>
        {sessionToDelete && (
          <div 
            className="fixed inset-0 z-[250] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSessionToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161922] border border-neutral-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0 mt-0.5">
                  <Trash2 size={20} />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-sm font-bold text-white leading-snug">Hapus percakapan?</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed break-words">
                    Tindakan ini akan menghapus riwayat obrolan <span className="text-neutral-200 font-semibold">"{sessionToDelete.title || 'Obrolan'}"</span> secara permanen dari akun Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setSessionToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    onDeleteSession(sessionToDelete.id, e as any);
                    setSessionToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:scale-95 shadow-lg shadow-red-950/40 transition-all cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
