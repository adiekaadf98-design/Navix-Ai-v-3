import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  FolderPlus, 
  CheckCircle2, 
  Layers, 
  Menu, 
  ShieldCheck, 
  Users, 
  HardDrive, 
  ArrowRight,
  Plus,
  Trash2,
  Send
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface ProjectsIsolationStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface ProjectData {
  id: string;
  name: string;
  category: string;
  sessions: number;
  storage: string;
  created: string;
  description: string;
}

const DEFAULT_PROJECTS: ProjectData[] = [
  {
    id: 'proj-1',
    name: 'Default Workspace (Personal Alpha)',
    category: 'Personal Alpha',
    sessions: 42,
    storage: '88 MB',
    created: '11/09/2026',
    description: 'Ruang kerja default untuk riset harian, eksplorasi persona, dan obrolan instan.'
  }
];

export const ProjectsIsolationStudio: React.FC<ProjectsIsolationStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem('navix_active_isolation_project') || 'proj-1';
  });

  const [projects, setProjects] = useState<ProjectData[]>(() => {
    try {
      const saved = localStorage.getItem('navix_isolation_projects');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load projects', e);
    }
    return DEFAULT_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem('navix_isolation_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('navix_active_isolation_project', activeProjectId);
  }, [activeProjectId]);

  const handleSelectProject = (id: string, name: string) => {
    setActiveProjectId(id);
    showToast(`Beralih ke ruang kerja: '${name}'`, 'success');
  };

  const handleCreateProject = () => {
    const name = prompt('Nama Proyek / Ruang Kerja Baru:');
    if (!name) return;

    const newP: ProjectData = {
      id: `proj-${Date.now()}`,
      name,
      category: 'Isolated Sandbox',
      sessions: 0,
      storage: '0 KB',
      created: new Date().toLocaleDateString('id-ID'),
      description: 'Ruang kerja terisolasi baru.'
    };

    setProjects(prev => [newP, ...prev]);
    setActiveProjectId(newP.id);
    showToast(`Proyek '${name}' berhasil dibuat dan diaktifkan!`, 'success');
  };

  const handleDeleteProject = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      showToast('Minimal harus ada satu ruang kerja.', 'error');
      return;
    }
    if (confirm(`Hapus proyek '${name}' secara permanen?`)) {
      setProjects(prev => {
        const filtered = prev.filter(p => p.id !== id);
        if (activeProjectId === id && filtered.length > 0) {
          setActiveProjectId(filtered[0].id);
        }
        return filtered;
      });
      showToast('Proyek berhasil dihapus.', 'info');
    }
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
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Boxes size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Projects & Sandbox Isolation
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Lingkungan kerja terisolasi untuk data, token keys, history session, dan tim collaboration
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-blue-950/50"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Buat Proyek Baru</span>
          <span className="sm:hidden">Buat</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const isActive = activeProjectId === proj.id;
            return (
              <div
                key={proj.id}
                className={`p-5 rounded-2xl bg-[#0e1117] border transition-all shadow-xl flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'border-blue-500/80 shadow-blue-950/30'
                    : 'border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-blue-400 border border-blue-500/30">
                      {proj.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {onSendToChat && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendToChat(`[Proyek / Sandbox]: Tolong bantu saya mengelola proyek "${proj.name}".`);
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 transition cursor-pointer"
                          title="Kirim ke Chat Utama"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span>ACTIVE PROJECT</span>
                        </span>
                      )}
                      {!isActive && (
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, proj.name, e)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition"
                          title="Hapus Proyek"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="text-sm font-bold text-white mt-2.5">{proj.name}</h2>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-800/60 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} className="text-neutral-500" />
                      <span>{proj.sessions} Sessions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive size={13} className="text-neutral-500" />
                      <span>{proj.storage} Stored</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectProject(proj.id, proj.name)}
                  disabled={isActive}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 cursor-default'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  {isActive ? 'Ruang Kerja Aktif Saat Ini' : 'Beralih ke Proyek Ini'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

