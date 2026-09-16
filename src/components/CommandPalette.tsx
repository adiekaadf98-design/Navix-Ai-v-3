import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  X, 
  Clock, 
  Tag, 
  CornerDownLeft, 
  ChevronRight,
  CandlestickChart,
  Beaker,
  Cloud,
  FolderArchive,
  Bot
} from 'lucide-react';
import { ChatSession, NavixAppView, SavedDocument } from '../types';
import { getSavedDocuments, extractDocumentsFromSessions } from '../utils/documentStorage';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onSwitchView: (view: NavixAppView) => void;
  onSelectDocument?: (doc: SavedDocument) => void;
}

type FilterCategory = 'all' | 'chat' | 'document' | 'action';

interface SearchResultItem {
  id: string;
  type: 'session' | 'document' | 'action';
  title: string;
  subtitle?: string;
  excerpt?: string;
  date?: string;
  badge?: string;
  icon: React.ReactNode;
  category: FilterCategory;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onNewChat,
  onSwitchView,
  onSelectDocument
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveTab('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Load all documents from editor storage + chat generated documents
  const allDocuments = useMemo(() => {
    if (!isOpen) return [];
    const editorDocs = getSavedDocuments();
    const chatDocs = extractDocumentsFromSessions(sessions);
    return [...editorDocs, ...chatDocs];
  }, [isOpen, sessions]);

  // Helper function to extract a contextual snippet around a matching keyword
  const extractSnippet = (text: string, searchTerm: string): string => {
    if (!text || !searchTerm) return '';
    const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/#|\*|_/g, ' ').trim();
    const index = cleanText.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) {
      return cleanText.slice(0, 95) + (cleanText.length > 95 ? '...' : '');
    }
    const start = Math.max(0, index - 35);
    const end = Math.min(cleanText.length, index + searchTerm.length + 55);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < cleanText.length ? '...' : '';
    return prefix + cleanText.slice(start, end).trim() + suffix;
  };

  // Helper to format dates
  const formatDate = (dateInput?: string | Date): string => {
    if (!dateInput) return '';
    try {
      const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins}m lalu`;
      if (diffHours < 24) return `${diffHours}j lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays}h lalu`;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // Build searchable items
  const searchResults = useMemo<SearchResultItem[]>(() => {
    const trimmed = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // 1. CHAT SESSIONS & MESSAGES
    sessions.forEach(session => {
      const titleMatch = (session.title || '').toLowerCase().includes(trimmed);
      
      // Search within session messages
      let messageMatchSnippet = '';
      let matchedMsgCount = 0;

      session.messages.forEach(msg => {
        if (msg.text && msg.text.toLowerCase().includes(trimmed)) {
          matchedMsgCount++;
          if (!messageMatchSnippet) {
            messageMatchSnippet = extractSnippet(msg.text, trimmed);
          }
        }
      });

      if (!trimmed || titleMatch || messageMatchSnippet) {
        const subtitle = messageMatchSnippet 
          ? messageMatchSnippet 
          : `${session.messages.length} pesan`;

        items.push({
          id: `session-${session.id}`,
          type: 'session',
          title: session.title || 'Obrolan Baru',
          subtitle,
          excerpt: messageMatchSnippet,
          date: formatDate(session.updatedAt),
          badge: `${session.messages.length} Pesan`,
          category: 'chat',
          icon: <MessageSquare size={16} className="text-red-400" />,
          onSelect: () => {
            onSelectSession(session.id);
            onSwitchView('chat');
            onClose();
          }
        });
      }
    });

    // 2. DOCUMENTS
    allDocuments.forEach(doc => {
      const titleMatch = (doc.title || '').toLowerCase().includes(trimmed);
      const contentMatch = (doc.content || '').toLowerCase().includes(trimmed);
      const tagsMatch = (doc.tags || []).some(t => t.toLowerCase().includes(trimmed));

      if (!trimmed || titleMatch || contentMatch || tagsMatch) {
        const snippet = contentMatch ? extractSnippet(doc.content, trimmed) : (doc.content?.slice(0, 90) || '');
        const isChatDoc = doc.source === 'chat';

        items.push({
          id: `doc-${doc.id}`,
          type: 'document',
          title: doc.title,
          subtitle: snippet || (doc.tags ? doc.tags.join(', ') : 'Dokumen teks'),
          excerpt: snippet,
          date: formatDate(doc.updatedAt),
          badge: isChatDoc ? 'Chat Doc' : 'Doc Editor',
          category: 'document',
          icon: <FileText size={16} className={isChatDoc ? "text-amber-400" : "text-emerald-400"} />,
          onSelect: () => {
            if (isChatDoc && doc.sessionId) {
              onSelectSession(doc.sessionId);
              onSwitchView('chat');
            } else {
              if (onSelectDocument) {
                onSelectDocument(doc);
              }
              onSwitchView('document');
            }
            onClose();
          }
        });
      }
    });

    // 3. QUICK ACTIONS & NAVIGATION (always available or filtered by query)
    const quickActions: SearchResultItem[] = [
      {
        id: 'action-new-chat',
        type: 'action',
        title: 'Mulai Obrolan Baru',
        subtitle: 'Buka sesi percakapan kosong dengan Navix AI',
        category: 'action',
        badge: 'Aksi Cepat',
        icon: <Plus size={16} className="text-red-400" />,
        onSelect: () => {
          onNewChat();
          onSwitchView('chat');
          onClose();
        }
      },
      {
        id: 'action-doc-editor',
        type: 'action',
        title: 'Buka Doc Editor (Laporan & PDF)',
        subtitle: 'Editor markdown untuk laporan ilmiah, analisis, dan ekspor PDF',
        category: 'action',
        badge: 'Navigasi',
        icon: <FileText size={16} className="text-emerald-400" />,
        onSelect: () => {
          onSwitchView('document');
          onClose();
        }
      },
      {
        id: 'action-trading-desk',
        type: 'action',
        title: 'Trading Desk SMC (Quant Analysis)',
        subtitle: 'Analisis likuiditas, orderflow, CHoCH, dan sinyal SMC otomatis',
        category: 'action',
        badge: 'Navigasi',
        icon: <CandlestickChart size={16} className="text-emerald-400" />,
        onSelect: () => {
          onSwitchView('trading_desk');
          onClose();
        }
      },
      {
        id: 'action-studio-ai',
        type: 'action',
        title: 'Studio AI (Canvas Web & APK)',
        subtitle: 'Generator aplikasi, kode langsung, dan packaging APK',
        category: 'action',
        badge: 'Navigasi',
        icon: <Sparkles size={16} className="text-rose-400" />,
        onSelect: () => {
          onSwitchView('studio');
          onClose();
        }
      },
      {
        id: 'action-science-lab',
        type: 'action',
        title: 'Science Sandbox (Quantum Lab)',
        subtitle: 'Simulasi ilmiah otonom dan pengujian formulasi',
        category: 'action',
        badge: 'Navigasi',
        icon: <Beaker size={16} className="text-cyan-400" />,
        onSelect: () => {
          onSwitchView('science');
          onClose();
        }
      },
      {
        id: 'action-cloud-console',
        type: 'action',
        title: 'Google Cloud Infrastructure Console',
        subtitle: 'Monitoring cluster cloud, kuota, dan telemetry',
        category: 'action',
        badge: 'Navigasi',
        icon: <Cloud size={16} className="text-blue-400" />,
        onSelect: () => {
          onSwitchView('cloud');
          onClose();
        }
      },
      {
        id: 'action-media-library',
        type: 'action',
        title: 'Media Library & Dokumen File',
        subtitle: 'Penyimpanan terpadu gambar, video, dan dokumen',
        category: 'action',
        badge: 'Navigasi',
        icon: <FolderArchive size={16} className="text-purple-400" />,
        onSelect: () => {
          onSwitchView('media_library');
          onClose();
        }
      },
      {
        id: 'action-ai-agents',
        type: 'action',
        title: 'AI Agents Studio',
        subtitle: 'Kelola tim agen otonom untuk tugas komputasi spesifik',
        category: 'action',
        badge: 'Navigasi',
        icon: <Bot size={16} className="text-amber-400" />,
        onSelect: () => {
          onSwitchView('ai_agents');
          onClose();
        }
      }
    ];

    quickActions.forEach(action => {
      const match = !trimmed || action.title.toLowerCase().includes(trimmed) || (action.subtitle || '').toLowerCase().includes(trimmed);
      if (match) {
        items.push(action);
      }
    });

    return items;
  }, [query, sessions, allDocuments, onSelectSession, onSwitchView, onNewChat, onSelectDocument, onClose]);

  // Filter items by category tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return searchResults;
    return searchResults.filter(item => item.category === activeTab);
  }, [searchResults, activeTab]);

  // Adjust selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length, activeTab]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, filteredResults.length - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Highlight matching characters in text
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-red-500/30 text-red-200 font-semibold rounded-xs px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: searchResults.length,
      chat: searchResults.filter(i => i.category === 'chat').length,
      document: searchResults.filter(i => i.category === 'document').length,
      action: searchResults.filter(i => i.category === 'action').length
    };
  }, [searchResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
      />

      {/* Palette Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-[#0d1017] border border-neutral-800/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-neutral-200 z-10"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800/80 bg-neutral-900/40">
          <Search size={19} className="text-red-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari sesi chat, isi pesan, atau dokumen... (Cmd+K)"
            className="flex-1 bg-transparent border-none text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:ring-0"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
              title="Hapus pencarian"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700/60 rounded">
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-800/50 bg-[#0a0c12]/60 overflow-x-auto custom-scrollbar">
          {(
            [
              { id: 'all', label: 'Semua', count: counts.all },
              { id: 'chat', label: 'Chat', count: counts.chat },
              { id: 'document', label: 'Dokumen', count: counts.document },
              { id: 'action', label: 'Aksi & Navigasi', count: counts.action }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                activeTab === tab.id ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-900 text-neutral-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[380px] sm:max-h-[440px] overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-neutral-500">
                <Search size={22} />
              </div>
              <p className="text-sm font-medium text-neutral-300">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                {query 
                  ? `Tidak ada obrolan atau dokumen yang cocok dengan "${query}". Coba kata kunci yang lebih umum.`
                  : 'Belum ada data obrolan atau dokumen yang tersimpan.'}
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-500/15 via-neutral-800/80 to-neutral-800/60 border border-red-500/30 text-white shadow-xs'
                      : 'hover:bg-neutral-800/50 text-neutral-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isSelected ? 'bg-neutral-800 border border-neutral-700' : 'bg-neutral-900/80 border border-neutral-800/80'
                    }`}>
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tracking-tight truncate text-white">
                          {renderHighlighted(item.title, query)}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            item.type === 'session'
                              ? 'bg-red-500/15 text-red-300 border-red-500/30'
                              : item.type === 'document'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-xs text-neutral-400 truncate mt-0.5 line-clamp-1 leading-relaxed">
                          {renderHighlighted(item.subtitle, query)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {item.date && (
                      <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                        <Clock size={10} />
                        {item.date}
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-300 flex items-center justify-center">
                        <CornerDownLeft size={13} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#090b10] border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700/60 rounded text-[9px] font-mono text-neutral-400">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700/60 rounded text-[9px] font-mono text-neutral-400">↓</kbd>
              <span className="hidden sm:inline">Navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700/60 rounded text-[9px] font-mono text-neutral-400">↵</kbd>
              <span className="hidden sm:inline">Buka</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700/60 rounded text-[9px] font-mono text-neutral-400">ESC</kbd>
              <span className="hidden sm:inline">Tutup</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
            <span>Global Search</span>
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span className="text-neutral-500">Cmd+K</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
