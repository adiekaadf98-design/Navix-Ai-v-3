
import React, { useState, useEffect } from 'react';
import { Puzzle, Terminal, Menu, Check, Copy, Plus, Send, ToggleLeft, ToggleRight, Download, Search, Globe, Github } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface PluginsStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
  onUpgradeClick?: () => void;
}

export const PluginsStudio: React.FC<PluginsStudioProps> = ({ onOpenSidebar, onSendToChat, onUpgradeClick }) => {
  const { user } = useAuthStore();
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
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [backendStatuses, setBackendStatuses] = useState<Record<string, 'READY' | 'DISCOVERED' | 'FAILED'>>({});

  // Sync real MCP backend server statuses
  useEffect(() => {
    fetch('/api/mcp/servers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.servers)) {
          const mapping: Record<string, 'READY' | 'DISCOVERED' | 'FAILED'> = {};
          for (const s of data.servers) {
            mapping[s.name] = s.status;
          }
          setBackendStatuses(mapping);
        }
      })
      .catch(err => console.warn('[PluginsStudio] Could not fetch MCP servers:', err));
  }, []);

  // Sinkronisasi status ke Firestore (Background Observer)
  useEffect(() => {
    if (!user || !user.firebaseUid) return;
    
    const pluginDocRef = doc(db, 'users', user.firebaseUid, 'settings', 'plugins');
    const unsubscribe = onSnapshot(pluginDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plugins && Array.isArray(data.plugins)) {
          // Update local state without triggering an infinite loop
          setPlugins(data.plugins);
          // Automatically remove installed plugins from the available store list
          setStorePlugins((prevStore) => {
             return prevStore.filter(sp => !data.plugins.find((p: any) => p.id === sp.id));
          });
        }
      }
    }, (error) => {
      console.warn("Firestore plugins sync error:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const savePluginsToFirestore = (newPlugins: any[]) => {
    if (user?.firebaseUid) {
      const pluginDocRef = doc(db, 'users', user.firebaseUid, 'settings', 'plugins');
      setDoc(pluginDocRef, { plugins: newPlugins }, { merge: true }).catch(console.error);
    }
  };

  useEffect(() => {
    localStorage.setItem('navix_plugins_list', JSON.stringify(plugins));
  }, [plugins]);

  const togglePlugin = (id: string) => {
    const newPlugins = plugins.map(p => {
      if (p.id === id) {
        const nextState = !p.active;
        showToast(
          nextState ? `Plugin ${p.name} diaktifkan` : `Plugin ${p.name} dinonaktifkan`,
          nextState ? 'success' : 'info'
        );
        return { ...p, active: nextState };
      }
      return p;
    });
    setPlugins(newPlugins);
    savePluginsToFirestore(newPlugins);
  };

  const fetchRealPlugins = async (query: string = 'keywords:mcp,mcp-server') => {
    setIsSearching(true);
    try {
      // Mengambil plugin real dari server pihak luar (Open Source di NPM Registry yang menggunakan standar MCP AI)
      const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=250`);
      const data = await res.json();
      
      const realPlugins = data.objects
        .map((obj: any) => ({
          id: obj.package.name,
          name: obj.package.name,
          desc: obj.package.description || 'Tidak ada deskripsi',
          category: 'Open Source',
          version: obj.package.version,
          publisher: obj.package.publisher?.username || 'Community',
          link: obj.package.links?.npm || obj.package.links?.repository
        }))
        .filter((rp: any) => !plugins.find((p: any) => p.id === rp.id));
        
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


  const [usage, setUsage] = useState<{plan: string} | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      fetch('/api/developer/keys?userId=' + user.id)
        .then(res => res.json())
        .then(data => {
          if (data.usage) setUsage(data.usage);
        })
        .catch(console.error);
    }
  }, [user]);

    const handleToggleSelect = (id: string) => {
    setSelectedPlugins(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlugins.length === storePlugins.length && storePlugins.length > 0) {
      setSelectedPlugins([]);
    } else {
      setSelectedPlugins(storePlugins.map(p => p.id));
    }
  };

  const handleBatchInstall = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu', 'error');
      return;
    }
    const pluginsToInstall = storePlugins.filter(p => selectedPlugins.includes(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      desc: p.desc,
      category: p.category,
      version: p.version,
      active: true
    }));
    if (pluginsToInstall.length === 0) return;

    const newPlugins = [...pluginsToInstall, ...plugins];
    setPlugins(newPlugins);
    savePluginsToFirestore(newPlugins);
    
    setStorePlugins(prev => prev.filter(p => !selectedPlugins.includes(p.id)));
    setSelectedPlugins([]);
    showToast(`${pluginsToInstall.length} Plugin berhasil diinstall dari Open Source!`, 'success');
  };

  const handleInstall = (plugin: any) => {
    if (!user) {
      showToast('Silakan login terlebih dahulu', 'error');
      return;
    }

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
    const newPlugins = [newPlugin, ...plugins];
    setPlugins(newPlugins);
    savePluginsToFirestore(newPlugins);
    // Hapus dari list store agar hilang setelah diinstall (lanjut ke plugin berikutnya)
    setStorePlugins(prev => prev.filter(p => p.id !== plugin.id));
    showToast(`Plugin ${plugin.name} berhasil diinstall dari Open Source!`, 'success');
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
              className={`pb-3 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer relative ${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
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
                            onClick={() => onSendToChat(`[Gunakan Plugin]: Tolong manfaatkan fitur dari plugin "${p.name}" untuk task saya selanjutnya.`)}
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
                  {(() => {
                    const mappedStatus = backendStatuses[p.id] || backendStatuses[p.name] || (p.active ? 'READY' : 'DISABLED');
                    const displayStatus = !p.active ? 'DISABLED' : mappedStatus;
                    return (
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[11px] font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="text-neutral-500">Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            displayStatus === 'READY'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : displayStatus === 'DISCOVERED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : displayStatus === 'FAILED'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}>
                            {displayStatus}
                          </span>
                        </span>
                        <span className="text-neutral-500">MCP Native Engine</span>
                      </div>
                    );
                  })()}
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

            {!isSearching && storePlugins.length > 0 && (
              <div className="flex items-center justify-between mb-4 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
                <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer hover:text-white transition">
                  <input 
                    type="checkbox"
                    checked={selectedPlugins.length === storePlugins.length && storePlugins.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-700 text-purple-600 focus:ring-purple-500 bg-neutral-800 accent-purple-500"
                  />
                  <span>Select All ({storePlugins.length})</span>
                </label>
                
                {selectedPlugins.length > 0 && (
                  <button
                    onClick={handleBatchInstall}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-lg flex items-center gap-2"
                  >
                    <Download size={14} />
                    Install {selectedPlugins.length} Plugin
                  </button>
                )}
              </div>
            )}

            {isSearching ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-3">
                <Globe size={30} className="animate-spin text-purple-500" />
                <span className="text-xs font-mono">Menarik data dari Open Source Registry...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storePlugins.map((plugin) => (
                  <div key={plugin.id} onClick={() => handleToggleSelect(plugin.id)} className={`cursor-pointer p-5 rounded-2xl bg-[#0a0a0a] border transition shadow-lg flex flex-col justify-between ${selectedPlugins.includes(plugin.id) ? 'border-purple-500/80 ring-1 ring-purple-500/50' : 'border-neutral-800 hover:border-purple-500/50'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={selectedPlugins.includes(plugin.id)}
                            onChange={() => {}} 
                            className="w-4 h-4 rounded border-neutral-700 text-purple-600 focus:ring-purple-500 bg-neutral-800 accent-purple-500"
                          />
                          <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded font-mono border border-neutral-800 flex items-center gap-1">
                            <Github size={10} />
                            {plugin.publisher}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">{plugin.version}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white break-words">{plugin.name}</h3>
                      <p className="text-[11px] text-neutral-400 mt-2 line-clamp-3 leading-relaxed">{plugin.desc}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                      {plugin.link && (
                        <a href={plugin.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                          <Globe size={10} /> Lihat Source
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInstall(plugin); }}
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
