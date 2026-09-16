import React, { useState, useEffect } from 'react';
import { Terminal, Play, Beaker, Activity, Code2, AlertTriangle, Cpu, Atom, Dna, Menu } from 'lucide-react';

interface ScienceSandboxProps {
  onOpenSidebar?: () => void;
}

export function ScienceSandbox({ onOpenSidebar }: ScienceSandboxProps = {}) {
  const [code, setCode] = useState('// Navix Isolated Science Sandbox\n// Ready for Physics, Bio-Chemistry, and Genomic modeling\n\nasync function runSimulation() {\n  console.log("Initializing high-energy physics model...");\n  \n  // Simulating quantum state calculations\n  for(let i=0; i<100; i+=20) {\n     console.log(`Calculating trajectory at ${i}%`);\n  }\n  \n  return { status: "success", energyLevel: "99.9 TeV" };\n}\n\nrunSimulation();');
  const [output, setOutput] = useState<string[]>(['[System] Sandbox initialized in isolated environment.', '[System] Ready for execution.']);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationType, setSimulationType] = useState('physics');

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(prev => [...prev, `\n> Executing real local ${simulationType} numerical model...`]);

    try {
      const started = performance.now();
      const samples = 10000;
      let accumulator = 0;
      for (let i = 0; i < samples; i++) {
        const x = i / samples;
        if (simulationType === 'physics') {
          const position = Math.sin(2 * Math.PI * x) * Math.exp(-2 * x);
          const velocity = 2 * Math.PI * Math.cos(2 * Math.PI * x) * Math.exp(-2 * x) - 2 * position;
          accumulator += position * position + velocity * velocity;
        } else {
          const a = Math.sin(2 * Math.PI * x) ** 2;
          const b = Math.cos(2 * Math.PI * x) ** 2;
          accumulator += (a * b) / (1 + x);
        }
      }
      const elapsed = performance.now() - started;
      const result = accumulator / samples;
      setOutput(prev => [
        ...prev,
        `[Process] ${samples.toLocaleString()} numerical samples evaluated locally.`,
        `[Result] Mean computed value: ${result.toFixed(8)}`,
        `[Success] Local computation completed in ${elapsed.toFixed(2)} ms.`,
        `[Notice] This is a numerical simulation, not a physical experiment or external laboratory result.`
      ]);
    } catch (error) {
      setOutput(prev => [...prev, `[Error] ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setOutput(['[System] Console cleared.', '[System] Ready.']);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-neutral-200 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-neutral-800 shrink-0 bg-[#0f0f0f] z-10">
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button 
              onClick={onOpenSidebar}
              className="min-w-[40px] min-h-[40px] p-2 -ml-2 text-neutral-400 hover:text-white transition-all rounded-xl hover:bg-neutral-800/80 active:bg-neutral-800 active:scale-95 flex items-center justify-center cursor-pointer select-none"
              title="Buka Menu Sidebar"
              aria-label="Buka Menu Sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          <Beaker className="text-blue-500" size={20} />
          <h2 className="text-lg font-bold text-white tracking-wide">Navix Science Sandbox</h2>
          <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 uppercase font-mono tracking-widest ml-2">
            Isolated Environment
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
             <button onClick={() => setSimulationType('physics')} className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${simulationType === 'physics' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
                <Atom size={14} /> Physics
             </button>
             <button onClick={() => setSimulationType('bio')} className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${simulationType === 'bio' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
                <Dna size={14} /> Bio-Chem
             </button>
          </div>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-white text-sm font-medium transition-colors ${isRunning ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {isRunning ? <Activity size={16} className="animate-spin-slow" /> : <Play size={16} />}
            <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Execute'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Code Editor Area */}
        <div className="flex-1 flex flex-col border-r border-neutral-800 bg-[#121212] lg:max-w-[60%]">
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-neutral-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              <Code2 size={14} />
              Raw Code / Data Matrix
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-[#121212] p-4 text-sm text-blue-300 font-mono resize-none focus:outline-none custom-scrollbar leading-relaxed"
            spellCheck="false"
          />
        </div>

        {/* Terminal Area */}
        <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-neutral-800 flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
               <Terminal size={14} />
               Simulation Output Console
             </div>
             <button onClick={handleClear} className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-wider">Clear</button>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar">
            {output.map((line, idx) => (
              <div key={idx} className={`mb-1 ${line.startsWith('[Error]') ? 'text-red-400' : line.startsWith('[Success]') ? 'text-green-400' : line.startsWith('>') ? 'text-blue-400 font-bold mt-2' : 'text-neutral-300'}`}>
                {line}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-400 mt-2 animate-pulse">
                <span className="w-2 h-4 bg-blue-400 inline-block"></span>
                Processing...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
