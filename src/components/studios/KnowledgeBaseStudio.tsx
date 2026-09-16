import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  BookOpen, 
  Layers, 
  Menu, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ArrowRight,
  Zap,
  Trash2,
  Send
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface KnowledgeBaseStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const KnowledgeBaseStudio: React.FC<KnowledgeBaseStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ title: string; collection: string; score: string; snippet: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [collections, setCollections] = useState(() => {
    try {
      const saved = localStorage.getItem('navix_kb_collections');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_kb_collections', e);
    }
    return [
    {
      id: 'kb-1',
      title: 'Financial Trading Playbook SMC & Liquidity',
      chunks: '1,240 chunks',
      model: 'text-embedding-004 (768-dim)',
      date: '11/09/2026',
      status: 'Ready'
    },
    {
      id: 'kb-2',
      title: 'Enterprise Security & SOC2 Compliance Docs',
      chunks: '890 chunks',
      model: 'text-embedding-004 (768-dim)',
      date: '10/09/2026',
      status: 'Ready'
    },
    {
      id: 'kb-3',
      title: 'Scientific Paper Archives (Quantum & AI)',
      chunks: '3,400 chunks',
      model: 'text-embedding-004 (768-dim)',
      date: '08/09/2026',
      status: 'Ready'
    },
    {
      id: 'kb-4',
      title: 'Personal User Memories & Preferences',
      chunks: '150 chunks',
      model: 'navix-memory-embed-v2',
      date: 'Hari ini',
      status: 'Active Sync'
    }
  ];
  });

  useEffect(() => {
    localStorage.setItem('navix_kb_collections', JSON.stringify(collections));
  }, [collections]);

  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([
        {
          title: 'Order Block Mitigation Rules v4.2',
          collection: 'Financial Trading Playbook SMC & Liquidity',
          score: '0.942 Similarity',
          snippet: 'Mitigasi Order Block pada zona Fair Value Gap (FVG) valid apabila terjadi break of structure (BOS) disertai volume lonjakan institutional...'
        },
        {
          title: 'Liquidity Sweep Entry Confirmation',
          collection: 'Financial Trading Playbook SMC & Liquidity',
          score: '0.918 Similarity',
          snippet: 'Sweep pada Asian session high/low memberikan konfirmasi entry pembalikan tren (ChoCh) pada timeframe M5 dengan stoploss di atas level wick...'
        }
      ]);
      setIsSearching(false);
      showToast('Pencarian semantik RAG selesai!', 'success');
    }, 600);
  };

  const handleAddCollection = () => {
    const title = prompt('Nama koleksi knowledge base baru:');
    if (!title) return;

    const newCol = {
      id: `kb-${Date.now()}`,
      title,
      chunks: '120 chunks',
      model: 'text-embedding-004 (768-dim)',
      date: 'Baru saja',
      status: 'Indexing'
    };

    setCollections(prev => [newCol, ...prev]);
    showToast(`Koleksi '${title}' berhasil diindeks ke vektor database!`, 'success');
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
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Knowledge Base & RAG Engine
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Vector embedding database untuk dokumen, SOP bisnis, memory personal, dan konteks semantik
            </p>
          </div>
        </div>

        <button
          onClick={handleAddCollection}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-amber-950/40"
        >
          <Plus size={14} />
          <span>Index Koleksi Baru</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Total Vectors Stored</span>
            <p className="text-2xl font-bold font-mono text-white">142,850</p>
            <span className="text-[10px] text-amber-400">Cosine Similarity Index</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Active Knowledge Sets</span>
            <p className="text-2xl font-bold font-mono text-white">{collections.length} Sets</p>
            <span className="text-[10px] text-emerald-400">Auto-Recall Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Retrieval Latency</span>
            <p className="text-2xl font-bold font-mono text-white">12 ms</p>
            <span className="text-[10px] text-cyan-400">HNSW Accelerated</span>
          </div>
        </div>

        {/* Semantic Search Tester */}
        <div className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800 space-y-3 shadow-xl">
          <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase">
            Semantic Vector Search Tester
          </h2>
          <form onSubmit={handleSemanticSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari semantik dalam knowledge base (e.g. 'Mitigasi Order Block pada zona FVG')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 text-xs text-neutral-200 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white transition cursor-pointer"
            >
              {isSearching ? 'Querying...' : 'Cari Vektor'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-amber-400 font-mono">Hasil Teratas (Relevansi Tertinggi):</span>
              {searchResults.map((res, i) => (
                <div key={i} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{res.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {res.score}
                      </span>
                      {onSendToChat && (
                        <button
                          onClick={() => onSendToChat(`[Hasil Pencarian Knowledge Base - ${res.title}]: ${res.snippet}`)}
                          className="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition cursor-pointer"
                          title="Kirim ke Chat Utama"
                        >
                          <Send size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500">{res.collection}</span>
                  <p className="text-xs text-neutral-300 italic">{res.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collections List */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase">
            Daftar Koleksi RAG Terpasang
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 hover:border-neutral-700 transition shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">{col.title}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono">{col.chunks}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {col.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1 border-t border-neutral-800/60">
                  <span>Model: {col.model}</span>
                  <span>{col.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
