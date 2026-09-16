import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Code2, 
  Menu, 
  Search, 
  Sliders, 
  Zap,
  Globe
} from 'lucide-react';
import { showToast } from '../../utils/toast';

interface AIAgentsStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
  onLaunchAgent: (agentName: string, systemPrompt: string, welcomeMsg: string) => void;
}

interface AgentPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  systemPrompt: string;
  welcomeMessage: string;
}

export const AIAgentsStudio: React.FC<AIAgentsStudioProps> = ({ onOpenSidebar, onLaunchAgent }) => {
  const [activeTab, setActiveTab] = useState<'my-agents' | 'explore-store' | 'agent-builder'>('my-agents');

  // Custom builder state
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentPrompt, setNewAgentPrompt] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(['WEB_SEARCH', 'READ']);

  const [agents, setAgents] = useState<AgentPersona[]>(() => {
    try {
      const saved = localStorage.getItem('navix_ai_agents');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_ai_agents', e);
    }
    return [
    {
      id: 'agent-1',
      name: 'Navix Market Analyst',
      role: 'Financial & SMC Quant Specialist',
      description: 'Menganalisis pergerakan harga komoditas forex, kripto, emas secara kuantitatif dengan Smart Money Concepts.',
      tools: ['WEB_SEARCH', 'GET_ECONOMIC_CALENDAR', 'READ', 'WRITE'],
      systemPrompt: 'Anda adalah Navix Market Analyst, AI ahli kuantitatif pasar global, spesialis Smart Money Concepts (SMC), ChoCh, BOS, dan mitigasi risiko trading. Berikan analisis berbasis data real-time dan kalkulasi rasio Risk:Reward presisi.',
      welcomeMessage: 'Halo, saya Navix Market Analyst. Aset komoditas, forex, atau kripto mana yang ingin kita bedah struktur pasarnya hari ini?'
    },
    {
      id: 'agent-2',
      name: 'Cybernetic Security Auditor',
      role: 'OWASP & Smart Contract Auditor',
      description: 'Menganalisis keamanan kode, memeriksa kerentanan OWASP, audit smart contract, dan menyusun mitigasi patch.',
      tools: ['WEB_SEARCH', 'READ'],
      systemPrompt: 'Anda adalah Cybernetic Security Auditor, AI spesialis audit keamanan siber, analisis celah keamanan kode, pentesting otomatis, dan verifikasi standar OWASP Top 10.',
      welcomeMessage: 'Sistem pertahanan aktif. Kirimkan potongan kode, arsitektur, atau endpoint API yang perlu diaudit keamanannya.'
    },
    {
      id: 'agent-3',
      name: 'Quantum Bio-Researcher',
      role: 'Molecular & Physics Computation',
      description: 'Simulasi komputasi molekuler, bio-kimia, formulasi matematika, dan algoritma fisika kuantum.',
      tools: ['CODE_INTERPRETER', 'PYTHON_SANDBOX', 'DATA_VISUALIZER'],
      systemPrompt: 'Anda adalah Quantum Bio-Researcher, spesialis simulasi algoritma bio-kimia, permodelan kuantum, dan penyusunan paper standar IMRaD.',
      welcomeMessage: 'Laboratorium riset kuantum siap. Parameter formula atau hipotesis apa yang ingin kita uji?'
    }
  ];
  });

  useEffect(() => {
    localStorage.setItem('navix_ai_agents', JSON.stringify(agents));
  }, [agents]);

  const availableCapabilities = [
    'WEB_SEARCH', 
    'GET_ECONOMIC_CALENDAR', 
    'READ', 
    'WRITE', 
    'CODE_INTERPRETER', 
    'PYTHON_SANDBOX', 
    'DATA_VISUALIZER', 
    'GITHUB_CONNECTOR'
  ];

  const handleToggleCapability = (cap: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentPrompt.trim()) {
      showToast('Nama agen dan system prompt wajib diisi', 'error');
      return;
    }

    const created: AgentPersona = {
      id: `agent-${Date.now()}`,
      name: newAgentName.trim(),
      role: newAgentRole.trim() || 'Custom Neural Agent',
      description: newAgentDesc.trim() || 'Custom neural agent persona dibuat oleh developer.',
      tools: selectedCapabilities,
      systemPrompt: newAgentPrompt.trim(),
      welcomeMessage: `Halo! Saya ${newAgentName}. Siap membantu tugas spesifik Anda.`
    };

    setAgents(prev => [created, ...prev]);
    setNewAgentName('');
    setNewAgentRole('');
    setNewAgentDesc('');
    setNewAgentPrompt('');
    setActiveTab('my-agents');
    showToast(`Persona AI Agent '${created.name}' berhasil dideploy!`, 'success');
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgents(prev => prev.filter(a => a.id !== id));
    showToast('Agen berhasil dihapus', 'info');
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
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              System
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Deploy, build, and configure highly-specialized neural personas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('agent-builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-red-950/50"
          >
            <Plus size={14} />
            <span>Agent Builder</span>
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="px-4 md:px-6 pt-4 max-w-7xl mx-auto w-full">
        <div className="flex gap-4 border-b border-neutral-800/80">
          {[
            { id: 'my-agents', label: 'MY AGENTS' },
            { id: 'explore-store', label: 'EXPLORE STORE' },
            { id: 'agent-builder', label: 'AGENT BUILDER' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer relative ${
                activeTab === tab.id
                  ? 'text-red-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'my-agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 hover:border-neutral-700 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">
                          {agent.name}
                        </h2>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {agent.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteAgent(agent.id, e)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition cursor-pointer"
                      title="Hapus Persona"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Capabilities Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {agent.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onLaunchAgent(agent.name, agent.systemPrompt, agent.welcomeMessage)}
                  className="w-full min-h-[42px] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-neutral-800 to-neutral-800/90 hover:from-red-600 hover:to-rose-600 text-neutral-200 hover:text-white border border-neutral-700/60 hover:border-red-500/40 transition-all cursor-pointer active:scale-[0.98] shadow-md"
                >
                  <Play size={13} className="fill-current" />
                  <span>Launch Agent Session</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'explore-store' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-400">
              Galeri neural personas resmi yang telah dioptimalkan oleh Navix Labs:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Full-Stack TypeScript Guru', role: 'Architect', desc: 'Arsitektur clean code, React 19, Vite, Tailwind CSS, dan microservices.', tools: ['CODE_GEN', 'LINT'] },
                { name: 'Pine Script v5 Quant', role: 'TradingView Dev', desc: 'Penyusunan indikator teknikal kustom, backtesting, dan alert webhook.', tools: ['PINESCRIPT', 'BACKTEST'] },
                { name: 'Legal & Contract Analyst', role: 'Document Compliance', desc: 'Analisis pasal kontrak bisnis, klausul NDA, dan kepatuhan regulasi.', tools: ['DOC_ANALYZER'] },
                { name: 'Data Scientist & ML Engineer', role: 'Statistical Model', desc: 'Pembersihan data tabular, visualisasi grafik, dan pelatihan regresi.', tools: ['DATA_VIZ', 'PYTHON'] }
              ].map((storeAgent, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-800 text-amber-400">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{storeAgent.name}</h3>
                      <span className="text-[10px] text-neutral-500">{storeAgent.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{storeAgent.desc}</p>
                  <button
                    onClick={() => {
                      const newA: AgentPersona = {
                        id: `store-${Date.now()}-${idx}`,
                        name: storeAgent.name,
                        role: storeAgent.role,
                        description: storeAgent.desc,
                        tools: storeAgent.tools,
                        systemPrompt: `Anda adalah ${storeAgent.name}. Berikan hasil kelas dunia.`,
                        welcomeMessage: `Halo, ${storeAgent.name} siap beraksi.`
                      };
                      setAgents(prev => [newA, ...prev]);
                      setActiveTab('my-agents');
                      showToast(`Persona '${storeAgent.name}' ditambahkan ke koleksi Anda!`, 'success');
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-red-600 text-neutral-300 hover:text-white border border-neutral-800 transition cursor-pointer"
                  >
                    Pasang ke My Agents
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'agent-builder' && (
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-neutral-800 pb-3">
              Rancang Neural Agent Kustom
            </h2>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-400">NAMA AGENT</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Navix Macro Economist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 text-xs text-white border border-neutral-800 focus:outline-none focus:border-red-500/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-400">PERAN / SPESIALISASI</label>
                <input
                  type="text"
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  placeholder="e.g. Macro Trend Specialist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 text-xs text-white border border-neutral-800 focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-400">DESKRIPSI SINGKAT</label>
                <input
                  type="text"
                  value={newAgentDesc}
                  onChange={(e) => setNewAgentDesc(e.target.value)}
                  placeholder="Deskripsi tugas dan kapabilitas agen..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 text-xs text-white border border-neutral-800 focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-400">SYSTEM PROMPT (INSTRUKSI UTAMA)</label>
                <textarea
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  rows={4}
                  placeholder="Instruksikan pola pikir, batasan domain, format respon, dan kepribadian neural agent..."
                  className="w-full p-3.5 rounded-xl bg-neutral-950 text-xs text-white border border-neutral-800 focus:outline-none focus:border-red-500/60 resize-none font-mono"
                  required
                />
              </div>

              {/* Tool Capabilities selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-neutral-400">AKTIFKAN TOOL CAPABILITIES</label>
                <div className="flex flex-wrap gap-2">
                  {availableCapabilities.map((cap) => {
                    const isSelected = selectedCapabilities.includes(cap);
                    return (
                      <button
                        type="button"
                        key={cap}
                        onClick={() => handleToggleCapability(cap)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-mono transition cursor-pointer ${
                          isSelected
                            ? 'bg-red-500/20 text-red-400 border-red-500/50 font-bold'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                        }`}
                      >
                        {cap}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white shadow-lg shadow-red-950/50 cursor-pointer transition"
                >
                  Deploy Persona ke System
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
