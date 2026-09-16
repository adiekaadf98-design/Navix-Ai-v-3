import { Key, 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  Compass, 
  Trash2,
  Shield, 
  X, 
  Beaker, 
  FileText, 
  Cloud, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  Cpu, 
  CreditCard,
  Image as ImageIcon,
  Video,
  Volume2,
  Folder,
  Bot,
  Share2,
  Puzzle,
  Database,
  GitBranch,
  Boxes,
  CandlestickChart,
  TrendingUp,
  Search,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChatSession, NavixAppView } from '../types';
import { SettingsModal } from './SettingsModal';
import { ExploreModal } from './ExploreModal';
import { PaymentModal, PricingPlanId } from './PaymentModal';
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
  currentView,
  onSwitchView,
  onOpenCommandPalette
}: SidebarProps) {
  const { user } = useAuthStore();
  const isDeveloper = user?.role === 'developer' || isDeveloperEmail(user?.email);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper to handle actions and auto-close sidebar on mobile devices
  const handleAction = (action: () => void) => {
    action();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const workspaceGroups = [
    {
      groupTitle: 'Core & Labs',
      items: [
        {
          id: 'chat' as NavixAppView,
          label: 'Chat AI',
          badge: 'Live',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          desc: 'Orkestrator Multi-Engine',
          icon: <MessageSquare size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-red-500'
        },
        {
          id: 'studio' as NavixAppView,
          label: 'Studio AI',
          badge: 'Canvas',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold',
          desc: 'Web & APK Builder Engine',
          icon: <Sparkles size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-rose-500'
        },
        {
          id: 'science' as NavixAppView,
          label: 'Science Lab',
          badge: 'Quantum',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          desc: 'Autonomous Scientific Lab',
          icon: <Beaker size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-cyan-500'
        },
        {
          id: 'document' as NavixAppView,
          label: 'Doc Editor',
          badge: 'IMRaD',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          desc: 'Laporan Ilmiah & PDF',
          icon: <FileText size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-emerald-500'
        },
        {
          id: 'cloud' as NavixAppView,
          label: 'Google Cloud',
          badge: 'Console',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          desc: 'Cloud Infrastructure Console',
          icon: <Cloud size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-blue-500'
        }
      ]
    },
    {
      groupTitle: 'Multimedia',
      items: [
        {
          id: 'stock_image_studio' as NavixAppView,
          label: 'Stock Image System',
          badge: 'Nature',
          badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
          desc: '70K Living Beings Catalog',
          icon: <Camera size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-green-500'
        },
        {
          id: 'image_studio' as NavixAppView,
          label: 'Multimedia. Images',
          badge: 'Visual',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          desc: 'Generate & upscale 8K visual',
          icon: <ImageIcon size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-red-500'
        },
        {
          id: 'video_studio' as NavixAppView,
          label: 'Multimedia. Videos',
          badge: 'Motion',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          desc: 'Neural cinematic video clips',
          icon: <Video size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-rose-500'
        },
        {
          id: 'audio_studio' as NavixAppView,
          label: 'Audio & Speech',
          badge: 'TTS/STT',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          desc: 'Sintesis suara & transkripsi',
          icon: <Volume2 size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-amber-500'
        },
        {
          id: 'media_library' as NavixAppView,
          label: 'Library Center',
          badge: 'Database',
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          desc: 'Katalog berkas & media asset',
          icon: <Folder size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-orange-500'
        }
      ]
    },
    {
      groupTitle: 'Ecosystem & Agents',
      items: [
        {
          id: 'ai_agents' as NavixAppView,
          label: 'System',
          badge: 'Agents',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          desc: 'Personas & Agent Builder',
          icon: <Bot size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-purple-500'
        },
        {
          id: 'app_connectors' as NavixAppView,
          label: 'Ekosistem',
          badge: 'OAuth 2.0',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          desc: 'Drive, Sheets, GitHub, dll',
          icon: <Share2 size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-emerald-500'
        },
        {
          id: 'plugins_sdk' as NavixAppView,
          label: 'Plugins',
          badge: 'Add-ons',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          desc: 'Marketplace, Extensions',
          icon: <Puzzle size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-indigo-500'
        },
        {
          id: 'api_keys' as NavixAppView,
          label: 'API Keys',
          badge: 'Developer',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          desc: 'BaaS, Integrations, Usage',
          icon: <Key size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-purple-500'
        },
        {
          id: 'knowledge_base' as NavixAppView,
          label: 'Knowledge Base',
          badge: 'RAG',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          desc: 'Vector memory & embeddings',
          icon: <Database size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-amber-500'
        },
        {
          id: 'automations' as NavixAppView,
          label: 'Automasi',
          badge: 'Pipelines',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          desc: 'Workflows & scheduled triggers',
          icon: <GitBranch size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-rose-500'
        },
        {
          id: 'projects_isolation' as NavixAppView,
          label: 'Projects',
          badge: 'Sandbox',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          desc: 'Terisolasi & multi-team',
          icon: <Boxes size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-blue-500'
        },
        {
          id: 'trading_desk' as NavixAppView,
          label: 'Cloud Market SMC',
          badge: 'Live Market',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          desc: '94+ Pasar bergerak & 5 Mesin AI',
          icon: <CandlestickChart size={17} className="shrink-0 text-emerald-400" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-emerald-500'
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-[150] cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container: Drawer on Mobile, Collapsible Rail on Desktop */}
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? { x: isOpen ? 0 : -320, width: 300 }
            : { width: isOpen ? 260 : 68, x: 0 }
        }
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`h-full bg-[#0a0c10]/95 backdrop-blur-2xl border-r border-neutral-800/80 flex flex-col shrink-0 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.6)] ${
          isMobile 
            ? 'fixed inset-y-0 left-0 z-[160] w-[85vw] max-w-[320px]' 
            : 'relative'
        }`}
      >
        {/* Top Header Bar */}
        <div className="h-16 px-4 shrink-0 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-950/50 shrink-0">
              <span className="font-mono font-bold text-base">N</span>
            </div>
            {(isOpen || isMobile) && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs tracking-wide text-white">Navix AI</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] bg-red-500/20 text-red-300 border border-red-500/30 font-mono font-semibold">
                    v3.5
                  </span>
                </div>
                <span className="text-[9px] text-neutral-400 font-mono">Omega Autonomous</span>
              </div>
            )}
          </div>

          {/* Close/Toggle Button with 44px+ mobile touch target */}
          {isMobile ? (
            <button 
              onClick={() => setIsOpen(false)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-800 active:scale-95 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-all border border-neutral-700/60"
              title="Tutup Menu"
              aria-label="Tutup Menu"
            >
              <X size={20} />
            </button>
          ) : (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all cursor-pointer"
              title={isOpen ? "Ciutkan Sidebar" : "Buka Sidebar"}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Action: Obrolan Baru (New Chat) with Tactile Button */}
        <div className="p-3 pb-1.5 shrink-0">
          <button 
            onClick={() => handleAction(onNewChat)}
            className={`w-full min-h-[46px] flex items-center gap-3 rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] ${
              isOpen || isMobile
                ? 'bg-black hover:bg-neutral-900 active:bg-neutral-950 text-white font-semibold text-xs px-4 py-3 shadow-md border border-white/90 hover:border-white'
                : 'justify-center p-2.5 bg-black hover:bg-neutral-900 text-white border border-white/90 hover:border-white'
            }`}
            title="Mulai Obrolan Baru"
          >
            <Plus size={19} className="shrink-0 transition-transform active:rotate-90 text-white" />
            {(isOpen || isMobile) && (
              <span className="truncate tracking-wide text-white font-semibold">Obrolan Baru</span>
            )}
          </button>
        </div>

        {/* Action: Cari Global (Command Palette Trigger Cmd+K) */}
        {onOpenCommandPalette && (
          <div className="px-3 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAction(onOpenCommandPalette)}
              className={`w-full min-h-[38px] flex items-center justify-between rounded-xl transition-all cursor-pointer select-none border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-850 hover:border-neutral-700 active:scale-[0.98] text-white group ${
                isOpen || isMobile ? 'px-3 py-1.5 text-xs' : 'justify-center p-2.5'
              }`}
              title="Cari Obrolan & Dokumen (Cmd+K)"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Search size={15} className="text-white group-hover:text-red-400 transition-colors shrink-0" />
                {(isOpen || isMobile) && (
                  <span className="truncate text-xs font-medium text-white group-hover:text-white">
                    Cari chat & dokumen...
                  </span>
                )}
              </div>
              {(isOpen || isMobile) && (
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700 group-hover:border-neutral-600">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>
        )}

        {/* Scrollable Center Content: Workspaces & Recent Sessions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-4 pt-1 pb-4 custom-scrollbar">
          {/* Workspace Views Section */}
          <div className="space-y-4">
            {workspaceGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                {(isOpen || isMobile) && (
                  <div className="px-2 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                      {group.groupTitle}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-300 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                      {group.items.length} Modul
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAction(() => onSwitchView(item.id))}
                        className={`w-full min-h-[42px] flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-all relative overflow-hidden select-none cursor-pointer active:scale-[0.98] group ${
                          !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
                        } ${
                          isActive 
                            ? `${item.activeClass} border shadow-sm` 
                            : 'text-white hover:bg-neutral-800/80 active:bg-neutral-800 border border-transparent hover:border-neutral-700/50'
                        }`}
                        title={item.label}
                      >
                        {/* Glowing active indicator bar on the left */}
                        {isActive && (isOpen || isMobile) && (
                          <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${item.accentBorder}`} />
                        )}

                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 shrink-0 shadow-sm">
                            {item.icon}
                          </div>
                          {(isOpen || isMobile) && (
                            <div className="flex flex-col text-left truncate">
                              <span className="text-xs font-semibold text-white tracking-tight truncate">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-neutral-300 truncate">
                                {item.desc}
                              </span>
                            </div>
                          )}
                        </div>

                        {(isOpen || isMobile) && (
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 border border-transparent ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Chats Section */}
          {(isOpen || isMobile) && (
            <div className="border-t border-neutral-800/80 pt-3">
              <div className="px-2 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                  Riwayat Chat
                </span>
                <span className="text-[9px] font-mono text-neutral-300 px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800">
                  {sessions.length}
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="text-xs text-neutral-400 italic px-3 py-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-center">
                  Belum ada sesi percakapan
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => {
                    const isSelected = currentSessionId === session.id;
                    return (
                      <div 
                        key={session.id} 
                        onClick={() => handleAction(() => onSelectSession(session.id))}
                        className={`w-full text-left min-h-[44px] flex items-center justify-between text-xs py-2 px-3 rounded-xl transition-all overflow-hidden group cursor-pointer select-none active:scale-[0.98] ${
                          isSelected 
                            ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700' 
                            : 'text-white hover:bg-neutral-800/60 active:bg-neutral-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-1">
                          <MessageSquare 
                            size={15} 
                            className={`shrink-0 transition-colors ${
                              isSelected ? 'text-red-400' : 'text-white group-hover:text-red-400'
                            }`} 
                          />
                          <span className="truncate font-medium text-white">{session.title || 'Obrolan'}</span>
                        </div>

                        {/* Delete session button with dedicated 36px+ tap target */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id, e);
                          }}
                          className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-neutral-400 hover:text-red-400 active:text-red-400 active:bg-red-950/40 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          title="Hapus obrolan"
                          aria-label="Hapus obrolan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Footer (Explore, Upgrade & Settings) with Device Safe-Area */}
        <div className="px-2.5 py-2 shrink-0 border-t border-neutral-800/80 bg-neutral-950/80 space-y-0.5 pb-safe">
          <button 
            onClick={() => handleAction(() => setIsPaymentOpen(true))} 
            className={`w-full min-h-[40px] flex items-center gap-3 text-white hover:bg-neutral-800/70 active:bg-neutral-800 active:scale-[0.99] py-2 px-2.5 rounded-lg transition-colors cursor-pointer select-none ${
              !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
            }`}
            title="Upgrade Kuota & Paket Navix AI"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 shrink-0">
                <CreditCard size={17} className="text-white shrink-0" />
              </div>
              {(isOpen || isMobile) && (
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-semibold text-white">Upgrade Kuota</span>
                  <span className="text-[10px] text-neutral-300 font-normal">Bayar DANA QRIS</span>
                </div>
              )}
            </div>
            {(isOpen || isMobile) && (
              <span className="text-[9px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                PRO
              </span>
            )}
          </button>

          {isDeveloper && (
            <button 
              onClick={() => handleAction(() => setIsExploreOpen(true))} 
              className={`w-full min-h-[40px] flex items-center gap-3 text-white hover:bg-neutral-800/70 active:bg-neutral-800 active:scale-[0.99] py-2 px-2.5 rounded-lg transition-colors cursor-pointer select-none ${
                !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
              }`}
              title="Buka Explore Matrix Mesin (Developer)"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 shrink-0">
                  <Compass size={17} className="text-white shrink-0" />
                </div>
                {(isOpen || isMobile) && (
                  <div className="flex flex-col text-left truncate">
                    <span className="text-xs font-semibold text-white">Explore AI</span>
                    <span className="text-[10px] text-neutral-300 font-normal">Matrix 32 Mesin</span>
                  </div>
                )}
              </div>
              {(isOpen || isMobile) && (
                <ChevronRight size={14} className="text-neutral-400 shrink-0" />
              )}
            </button>
          )}


          {isDeveloper && (
            <button 
              onClick={() => handleAction(() => onSwitchView('admin_dashboard'))} 
              className={`w-full min-h-[40px] flex items-center gap-3 text-white hover:bg-neutral-800/70 active:bg-neutral-800 active:scale-[0.99] py-2 px-2.5 rounded-lg transition-colors cursor-pointer select-none ${
                !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
              }`}
              title="Admin Panel"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 shrink-0">
                  <Shield size={17} className="text-red-500 shrink-0" />
                </div>
                {(isOpen || isMobile) && (
                  <div className="flex flex-col text-left truncate">
                    <span className="text-xs font-semibold text-white">Admin Panel</span>
                    <span className="text-[10px] text-neutral-300 font-normal">Kelola Pengguna</span>
                  </div>
                )}
              </div>
              {(isOpen || isMobile) && (
                <ChevronRight size={14} className="text-neutral-400 shrink-0" />
              )}
            </button>
          )}
          <button 
            onClick={() => handleAction(() => setIsSettingsOpen(true))} 

            className={`w-full min-h-[40px] flex items-center gap-3 text-white hover:bg-neutral-800/70 active:bg-neutral-800 active:scale-[0.99] py-2 px-2.5 rounded-lg transition-colors cursor-pointer select-none ${
              !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
            }`}
            title="Buka Pengaturan"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 shrink-0">
                <Settings size={17} className="text-white shrink-0" />
              </div>
              {(isOpen || isMobile) && (
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-semibold text-white">Pengaturan</span>
                  <span className="text-[10px] text-neutral-300 font-normal">Model & Preferensi</span>
                </div>
              )}
            </div>
            {(isOpen || isMobile) && (
              <ChevronRight size={14} className="text-neutral-400 shrink-0" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ExploreModal isOpen={isExploreOpen} onClose={() => setIsExploreOpen(false)} />
      {isPaymentOpen && (
        <PaymentModal plan="pro" onClose={() => setIsPaymentOpen(false)} />
      )}
    </>
  );
}
