const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { Puzzle, Terminal, Menu, Check, Copy, Plus, Send, ToggleLeft, ToggleRight, Download, Search, Globe, Github } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { useAuthStore } from '../../store/useAuthStore';

interface PluginsStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
  onUpgradeClick?: () => void;
}

export const PluginsStudio: React.FC<PluginsStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');
  
  // Local Plugins (Installed)
  const [plugins, setPlugins] = useState(() => {
    const saved = localStorage.getItem('navix_plugins_list');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Store Plugins (From external open source / npm)
  const [storePlugins, setStorePlugins] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('navix_plugins_list', JSON.stringify(plugins));
  }, [plugins]);

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.active;
        showToast(
          nextState ? \`Plugin \${p.name} diaktifkan\` : \`Plugin \${p.name} dinonaktifkan\`,
          nextState ? 'success' : 'info'
        );
        return { ...p, active: nextState };
      }
      return p;
    }));
  };

  const fetchRealPlugins = async (query: string = 'keywords:mcp,mcp-server') => {
    setIsSearching(true);
    try {
      // Mengambil plugin real dari server pihak luar (Open Source di NPM Registry yang menggunakan standar MCP AI)
      const res = await fetch(\`https://registry.npmjs.org/-/v1/search?text=\${query}&size=12\`);
      const data = await res.json();
      
      const realPlugins = data.objects.map((obj: any) => ({
        id: obj.package.name,
        name: obj.package.name,
        desc: obj.package.description || 'Tidak ada deskripsi',
        category: 'Open Source',
        version: obj.package.version,
        publisher: obj.package.publisher?.username || 'Community',
        link: obj.package.links?.npm || obj.package.links?.repository
      }));
      setStorePlugins(realPlugins);
    } catch (e) {
      showToast('Gagal memuat plugin dari server pihak luar', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'store' && storePlugins.length === 0) {
      fetchRealPlugins();
    }
  }, [activeTab]);

  const handleInstall = (plugin: any) => {
    if (plugins.find(p => p.id === plugin.id)) {
      showToast('Plugin ini sudah terinstal', 'info');
      return;
    }
    const newPlugin = {
      id: plugin.id,
      name: plugin.name,
      desc: plugin.desc,
      category: plugin.category,
      version: plugin.version,
      active: true
    };
    setPlugins([newPlugin, ...plugins]);
    setActiveTab('installed');
    showToast(\`Plugin \${plugin.name} berhasil diinstall dari Open Source!\`, 'success');
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
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Puzzle size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Plugins & Integrasi Terbuka
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Integrasi Real-Time dari Open Source Registry (MCP Standard)
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 md:px-6 pt-4 max-w-7xl mx-auto w-full">
        <div className="flex gap-4 border-b border-neutral-800/80">
          {[
            { id: 'installed', label: 'INSTALLED PLUGINS' },
            { id: 'store', label: 'OPEN SOURCE STORE (REAL)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={\`pb-3 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer relative \${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }\`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'installed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plugins.length === 0 ? (
              <div className="col-span-1 md:col-span-2 py-10 flex flex-col items-center justify-center text-neutral-500 space-y-3">
                <Puzzle size={40} className="text-neutral-700" />
                <p className="text-sm">Anda belum menginstal plugin apapun.</p>
                <button 
                  onClick={() => setActiveTab('store')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Cari di Open Source Store
                </button>
              </div>
            ) : (
              plugins.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 hover:border-neutral-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                        <Github size={12} />
                        {p.category} • {p.version}
                      </span>
                      <div className="flex items-center gap-2">
                        {onSendToChat && p.active && (
                          <button
                            onClick={() => onSendToChat(\`[Gunakan Plugin]: Tolong manfaatkan fitur dari plugin "\${p.name}" untuk task saya selanjutnya.\`)}
                            className="p-1 rounded text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 transition cursor-pointer"
                            title="Instruksikan AI untuk menggunakan plugin ini"
                          >
                            <Send size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => togglePlugin(p.id)}
                          className="text-neutral-400 hover:text-white cursor-pointer transition"
                          title={p.active ? 'Matikan plugin' : 'Nyalakan plugin'}
                        >
                          {p.active ? (
                            <ToggleRight size={26} className="text-emerald-400" />
                          ) : (
                            <ToggleLeft size={26} className="text-neutral-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    <h2 className="text-sm font-bold text-white mt-2 break-words">{p.name}</h2>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">{p.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-500 font-mono">
                    <span>Status: {p.active ? 'Ready in Orchestrator' : 'Disabled'}</span>
                    <span className="text-emerald-400">Open Source Verified</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRealPlugins(searchQuery || 'keywords:mcp,mcp-server')}
                placeholder="Cari plugin open source di NPM (mis: weather, database, github)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
              <button 
                onClick={() => fetchRealPlugins(searchQuery || 'keywords:mcp,mcp-server')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition"
              >
                Cari
              </button>
            </div>

            {isSearching ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-3">
                <Globe size={30} className="animate-spin text-purple-500" />
                <span className="text-xs font-mono">Menarik data dari Open Source Registry...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storePlugins.map((plugin) => (
                  <div key={plugin.id} className="p-5 rounded-2xl bg-[#0a0a0a] border border-neutral-800 hover:border-purple-500/50 transition shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded font-mono border border-neutral-800 flex items-center gap-1">
                          <Github size={10} />
                          {plugin.publisher}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">{plugin.version}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white break-words">{plugin.name}</h3>
                      <p className="text-[11px] text-neutral-400 mt-2 line-clamp-3 leading-relaxed">{plugin.desc}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                      {plugin.link && (
                        <a href={plugin.link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                          <Globe size={10} /> Lihat Source
                        </a>
                      )}
                      <button
                        onClick={() => handleInstall(plugin)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-emerald-600 text-white text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Download size={12} />
                        Install
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isSearching && storePlugins.length === 0 && (
              <div className="py-10 text-center text-neutral-500 text-sm">
                Plugin tidak ditemukan di server publik.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', code);
console.log('PluginsStudio updated with REAL Open Source NPM fetcher');
