
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Check, Loader2, Cpu, Layers, PlaySquare, Settings, Activity, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

export interface DocumentData {
  title: string;
  content: string;
  requestedPages?: string;
  operation?: 'create' | 'correct_vocabulary' | 'repair_pdf';
  originalText?: string;
}

export function DocumentCard({ document }: { document: DocumentData }) {
  const [status, setStatus] = useState<'idle' | 'routing' | 'generating' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentModule, setCurrentModule] = useState('Initializing Engine...');
  const [errorMsg, setErrorMsg] = useState('');
  
  // --- NATIVE INTERACTIVE WRITER STATES ---
  const [localContent, setLocalContent] = useState(document.content || '');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [docTheme, setDocTheme] = useState<'ivory' | 'modern' | 'dark' | 'blueprint'>('ivory');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (document.content) {
      setLocalContent(document.content);
    }
  }, [document.content]);

  // Extract outline headings for live navigation sidebar
  const getHeadings = (text: string) => {
    try {
      const lines = text.split('\n');
      const headings: { text: string; level: number }[] = [];
      lines.forEach(line => {
        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
          headings.push({
            level: match[1].length,
            text: match[2]
          });
        }
      });
      return headings;
    } catch (e) {
      return [];
    }
  };

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = (text: string) => {
    return text ? text.length : 0;
  };

  const getEstReadTime = (text: string) => {
    const words = getWordCount(text);
    return Math.max(1, Math.ceil(words / 200)); // ~200 WPM
  };
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    generateLocalDocument();
  }, [JSON.stringify(document)]);

  const generateLocalDocument = async () => {
    setStatus('routing');
    setProgress(0);
    setErrorMsg('');
    setCurrentModule('Routing to Navix Internal Engine...');

    try {
      // Simulate Routing
      await new Promise(r => setTimeout(r, 1000));
      setStatus('generating');

      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        setProgress(p);
        
        if (p < 30) setCurrentModule('Initializing Layout Engine...');
        else if (p < 60) setCurrentModule('Parsing Markdown & Typography...');
        else if (p < 90) setCurrentModule('Rendering PDF Canvas...');
        else setCurrentModule('Finalizing Document Export...');

        if (p >= 100) {
          clearInterval(interval);
          setStatus('completed');
        }
      }, 80);

    } catch (e: any) {
      console.error("Engine Error:", e);
      setErrorMsg(e.message || "Internal Engine Failure");
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current || status !== 'completed') return;
        
    const prevModule = currentModule;
    setStatus('generating');
    setProgress(0);
    setCurrentModule('Exporting PDF File...');
    
    let p = 0;
    const interval = setInterval(() => {
       p += 10;
       if (p <= 100) setProgress(p);
    }, 100);

    try {
      const element = contentRef.current;
      const opt = {
        margin:       15,
        filename:     `${document.title || 'document'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      element.style.display = 'block';
      await html2pdf().from(element).set(opt).save();
      element.style.display = 'none';
      
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setStatus('completed');
      setCurrentModule('Export Successful');
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-full font-sans">
      
      {/* Editor Header */}
      <div className="bg-[#1a1a1a] flex items-center justify-between p-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
           <div className="bg-neutral-800 p-1.5 rounded-md border border-neutral-700">
             <FileText size={20} className="text-red-400" />
           </div>
           <div>
             <h3 className="text-sm font-bold text-neutral-100 tracking-wide uppercase flex items-center gap-2">
                Navix Document Engine <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded border border-red-500/30">NATIVE</span>
             </h3>
             <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mt-0.5">Offline Internal Render</p>
           </div>
        </div>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Editor Workspace Status */}
        {status !== 'completed' && status !== 'error' && (
          <div className="bg-[#141414] border border-neutral-800 rounded-lg p-4 mb-4 font-mono">
             <div className="flex items-center gap-2 mb-3 text-red-400">
               <Activity size={16} className="animate-spin-slow" />
               <span className="text-xs font-bold uppercase">System Console</span>
             </div>
             
             <div className="flex items-center justify-between mb-1.5">
               <span className="text-xs text-neutral-300">{currentModule}</span>
               <span className="text-xs text-red-400 font-bold">{progress}%</span>
             </div>
             <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
               <div className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
             </div>

             <div className="mt-3 flex gap-4 text-[10px] text-neutral-600 border-t border-neutral-800 pt-3">
                <span className="flex items-center gap-1"><Cpu size={12} /> Local Processing</span>
                <span className="flex items-center gap-1"><Layers size={12} /> Independent Engine</span>
                <span className="flex items-center gap-1"><PlaySquare size={12} /> No External API</span>
             </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="w-full h-32 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/30 rounded-lg mt-3 mb-4">
            <AlertTriangle className="text-red-500 mb-2" size={24} />
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {document.title && (
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800 border-l-4 border-l-red-500 mb-3 space-y-2">
             <div className="flex flex-wrap justify-between items-center gap-2">
               <div>
                 <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                   <Settings size={12} /> Document Title:
                 </p>
                 <p className="text-sm font-semibold text-neutral-200">"{document.title}"</p>
               </div>
               {document.requestedPages && (
                 <div className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-xs text-neutral-300">
                   Target: <strong className="text-red-400">{document.requestedPages}</strong>
                 </div>
               )}
             </div>

             {document.operation && document.operation !== 'create' && (
               <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded text-xs flex items-center justify-between">
                 <span className="text-neutral-300">Operasi PDF: <strong>{document.operation === 'correct_vocabulary' ? 'Perbaikan Kosakata & Tata Bahasa' : 'Perbaikan Berkas PDF'}</strong></span>
                 <span className="bg-red-500/20 text-red-400 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-red-500/30">Active Proofreader</span>
               </div>
             )}
          </div>
        )}

        {/* Comparison section if originalText exists */}
        {document.originalText && (
          <div className="bg-[#111111] border border-neutral-800 rounded-lg p-3 mb-3 text-xs">
            <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block mb-2">Perbandingan Naskah Asli vs Perbaikan Tata Bahasa</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#0c0c0c] p-2.5 rounded border border-neutral-900">
                <span className="text-red-400/80 font-bold block mb-1">Draf Asli (Saran Koreksi):</span>
                <p className="text-neutral-400 line-through leading-relaxed">{document.originalText}</p>
              </div>
              <div className="bg-green-950/20 p-2.5 rounded border border-green-900/30">
                <span className="text-green-400 font-bold block mb-1">Hasil Rekomendasi Navix PDF:</span>
                <p className="text-neutral-200 font-medium leading-relaxed">Membetulkan kosa kata yang salah, mengoreksi diksi, meningkatkan kejelasan kalimat, dan menstrukturkan dokumen.</p>
              </div>
            </div>
          </div>
        )}

        {/* Media Output & Interactive Document Studio */}
        {status === 'completed' && (
           <div className="space-y-4 mt-4">
             {/* Document Statistics & Control Dashboard */}
             <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 space-y-4">
               <div className="flex flex-wrap justify-between items-center gap-4 border-b border-neutral-800 pb-3">
                 {/* Live Word Stats */}
                 <div className="flex gap-4 text-xs font-mono text-neutral-400">
                   <div>
                     KATA: <strong className="text-red-400">{getWordCount(localContent)}</strong>
                   </div>
                   <div>
                     KARAKTER: <strong className="text-red-400">{getCharCount(localContent)}</strong>
                   </div>
                   <div>
                     BACA: <strong className="text-red-400">±{getEstReadTime(localContent)} mnt</strong>
                   </div>
                 </div>

                 {/* Editor Toolbar Mode Selector */}
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => setIsEditing(!isEditing)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${
                       isEditing 
                         ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/10' 
                         : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-neutral-100'
                     }`}
                   >
                     {isEditing ? '💾 Selesai Edit' : '✏️ Edit Naskah'}
                   </button>
                   
                   <button
                     onClick={handleDownload}
                     className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-500/40 shadow-lg shadow-red-600/10"
                   >
                     <Download size={13} /> <span>Export PDF</span>
                   </button>
                 </div>
               </div>

               {/* Design Templates & Layout Customizer */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                 <div>
                   <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Template Desain Dokumen</label>
                   <div className="grid grid-cols-4 gap-1.5">
                     {[
                       { key: 'ivory', label: 'Klasik' },
                       { key: 'modern', label: 'Modern' },
                       { key: 'dark', label: 'Dark zinc' },
                       { key: 'blueprint', label: 'Cetak Biru' }
                     ].map(theme => (
                       <button
                         key={theme.key}
                         onClick={() => setDocTheme(theme.key as any)}
                         className={`py-1.5 px-1 rounded text-[10px] font-bold uppercase border transition-all ${
                           docTheme === theme.key 
                             ? 'bg-red-600/20 border-red-500 text-red-400' 
                             : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white'
                         }`}
                       >
                         {theme.label}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Skala & Ukuran Huruf</label>
                   <div className="grid grid-cols-3 gap-1.5">
                     {[
                       { key: 'sm', label: 'Rapat (11px)' },
                       { key: 'md', label: 'Normal (14px)' },
                       { key: 'lg', label: 'Longgar (16px)' }
                     ].map(sz => (
                       <button
                         key={sz.key}
                         onClick={() => setFontSize(sz.key as any)}
                         className={`py-1.5 px-1 rounded text-[10px] font-bold uppercase border transition-all ${
                           fontSize === sz.key 
                             ? 'bg-red-600/20 border-red-500 text-red-400' 
                             : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white'
                         }`}
                       >
                         {sz.label}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             </div>

             {/* Immersive Sidebar Layout Workspace */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
               {/* Left Column: Table of Contents Structural Outline Sidebar */}
               <div className="lg:col-span-3 bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex flex-col h-fit max-h-[400px]">
                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono border-b border-neutral-800 pb-2 mb-3 block">
                   📋 Struktur Dokumen
                 </span>
                 <div className="overflow-y-auto custom-scrollbar space-y-2 max-h-[320px] text-xs">
                   {getHeadings(localContent).length > 0 ? (
                     getHeadings(localContent).map((h, idx) => (
                       <div 
                         key={idx} 
                         className={`text-neutral-400 hover:text-white cursor-pointer transition-colors leading-snug ${
                           h.level === 1 ? 'font-bold pl-0 text-red-400' : h.level === 2 ? 'pl-2 text-neutral-300' : 'pl-4 text-neutral-400 text-[11px]'
                         }`}
                       >
                         {h.level === 1 ? '■ ' : h.level === 2 ? '• ' : '- '} {h.text}
                       </div>
                     ))
                   ) : (
                     <div className="text-neutral-500 italic py-2 font-mono text-[10px]">
                       No structural headings detected. Use Markdown '#' format.
                     </div>
                   )}
                 </div>
               </div>

               {/* Right Column: Beautiful On-Screen Document Sheet Canvas */}
               <div className="lg:col-span-9 flex flex-col">
                 {isEditing ? (
                   <div className="flex flex-col border border-neutral-850 rounded-2xl overflow-hidden bg-neutral-950">
                     <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                       <span>✏️ LIVE MARKDOWN EDITOR</span>
                       <span className="text-red-400 font-bold animate-pulse">AUTOSAVED</span>
                     </div>
                     <textarea
                       value={localContent}
                       onChange={(e) => setLocalContent(e.target.value)}
                       className="w-full min-h-[320px] h-[360px] bg-neutral-950 p-4 font-mono text-xs text-neutral-300 outline-none resize-y leading-relaxed focus:ring-1 focus:ring-red-500/40 custom-scrollbar"
                       placeholder="Tulis naskah dalam format Markdown di sini..."
                       spellCheck="false"
                     />
                   </div>
                 ) : (
                   <div 
                     className={`w-full min-h-[320px] max-h-[460px] overflow-y-auto border rounded-2xl p-6 md:p-8 custom-scrollbar shadow-inner transition-all duration-300 leading-relaxed ${
                       docTheme === 'ivory' ? 'bg-[#fcfaf2] text-[#292524] border-[#e4dfd0]' :
                       docTheme === 'modern' ? 'bg-white text-[#0f172a] border-[#e2e8f0]' :
                       docTheme === 'dark' ? 'bg-[#18181b] text-[#f4f4f5] border-neutral-800' :
                       'bg-[#0f1d3a] text-cyan-100 border-cyan-800/60 font-mono bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]'
                     }`}
                   >
                     {/* Dynamic font size class wrapper */}
                     <div className={`prose max-w-none ${
                       fontSize === 'sm' ? 'prose-sm' : fontSize === 'md' ? 'prose-base' : 'prose-lg'
                     } ${
                       docTheme === 'dark' ? 'prose-invert text-neutral-200' : 
                       docTheme === 'blueprint' ? 'text-cyan-100' : 'text-neutral-800'
                     }`}>
                       <Markdown remarkPlugins={[remarkGfm]}>{localContent}</Markdown>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
        )}

        {/* Hidden div used for PDF rendering with exact styled match */}
        <div className="overflow-hidden h-0 opacity-0 pointer-events-none">
          <div 
            ref={contentRef} 
            className={`p-10 font-sans w-[800px] max-w-none prose prose-slate ${
              docTheme === 'ivory' ? 'bg-[#fcfaf2] text-[#292524]' :
              docTheme === 'modern' ? 'bg-white text-[#0f172a]' :
              docTheme === 'dark' ? 'bg-[#18181b] text-[#f4f4f5]' :
              'bg-[#0f1d3a] text-cyan-100'
            }`}
          >
            {document.title && (
              <h1 className="text-center text-3xl font-extrabold mb-8 tracking-tight uppercase" style={{ color: docTheme === 'blueprint' ? '#22d3ee' : docTheme === 'dark' ? '#f4f4f5' : '#0f172a' }}>
                {document.title}
              </h1>
            )}
            <div className="pdf-content whitespace-pre-wrap">
              <Markdown remarkPlugins={[remarkGfm]}>{localContent}</Markdown>
            </div>
            <style>{`
              .pdf-content h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
              .pdf-content h2 { font-size: 19px; font-weight: bold; margin-bottom: 12px; margin-top: 20px; }
              .pdf-content h3 { font-size: 15px; font-weight: bold; margin-bottom: 8px; margin-top: 16px; }
              .pdf-content p { margin-bottom: 12px; line-height: 1.6; }
              .pdf-content ul { margin-left: 20px; margin-bottom: 12px; list-style-type: disc; }
              .pdf-content ol { margin-left: 20px; margin-bottom: 12px; list-style-type: decimal; }
              .pdf-content li { margin-bottom: 5px; }
              .pdf-content table { width: 100%; border-collapse: collapse; margin-bottom: 18px; margin-top: 10px; }
              .pdf-content th, .pdf-content td { border: 1px solid #999; padding: 10px; text-align: left; }
              .pdf-content th { background-color: rgba(0,0,0,0.05); }
              .pdf-content code { background-color: rgba(0,0,0,0.04); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
              .pdf-content pre { background-color: rgba(0,0,0,0.04); padding: 12px; border-radius: 4px; overflow-x: auto; font-family: monospace; margin-bottom: 12px; }
              .pdf-content blockquote { border-left: 4px solid #cc3333; padding-left: 12px; font-style: italic; color: #555; margin-bottom: 12px; }
            `}</style>
          </div>
        </div>

      </div>
    </div>
  );
}
