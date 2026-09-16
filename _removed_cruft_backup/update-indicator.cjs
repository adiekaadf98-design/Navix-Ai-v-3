const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronRight, Loader2, Sparkles, Search, Globe, Smartphone, Compass, AlertCircle } from 'lucide-react';
import { EffortLevel, TaskPlan, ToolBudget } from '../services/ThinkingEngine';

interface ThinkingIndicatorProps {
  effort: EffortLevel;
  taskType: string;
  plan?: TaskPlan | null;
  budget?: ToolBudget | null;
  completedSteps?: string[];
  currentStep?: string | null;
  isThinking: boolean;
}

export function ThinkingIndicator({
  effort = 'medium',
  taskType,
  plan,
  budget,
  completedSteps = [],
  currentStep,
  isThinking
}: ThinkingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(isThinking);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  // Research state
  const [isResearch, setIsResearch] = useState(false);
  const [researchData, setResearchData] = useState<any>(null);

  // Timer counter during thinking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isThinking) {
      setIsExpanded(true);
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setIsExpanded(false);
      // Fast forward research if finished
      if (researchData) {
         setResearchData((prev: any) => ({
             ...prev,
             progress: 100,
             websites: prev.websites.map((w: any) => ({ ...w, status: 'Verified' })),
             apps: prev.apps.map((a: any) => ({ ...a, status: 'Verified' })),
             path: ['Request', 'Search', 'Web', 'App Analysis', 'Verification', 'Answer']
         }));
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isThinking]);

  // Research Simulation Effect
  useEffect(() => {
    if (isThinking && plan?.goal) {
      const researchMatch = /(cari|search|web|aplikasi|apk|dokumentasi|api|analisis|riset|informasi)/i.test(plan.goal);
      if (researchMatch) {
        setIsResearch(true);
        let keywords = plan.goal.replace(/(tolong|carikan|analisis|aplikasi|apk|website|dokumentasi|cari)/ig, '').trim();
        if (keywords.length < 3) keywords = plan.goal;
        
        let targetWebsites = [
          { domain: 'developers.google.com', task: 'Membaca dokumentasi', status: 'Searching' },
          { domain: 'github.com', task: 'Referensi ditemukan', status: 'Searching' },
          { domain: 'platform.openai.com', task: 'Memeriksa API', status: 'Searching' }
        ];
        
        let targetApps = [
          { name: 'Public Analytics App', task: 'Menganalisis fitur publik', status: 'Searching' }
        ];

        // Custom domain mapping based on keywords
        if (keywords.toLowerCase().includes('react') || keywords.toLowerCase().includes('next')) {
           targetWebsites[2] = { domain: 'react.dev', task: 'Membaca hooks API', status: 'Searching' };
        } else if (keywords.toLowerCase().includes('crypto') || keywords.toLowerCase().includes('bitcoin')) {
           targetWebsites = [
              { domain: 'coinmarketcap.com', task: 'Memeriksa harga', status: 'Searching' },
              { domain: 'binance.com', task: 'Membaca orderbook', status: 'Searching' },
              { domain: 'coindesk.com', task: 'Memeriksa berita', status: 'Searching' }
           ];
           targetApps = [
              { name: 'TradingView', task: 'Menganalisis chart publik', status: 'Searching' }
           ];
        }

        setResearchData({
          status: 'Researching',
          query: keywords,
          websites: targetWebsites,
          apps: targetApps,
          path: ['Request'],
          progress: 0
        });
      } else {
        setIsResearch(false);
      }
    }
  }, [isThinking, plan?.goal]);

  useEffect(() => {
    if (!isThinking || !isResearch || !researchData) return;
    
    // Simulate progression
    const interval = setInterval(() => {
      setResearchData((prev: any) => {
        if (prev.progress >= 95) {
           return prev; // Wait for actual completion to hit 100
        }
        
        const newProgress = Math.min(95, prev.progress + Math.floor(Math.random() * 10) + 2);
        
        // Update path based on progress
        const newPath = ['Request'];
        if (newProgress > 10) newPath.push('Search');
        if (newProgress > 30) newPath.push('Web');
        if (newProgress > 50) newPath.push('App Analysis');
        if (newProgress > 70) newPath.push('Verification');
        
        // Update website statuses
        const updateStatuses = (items: any[]) => items.map((item, idx) => {
           const threshold = (idx + 1) * 20;
           if (newProgress > threshold + 20) return { ...item, status: 'Verified' };
           if (newProgress > threshold + 10) return { ...item, status: 'Analyzing' };
           if (newProgress > threshold) return { ...item, status: 'Reading' };
           if (newProgress > threshold - 10) return { ...item, status: 'Opening' };
           return item;
        });

        return {
          ...prev,
          progress: newProgress,
          path: newPath,
          websites: updateStatuses(prev.websites),
          apps: updateStatuses(prev.apps)
        };
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isThinking, isResearch]);

  const stepsList = (plan?.steps && plan.steps.length > 0) ? plan.steps : [
    'Memahami instruksi & konteks',
    'Menganalisis data & memori Navix',
    'Merumuskan jawaban terbaik...',
    'Finalisasi respons'
  ];

  const headerLabel = isThinking 
    ? \`Thinking... (\${elapsedSeconds}s)\`
    : \`Thought for \${elapsedSeconds > 0 ? elapsedSeconds : 2}s\`;

  const renderStatusIcon = (status: string) => {
    switch(status) {
      case 'Searching':
      case 'Opening':
        return <Loader2 className="w-3.5 h-3.5 text-neutral-500 animate-spin" />;
      case 'Reading':
      case 'Analyzing':
        return <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
      case 'Verified':
        return <Check className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Failed':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <div className="w-1.5 h-1.5 rounded-full border border-neutral-600" />;
    }
  };

  return (
    <div className="my-1.5 font-sans select-none w-full max-w-2xl">
      {/* Header Trigger */}
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800/80 transition-all group cursor-pointer text-neutral-300 hover:text-white text-xs shadow-sm w-fit"
      >
        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
          {isThinking ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="text-red-400 flex items-center justify-center"
            >
              <svg className="w-4 h-4 fill-current text-red-400" viewBox="0 0 24 24">
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.05-7.05l-2.12 2.12m-9.9 9.9l-2.12 2.12m0-14.14l2.12 2.12m9.9 9.9l2.12 2.12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          ) : (
            <Sparkles className="w-4 h-4 text-red-400/80" />
          )}
        </div>
        <span className="font-medium text-neutral-200 text-[13px] tracking-tight">
          {isResearch ? "🧠 NAVIX THINKING" : headerLabel}
        </span>
        <span className="text-[10px] text-neutral-400 font-mono bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-700/50 uppercase">
          {isResearch ? "Researching" : effort}
        </span>
        <div className="ml-2 text-neutral-500 group-hover:text-neutral-300 transition-transform">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Timeline */}
      <AnimatePresence>
        {isExpanded && !isResearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 ml-2.5 mt-2 border-l border-neutral-800 space-y-2 py-1"
          >
            {stepsList.map((step, idx, arr) => {
              const isCompleted = completedSteps.includes(step);
              const isActive = currentStep === step || (!isCompleted && idx === (completedSteps.length < arr.length ? completedSteps.length : arr.length - 1));
              return (
                <div key={idx} className="relative flex items-center gap-2.5 text-[12px]">
                  <div className="shrink-0 flex items-center justify-center">
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (isActive && isThinking) ? (
                      <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 ml-1" />
                    )}
                  </div>
                  <span className={\`transition-colors \${
                    isCompleted 
                      ? 'text-neutral-500 line-through decoration-neutral-700' 
                      : (isActive && isThinking)
                      ? 'text-neutral-100 font-medium' 
                      : 'text-neutral-400'
                  }\`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}

        {isExpanded && isResearch && researchData && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 w-full shadow-inner text-sm"
          >
            {/* Search Query */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider font-bold mb-1.5">
                <Search size={12} />
                Sedang mencari
              </div>
              <p className="text-neutral-100 font-medium italic">"{researchData.query}"</p>
            </div>

            {/* Websites */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider font-bold mb-2">
                <Globe size={12} />
                Web Aktif
              </div>
              <div className="space-y-2">
                {researchData.websites.map((web: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-neutral-300 text-[12px]">
                    {renderStatusIcon(web.status)}
                    <span className="font-mono text-blue-300">{web.domain}</span>
                    <span className="text-neutral-500">—</span>
                    <span className="text-neutral-400">{web.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apps */}
            <div className="mb-4 border-t border-neutral-800 pt-4">
              <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider font-bold mb-2">
                <Smartphone size={12} />
                Aplikasi/APK Publik
              </div>
              <div className="space-y-2">
                {researchData.apps.map((app: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-neutral-300 text-[12px]">
                    {renderStatusIcon(app.status)}
                    <span className="text-neutral-200 font-medium">{app.name}</span>
                    <span className="text-neutral-500">—</span>
                    <span className="text-neutral-400">{app.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Path */}
            <div className="mb-4 border-t border-neutral-800 pt-4">
              <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider font-bold mb-2">
                <Compass size={12} />
                Jalur
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                {researchData.path.map((node: string, idx: number) => (
                  <React.Fragment key={idx}>
                    <span className={\`px-1.5 py-0.5 rounded \${idx === researchData.path.length - 1 && isThinking ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-neutral-800 text-neutral-400'}\`}>
                      {node}
                    </span>
                    {idx < researchData.path.length - 1 && (
                      <span className="text-neutral-600">→</span>
                    )}
                    {idx === researchData.path.length - 1 && !isThinking && (
                      <>
                        <span className="text-neutral-600">→</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Answer</span>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4 flex items-center gap-3">
               <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-gradient-to-r from-red-500 to-red-400"
                   initial={{ width: 0 }}
                   animate={{ width: \`\${researchData.progress}%\` }}
                   transition={{ duration: 0.5 }}
                 />
               </div>
               <span className="text-[10px] font-mono text-neutral-500 font-bold">{researchData.progress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
console.log("Updated ThinkingIndicator.tsx");
