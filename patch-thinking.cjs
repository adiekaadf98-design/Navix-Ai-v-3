const fs = require('fs');
let code = fs.readFileSync('src/components/ThinkingIndicator.tsx', 'utf8');

// Replace the simple active/inactive dots with a more premium glowing indicator
const nodeTarget = `                          {/* Node Indikator Tahap */}
                          <div className={\`relative shrink-0 w-5 h-5 rounded-full flex items-center justify-center z-10 mt-0.5 transition-all duration-300 \${
                            isCompleted
                              ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                              : isActive
                              ? 'bg-red-950/80 border border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] scale-110'
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-600'
                          }\`}>
                            {isCompleted ? (
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            ) : isActive ? (
                              <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                            )}
                          </div>`;

const nodeReplacement = `                          {/* Node Indikator Tahap (Premium) */}
                          <div className="relative shrink-0 z-10 mt-0.5">
                             {isActive && (
                               <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-[6px] animate-pulse" />
                             )}
                             <div className={\`relative w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 \${
                               isCompleted
                                 ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                 : isActive
                                 ? 'bg-gradient-to-br from-purple-500/20 to-indigo-900/40 border border-purple-500/70 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-125'
                                 : 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-600'
                             }\`}>
                               {isCompleted ? (
                                 <Check className="w-3 h-3 stroke-[2.5]" />
                               ) : isActive ? (
                                 <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                               ) : (
                                 <div className="w-1.5 h-1.5 rounded-full bg-neutral-700/80" />
                               )}
                             </div>
                          </div>`;

if (code.includes(nodeTarget)) {
  code = code.replace(nodeTarget, nodeReplacement);
}

const colorReplace1 = `text-red-400`;
const colorReplace2 = `text-purple-400`;

code = code.split(colorReplace1).join(colorReplace2);

const borderReplace1 = `border-red-500`;
const borderReplace2 = `border-purple-500`;
code = code.split(borderReplace1).join(borderReplace2);

const pulseTarget = `bg-red-950/80 text-red-300 border border-red-800/50`;
const pulseReplacement = `bg-purple-900/30 text-purple-300 border border-purple-700/50 shadow-[0_0_8px_rgba(168,85,247,0.2)]`;
code = code.split(pulseTarget).join(pulseReplacement);

const connectingLineTarget = `bg-red-500/30`;
const connectingLineReplacement = `bg-purple-500/50 shadow-[0_0_5px_rgba(168,85,247,0.5)]`;
code = code.split(connectingLineTarget).join(connectingLineReplacement);

// Change the main "Sedang Berpikir" header
const thinkingHeaderTarget = `<span className="text-purple-400 font-semibold">Sedang Berpikir...</span>`;
const thinkingHeaderReplacement = `<span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-bold tracking-wide flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                          </span>
                          Mesin Kognitif Aktif...
                        </span>`;

code = code.split(thinkingHeaderTarget).join(thinkingHeaderReplacement);

fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
