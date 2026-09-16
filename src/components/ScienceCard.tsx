import React, { useState, useEffect } from 'react';
import { Terminal, Play, Beaker, Activity, Code2, AlertTriangle, Cpu, Atom, Dna, Search, ZoomIn, ShieldCheck, RefreshCw } from 'lucide-react';

export interface ScienceData {
  type: 'physics' | 'bio' | 'forensic' | 'chemistry' | 'quantum';
  topic: string;
  hypothesis?: string;
  labConfig?: string;
  code?: string;
}

export function ScienceCard({ data }: { data: ScienceData }) {
  const [simulationType, setSimulationType] = useState<'physics' | 'bio' | 'forensic' | 'chemistry' | 'quantum'>(data.type || 'physics');
  const [code, setCode] = useState(data.code || '');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'lab'>('editor');

  // --- INTERACTIVE SCIENTIFIC PARAMETERS & PARTICLE PHYSICS ---
  const [temperature, setTemperature] = useState(450); // Kelvin or Collision eV
  const [multiplier, setMultiplier] = useState(1.5);   // Multiplier level
  const [particles, setParticles] = useState<{x: number; y: number; vx: number; vy: number; color: string}[]>([]);

  useEffect(() => {
    // Re-seed particles based on simulation type
    const list = [];
    const colors = 
      simulationType === 'physics' ? ['#ef4444', '#f59e0b', '#f43f5e'] :
      simulationType === 'bio' ? ['#10b981', '#34d399', '#059669'] :
      simulationType === 'forensic' ? ['#3b82f6', '#06b6d4', '#60a5fa'] :
      ['#8b5cf6', '#a78bfa', '#ec4899'];
      
    for (let i = 0; i < 20; i++) {
      list.push({
        x: Math.random() * 260 + 20,
        y: Math.random() * 100 + 20,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color: colors[i % colors.length]
      });
    }
    setParticles(list);
  }, [simulationType]);

  useEffect(() => {
    if (!isRunning) return;
    let animId: number;
    const speedMultiplier = temperature / 300; // Speed changes based on active temperature slider!
    
    const update = () => {
      setParticles(prev => prev.map(p => {
        let nextX = p.x + p.vx * speedMultiplier;
        let nextY = p.y + p.vy * speedMultiplier;
        let nextVx = p.vx;
        let nextVy = p.vy;
        
        // Bounce off SVG bounding box (300 x 140)
        if (nextX <= 8 || nextX >= 292) {
          nextVx = -nextVx;
        }
        if (nextY <= 8 || nextY >= 132) {
          nextVy = -nextVy;
        }
        
        return {
          ...p,
          x: Math.max(8, Math.min(292, nextX)),
          y: Math.max(8, Math.min(132, nextY)),
          vx: nextVx,
          vy: nextVy
        };
      }));
      animId = requestAnimationFrame(update);
    };
    
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, temperature]);

  // Initialize code when simulation type changes
  useEffect(() => {
    if (!data.code) {
      if (simulationType === 'physics') {
        setCode(
          `// Navix High-Energy Physics & Trajectory Simulator\n// Topic: ${data.topic || 'Analisis Partikel Baru'}\n\nasync function simulateCollision() {\n  const beamEnergy = "13.6 TeV";\n  console.log("-> Menghidupkan Synchrotron Accelerator...");\n  console.log("-> Mengatur energi tabrakan pada: " + beamEnergy);\n  \n  let particleCount = 0;\n  for (let i = 0; i <= 100; i += 25) {\n    await sleep(200);\n    console.log("   [Sensor] Magnetik fokus diatur pada " + i + "%");\n  }\n  \n  return {\n    detectedBosons: 3.2e4,\n    luminosity: "2.1 nb-1/s",\n    status: "Partikel Baru Terdeteksi (Anomali Massa)"\n  };\n}`
        );
      } else if (simulationType === 'bio') {
        setCode(
          `// Navix Genome Splicer & Molecular Modeling\n// Topic: ${data.topic || 'Rekayasa Rantai DNA'}\n\nasync function sequenceDNA() {\n  console.log("-> Mengurai rantai heliks ganda DNA...");\n  console.log("-> Menganalisis urutan nukleotida Adenin, Sitosin, Guanin, Timin...");\n  \n  const basePairs = 42e6;\n  console.log("-> Menyaring variasi genetik tidak normal...");\n  \n  return {\n    recombinantStability: "98.4%",\n    mutagenicIndex: "0.001%",\n    helixMatch: "Sempurna (Uji Klinis Direkomendasikan)"\n  };\n}`
        );
      } else if (simulationType === 'forensic' || simulationType === 'quantum') {
        setCode(
          `// Navix Detective Case & Forensic Analyzer\n// Topic: ${data.topic || 'Investigasi Bukti Forensik'}\n\nasync function investigateCase() {\n  console.log("-> Membuka modul investigasi detektif sains...");\n  console.log("-> Menganalisis berkas bukti terenkripsi...");\n  console.log("-> Mengkalibrasi spektrometer massa untuk residu senyawa...");\n  \n  const confidence = "99.8%";\n  return {\n    suspectMatching: "99.2%",\n    chemicalSignature: "Sianida Hidrat",\n    findings: "Sangat Cocok dengan TKP (Tindak Kriminal Terkonfirmasi)"\n  };\n}`
        );
      } else {
        setCode(
          `// Navix Chemical Reaction Sandbox\n// Topic: ${data.topic || 'Sintesis Senyawa Baru'}\n\nasync function simulateReaction() {\n  console.log("-> Memasukkan reagen ke dalam tabung reaksi virtual...");\n  console.log("-> Mengatur suhu reaktor di 450 Kelvin...");\n  \n  return {\n    yieldEfficiency: "92.1%",\n    byproducts: "H2O, CO2",\n    thermodynamics: "Eksotermik (Melepaskan Energi)"\n  };\n}`
        );
      }
    }
  }, [simulationType, data.topic]);

  // Set initial output based on data
  useEffect(() => {
    setOutput([
      `[Sistem] Mesin Penelitian Navix AI aktif.`,
      `[Topik] ${data.topic}`,
      `[Hipotesis] ${data.hypothesis || 'Mengeksplorasi penemuan sains baru yang belum terpetakan.'}`,
      `[Laboratorium] ${data.labConfig || 'Kalibrator Otomatis Multitensor Terpadu'}`,
      `[Sistem] Konsol siap melakukan simulasi.`
    ]);
  }, [data.topic, data.hypothesis, data.labConfig]);

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setOutput(prev => [...prev, `\n> Memulai simulasi penelitian: ${simulationType.toUpperCase()}...`]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(100, step * 20));

      if (step === 1) {
        setOutput(prev => [...prev, `[Proses] Mengalokasikan sumber daya laboratorium virtual...`]);
      }
      if (step === 2) {
        setOutput(prev => [
          ...prev,
          `[Proses] Menghubungkan instrumen: ${data.labConfig || 'Sensor Spektrometer Navix'}`
        ]);
      }
      if (step === 3) {
        setOutput(prev => [...prev, `[Proses] Mengeksekusi data logika / matriks penelitian sains...`]);
      }
      if (step === 4) {
        setOutput(prev => [...prev, `[Proses] Memeriksa konsistensi hasil terhadap database riset dunia...`]);
      }
      if (step === 5) {
        let results = '';
        if (simulationType === 'physics') {
          results = `Hasil: Tabrakan Partikel Stabil. Boson terdeteksi pada 125.09 GeV. Sinyal deviasi 5.1 sigma didapatkan!`;
        } else if (simulationType === 'bio') {
          results = `Hasil: Rantai DNA direkonstruksi. Stabilitas hibridisasi genetik mencapai 99.1%. Patogen dinonaktifkan!`;
        } else if (simulationType === 'forensic') {
          results = `Hasil: Analisis detektif forensik selesai. Bukti residu kimia 100% akurat. Kasus terpecahkan secara ilmiah!`;
        } else {
          results = `Hasil: Reaksi senyawa kimia mencapai titik kesetimbangan maksimal. Efisiensi sintesis 94.6%.`;
        }

        setOutput(prev => [
          ...prev,
          `[Metrik] Akurasi Analisis: 99.87%`,
          `[Sukses] ${results}`,
          `[Sistem] Simulasi selesai dengan sukses.`
        ]);
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 650);
  };

  const handleClear = () => {
    setOutput([`[Sistem] Konsol dibersihkan.`, `[Sistem] Laboratorium siap.`]);
  };

  return (
    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-full font-sans my-4">
      
      {/* Header */}
      <div className="bg-[#161616] flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-neutral-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/15 p-2 rounded-xl border border-blue-500/30">
            <Beaker className="text-blue-500 animate-pulse" size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 tracking-wide uppercase flex items-center gap-2">
              Navix Research & Lab Engine <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30">RESEARCH_V3</span>
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mt-0.5">Global Investigation & Detective Simulation Sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 border border-neutral-800 self-end sm:self-auto">
          <button 
            onClick={() => setSimulationType('physics')} 
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md flex items-center gap-1.5 transition-colors ${simulationType === 'physics' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            <Atom size={12} /> Fisika
          </button>
          <button 
            onClick={() => setSimulationType('bio')} 
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md flex items-center gap-1.5 transition-colors ${simulationType === 'bio' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            <Dna size={12} /> Biologi
          </button>
          <button 
            onClick={() => setSimulationType('forensic')} 
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md flex items-center gap-1.5 transition-colors ${simulationType === 'forensic' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            <Search size={12} /> Detektif
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        
        {/* Topic and Hypothesis Card */}
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider block mb-1">Topik Penelitian</span>
              <p className="text-sm font-semibold text-white leading-snug">{data.topic}</p>
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider block mb-1">Hipotesis Detektif / Riset</span>
              <p className="text-xs text-neutral-300 leading-relaxed italic">"{data.hypothesis || 'Mengeksplorasi misteri sains baru.'}"</p>
            </div>
          </div>
          <div className="border-t border-neutral-800/60 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Cpu size={14} className="text-neutral-500" />
              Instrumen Lab: <strong className="text-neutral-200">{data.labConfig || 'Quantum Mass Spectrometer'}</strong>
            </span>
            <span className="text-neutral-500 font-mono text-[10px]">RESEARCH_MATRIX_LIVE: OK</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-800">
          <button 
            onClick={() => setActiveTab('editor')} 
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'editor' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            Raw Code / Formula
          </button>
          <button 
            onClick={() => setActiveTab('lab')} 
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'lab' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            Virtual Console & Lab Logs
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'editor' ? (
          <div className="flex flex-col border border-neutral-800 rounded-xl overflow-hidden bg-[#121212]">
            <div className="px-3 py-1.5 bg-[#171717] border-b border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Code2 size={12} /> Script Editor</span>
              <span>Isolated VM Environment</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-44 bg-[#0a0a0a] p-3 text-xs text-blue-300 font-mono resize-none focus:outline-none custom-scrollbar leading-relaxed"
              spellCheck="false"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Interactive Split Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Live Particle Physics SVG Canvas */}
              <div className="lg:col-span-5 flex flex-col border border-neutral-800 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <div className="px-3 py-1.5 bg-[#171717] border-b border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Activity size={12} className="text-blue-500 animate-pulse" /> Live Lab Visualizer</span>
                  <span className="text-[9px] text-green-400 animate-pulse">● TELEMETRY</span>
                </div>
                
                {/* SVG Particle Simulator Box */}
                <div className="relative w-full h-44 bg-neutral-950 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 140">
                    {/* Background Grid Lines */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#262626" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="300" height="140" fill="url(#grid)" />
                    
                    {/* Magnetic Focus Rings for Physics, Bio helix structure for Biologi */}
                    {simulationType === 'physics' && (
                      <>
                        <circle cx="150" cy="70" r="45" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow opacity-25" />
                        <circle cx="150" cy="70" r="25" fill="none" stroke="#f59e0b" strokeWidth="0.5" className="opacity-15" />
                      </>
                    )}

                    {simulationType === 'bio' && (
                      <path d="M 10,70 Q 75,30 150,70 T 290,70 M 10,70 Q 75,110 150,70 T 290,70" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" className="opacity-25" />
                    )}

                    {simulationType === 'forensic' && (
                      <g className="opacity-25">
                        <circle cx="150" cy="70" r="30" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                        <line x1="150" y1="20" x2="150" y2="120" stroke="#3b82f6" strokeWidth="0.5" />
                        <line x1="80" y1="70" x2="220" y2="70" stroke="#3b82f6" strokeWidth="0.5" />
                      </g>
                    )}

                    {/* Laser Particle Beam Collision Lines */}
                    {isRunning && (
                      <g>
                        <line x1="0" y1="70" x2="300" y2="70" stroke="rgba(59, 130, 246, 0.4)" strokeWidth={multiplier * 2} className="animate-pulse" />
                        <circle cx="150" cy="70" r={multiplier * 12} fill="rgba(239, 68, 68, 0.15)" className="animate-ping" />
                      </g>
                    )}

                    {/* Moving Live Particles */}
                    {particles.map((p, idx) => (
                      <circle 
                        key={idx} 
                        cx={p.x} 
                        cy={p.y} 
                        r={simulationType === 'bio' ? 3.5 : 4} 
                        fill={p.color} 
                        className="transition-transform duration-100 shadow-md"
                        opacity={0.85}
                        style={{ filter: 'drop-shadow(0px 0px 4px ' + p.color + ')' }}
                      />
                    ))}
                  </svg>

                  {/* Absolute Corner Stats Overlay */}
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-neutral-500 uppercase">
                    Temp: {temperature}K | Focus: {(multiplier * 100).toFixed(0)}%
                  </div>
                  {!isRunning && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider animate-pulse flex items-center gap-1.5 bg-[#141414] border border-neutral-800 px-3 py-1.5 rounded-lg">
                        <Beaker size={12} className="text-blue-400" /> Tekan 'Jalankan' Untuk Simulasi
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Output Log */}
              <div className="lg:col-span-7 flex flex-col border border-neutral-800 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <div className="px-3 py-1.5 bg-[#171717] border-b border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Terminal size={12} /> Output Log Terminal</span>
                  <button onClick={handleClear} className="text-red-400 hover:text-red-300 font-bold">Clear Logs</button>
                </div>
                <div className="w-full h-44 p-3 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar space-y-1">
                  {output.map((line, idx) => (
                    <div key={idx} className={
                      line.startsWith('[Sukses]') ? 'text-green-400 font-semibold' :
                      line.startsWith('[Error]') ? 'text-red-400 font-semibold' :
                      line.startsWith('[Topik]') || line.startsWith('[Hipotesis]') ? 'text-blue-400' :
                      line.startsWith('>') ? 'text-cyan-400 font-bold mt-1.5' : 'text-neutral-300'
                    }>
                      {line}
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-2 text-blue-400 mt-1.5 animate-pulse">
                      <span className="w-1.5 h-3 bg-blue-400 inline-block"></span>
                      Proses Simulasi Laboratorium...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Parametric Controls Block */}
            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase mb-1.5">
                  <span>Energi Termal / Kecepatan Tabrakan</span>
                  <span className="text-blue-400 font-mono">{temperature} K / TeV</span>
                </div>
                <input 
                  type="range" 
                  min="150" 
                  max="1200" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 bg-neutral-800 rounded-lg appearance-none"
                />
                <span className="text-[8px] text-neutral-600 font-mono mt-1 block">Mempengaruhi laju kinetik partikel di canvas</span>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase mb-1.5">
                  <span>Rasio Fokus Magnetik / Konsentrasi</span>
                  <span className="text-blue-400 font-mono">{(multiplier * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1"
                  value={multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 bg-neutral-800 rounded-lg appearance-none"
                />
                <span className="text-[8px] text-neutral-600 font-mono mt-1 block">Mengatur ketebalan tembakan sinar laser fokus</span>
              </div>
            </div>
          </div>
        )}

        {/* Execution and Progress */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131313] border border-neutral-800 rounded-xl p-3">
          <div className="flex-1 w-full space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500">
              <span>Simulasi Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/60">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-blue-500/50 shadow-lg ${isRunning ? 'bg-blue-600/30 cursor-not-allowed border-transparent' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isRunning ? 'Sedang Simulasi...' : 'Jalankan Simulasi'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
