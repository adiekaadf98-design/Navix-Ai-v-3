import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileAudio, 
  FileText, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Menu, 
  Layers, 
  ExternalLink,
  Plus,
  Send
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface MediaLibraryProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: string;
  source: 'uploaded' | 'ai-generated';
  date: string;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [activeSource, setActiveSource] = useState<'all' | 'uploaded' | 'ai-generated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('navix_media_vault');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_media_vault', e);
    }
    return [
    {
      id: 'm-1',
      name: 'Navix_Cyber_Sphere_8K.png',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      size: '4.2 MB',
      source: 'ai-generated',
      date: '11/09/2026'
    },
    {
      id: 'm-2',
      name: 'Cinematic_Metropolis_Drone.mp4',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31913-large.mp4',
      size: '18.6 MB',
      source: 'ai-generated',
      date: '11/09/2026'
    },
    {
      id: 'm-3',
      name: 'Technical_Analysis_SMC_Playbook.pdf',
      type: 'document',
      url: '#',
      size: '1.8 MB',
      source: 'uploaded',
      date: '10/09/2026'
    },
    {
      id: 'm-4',
      name: 'Market_Summary_Speech_Indo.wav',
      type: 'audio',
      url: '#',
      size: '850 KB',
      source: 'ai-generated',
      date: '10/09/2026'
    }
  ];
  });

  useEffect(() => {
    localStorage.setItem('navix_media_vault', JSON.stringify(mediaList));
  }, [mediaList]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type: 'image' | 'video' | 'audio' | 'document' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
        ? 'audio'
        : 'document';

      const newItem: MediaItem = {
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        source: 'uploaded',
        date: 'Baru saja'
      };

      setMediaList(prev => [newItem, ...prev]);
    }

    showToast(`${files.length} berkas berhasil diunggah ke Media Library!`, 'success');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
    showToast('Berkas dihapus dari database', 'info');
  };

  const filteredMedia = mediaList.filter(item => {
    const matchType = activeFilter === 'all' || item.type === activeFilter;
    const matchSource = activeSource === 'all' || item.source === activeSource;
    const matchSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSource && matchSearch;
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
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Folder size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Library Center
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Persistent database for all files, media, and knowledge elements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-semibold text-xs shadow-md shadow-red-950/40 border border-red-500/30 cursor-pointer active:scale-95 transition-all"
          >
            <Upload size={14} />
            <span>Upload File</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Filters by Type */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-1">
              FILTERS
            </span>
            <div className="space-y-1 pt-1">
              {[
                { id: 'all', label: 'All Files', icon: Layers },
                { id: 'image', label: 'Images', icon: ImageIcon },
                { id: 'video', label: 'Videos', icon: Video },
                { id: 'audio', label: 'Audio', icon: FileAudio },
                { id: 'document', label: 'Documents', icon: FileText }
              ].map((filter) => {
                const Icon = filter.icon;
                const isSelected = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-500/20 text-white border border-red-500/40 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <Icon size={15} className={isSelected ? 'text-red-400' : 'text-neutral-500'} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sources Filter */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-1">
              SOURCES
            </span>
            <div className="space-y-1 pt-1">
              {[
                { id: 'all', label: 'Semua Sumber' },
                { id: 'uploaded', label: 'Uploaded by me' },
                { id: 'ai-generated', label: 'AI Generated' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSource(s.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSource === s.id
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Search & Asset Cards Grid (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berkas dalam database..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/80 text-xs text-neutral-200 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-red-500/50 transition"
            />
          </div>

          {/* Assets Grid */}
          {filteredMedia.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0e1117] border border-neutral-800 text-neutral-500">
              <Folder size={36} className="mx-auto opacity-30 mb-2" />
              <p className="text-xs">Tidak ada berkas yang sesuai dengan filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 hover:border-neutral-700 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    {/* Media Preview Thumbnail */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/60 mb-3 flex items-center justify-center relative">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : item.type === 'video' ? (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      ) : item.type === 'audio' ? (
                        <FileAudio size={32} className="text-red-400" />
                      ) : (
                        <FileText size={32} className="text-blue-400" />
                      )}

                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-neutral-300 backdrop-blur-sm uppercase">
                        {item.type}
                      </span>
                    </div>

                    {/* Name & Details */}
                    <p className="text-xs font-semibold text-white truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                      <span>{item.size}</span>
                      <span className="capitalize">{item.source === 'ai-generated' ? 'Navix AI' : 'User'}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-800/60 text-xs">
                    <span className="text-[10px] text-neutral-500 font-mono">{item.date}</span>
                    <div className="flex items-center gap-1">
                      {onSendToChat && (
                        <button
                          onClick={() => onSendToChat(`[Media Dikirim]: ${item.name} (${item.type})`)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 cursor-pointer transition"
                          title="Kirim referensi ke Chat"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 cursor-pointer transition"
                        title="Hapus Berkas"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
