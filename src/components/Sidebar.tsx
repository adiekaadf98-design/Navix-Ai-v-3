import { Key, 
  Menu, Plus, MessageSquare, Settings, Compass, Trash2, Shield, X, Beaker, FileText, Cloud, Sparkles, Layers, ChevronRight, Cpu, CreditCard,
  Image as ImageIcon, Video, Volume2, Folder, Bot, Share2, Puzzle, Database, GitBranch, Boxes, CandlestickChart, TrendingUp, Search, Camera, Clock3
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
  isOpen: boolean; setIsOpen: (isOpen: boolean) => void; onNewChat: () => void; sessions: ChatSession[]; currentSessionId: string | null;
  onSelectSession: (id: string) => void; onDeleteSession: (id: string, e: React.MouseEvent) => void; currentView: NavixAppView; onSwitchView: (view: NavixAppView) => void; onOpenCommandPalette?: () => void;
}

export function Sidebar({ isOpen, setIsOpen, onNewChat, sessions, currentSessionId, onSelectSession, onDeleteSession, currentView, onSwitchView, onOpenCommandPalette }: SidebarProps) {
  const { user } = useAuthStore();
  const isDeveloper = user?.role === 'developer' || isDeveloperEmail(user?.email);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { const checkMobile = () => setIsMobile(window.innerWidth < 768); checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile); }, []);
  const handleAction = (action: () => void) => { action(); if (isMobile) setIsOpen(false); };
  const workspaceGroups = [
    { groupTitle: 'Core & Labs', items: [
      { id: 'chat' as NavixAppView, label: 'Chat AI', badge: 'Live', desc: 'Orkestrator Multi-Engine', icon: <MessageSquare size={17} />, accentBorder: 'bg-red-500' },
      { id: 'studio' as NavixAppView, label: 'Studio AI', badge: 'Canvas', desc: 'Web & APK Builder Engine', icon: <Sparkles size={17} />, accentBorder: 'bg-rose-500' },
      { id: 'science' as NavixAppView, label: 'Science Lab', badge: 'Quantum', desc: 'Autonomous Scientific Lab', icon: <Beaker size={17} />, accentBorder: 'bg-cyan-500' },
      { id: 'document' as NavixAppView, label: 'Doc Editor', badge: 'IMRaD', desc: 'Laporan Ilmiah & PDF', icon: <FileText size={17} />, accentBorder: 'bg-emerald-500' },
      { id: 'cloud' as NavixAppView, label: 'Google Cloud', badge: 'Console', desc: 'Cloud Infrastructure Console', icon: <Cloud size={17} />, accentBorder: 'bg-blue-500' },
      { id: 'world_clock' as NavixAppView, label: 'World Clock', badge: 'Realtime', desc: 'Jam digital multi-zona', icon: <Clock3 size={17} />, accentBorder: 'bg-orange-500' },
    ] },
    { groupTitle: 'Multimedia', items: [
      { id: 'stock_image_studio' as NavixAppView, label: 'Stock Image System', badge: 'Nature', desc: '70K Living Beings Catalog', icon: <Camera size={17} />, accentBorder: 'bg-green-500' },
      { id: 'image_studio' as NavixAppView, label: 'Multimedia. Images', badge: 'Visual', desc: 'Generate & upscale 8K visual', icon: <ImageIcon size={17} />, accentBorder: 'bg-red-500' },
      { id: 'video_studio' as NavixAppView, label: 'Multimedia. Videos', badge: 'Motion', desc: 'Neural cinematic video clips', icon: <Video size={17} />, accentBorder: 'bg-rose-500' },
      { id: 'audio_studio' as NavixAppView, label: 'Audio & Speech', badge: 'TTS/STT', desc: 'Sintesis suara & transkripsi', icon: <Volume2 size={17} />, accentBorder: 'bg-amber-500' },
      { id: 'media_library' as NavixAppView, label: 'Library Center', badge: 'Database', desc: 'Katalog berkas & media asset', icon: <Folder size={17} />, accentBorder: 'bg-orange-500' },
    ] },
    { groupTitle: 'Ecosystem & Agents', items: [
      { id: 'ai_agents' as NavixAppView, label: 'System', badge: 'Agents', desc: 'Personas & Agent Builder', icon: <Bot size={17} />, accentBorder: 'bg-purple-500' },
      { id: 'app_connectors' as NavixAppView, label: 'Ekosistem', badge: 'OAuth 2.0', desc: 'Drive, Sheets, GitHub, dll', icon: <Share2 size={17} />, accentBorder: 'bg-emerald-500' },
      { id: 'plugins_sdk' as NavixAppView, label: 'Plugins', badge: 'Add-ons', desc: 'Marketplace, Extensions', icon: <Puzzle size={17} />, accentBorder: 'bg-indigo-500' },
      { id: 'api_keys' as NavixAppView, label: 'API Keys', badge: 'Developer', desc: 'BaaS, Integrations, Usage', icon: <Key size={17} />, accentBorder: 'bg-purple-500' },
      { id: 'knowledge_base' as NavixAppView, label: 'Knowledge Base', badge: 'RAG', desc: 'Vector memory & embeddings', icon: <Database size={17} />, accentBorder: 'bg-amber-500' },
      { id: 'automations' as NavixAppView, label: 'Automasi', badge: 'Pipelines', desc: 'Workflows & scheduled triggers', icon: <GitBranch size={17} />, accentBorder: 'bg-rose-500' },
      { id: 'projects_isolation' as NavixAppView, label: 'Projects', badge: 'Sandbox', desc: 'Terisolasi & multi-team', icon: <Boxes size={17} />, accentBorder: 'bg-blue-500' },
      { id: 'trading_desk' as NavixAppView, label: 'Cloud Market SMC', badge: 'Live Market', desc: '94+ Pasar bergerak & 5 Mesin AI', icon: <CandlestickChart size={17} />, accentBorder: 'bg-emerald-500' },
    ] },
  ];
  return <>
    <AnimatePresence>{isMobile && isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-black/75 z-[150]" />}</AnimatePresence>
    <motion.aside initial={false} animate={isMobile ? { x: isOpen ? 0 : -320, width: 300 } : { width: isOpen ? 260 : 68, x: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className={`h-full bg-[#0a0c10]/95 border-r border-neutral-800 flex flex-col shrink-0 overflow-hidden shadow-xl ${isMobile ? 'fixed inset-y-0 left-0 z-[160] max-w-[320px]' : 'relative'}`}>
      <div className="h-16 px-4 shrink-0 flex items-center justify-between border-b border-neutral-800"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-bold">N</div>{(isOpen || isMobile) && <div><b className="text-xs">Navix AI</b><div className="text-[9px] text-neutral-500">Omega Autonomous</div></div>}</div><button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800" aria-label="Toggle sidebar"><Menu size={20} /></button></div>
      <div className="p-3"><button onClick={() => handleAction(onNewChat)} className="w-full min-h-[46px] flex items-center justify-center gap-3 rounded-xl bg-black text-white border border-white/90"><Plus size={19} />{(isOpen || isMobile) && <span className="text-xs font-semibold">Obrolan Baru</span>}</button></div>
      {onOpenCommandPalette && <div className="px-3 pb-2"><button onClick={() => handleAction(onOpenCommandPalette)} className="w-full min-h-[38px] rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300"><Search size={15} className="inline mr-2" />Cari chat & dokumen...</button></div>}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 pt-1 pb-4 custom-scrollbar">{workspaceGroups.map((group) => <div key={group.groupTitle} className="space-y-1">{(isOpen || isMobile) && <div className="px-2 mb-1.5 text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">{group.groupTitle}</div>}{group.items.map((item) => <button key={item.id} onClick={() => handleAction(() => onSwitchView(item.id))} className={`w-full min-h-[42px] flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-white hover:bg-neutral-800 border border-transparent ${currentView === item.id ? 'bg-neutral-800 border-neutral-700' : ''} ${!isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'}`} title={item.label}><div className="flex items-center gap-2.5"><span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800">{item.icon}</span>{(isOpen || isMobile) && <span className="text-left"><span className="block text-xs font-semibold">{item.label}</span><span className="block text-[10px] text-neutral-400">{item.desc}</span></span>}</div>{(isOpen || isMobile) && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-400">{item.badge}</span>}</button>)}</div>)}</div>
      <div className="px-2.5 py-2 border-t border-neutral-800"><button onClick={() => handleAction(() => setIsSettingsOpen(true))} className="w-full min-h-[40px] flex items-center gap-3 text-white hover:bg-neutral-800 py-2 px-2.5 rounded-lg"><Settings size={17} />{(isOpen || isMobile) && <span className="text-xs font-semibold">Pengaturan</span>}</button></div>
    </motion.aside>
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} /><ExploreModal isOpen={isExploreOpen} onClose={() => setIsExploreOpen(false)} />{isPaymentOpen && <PaymentModal plan="pro" onClose={() => setIsPaymentOpen(false)} />}
  </>;
}
