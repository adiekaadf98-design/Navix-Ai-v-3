import { Loader2, StopCircle, Menu, X, Image as ImageIcon, Video, FileAudio, Copy, Share2, Check, Download, FileJson, FileText, Trash2, Volume2, VolumeX, Cpu, Shield, Activity, Fingerprint, Terminal, Sparkles, ArrowDown, Search } from 'lucide-react';
import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, Attachment } from '../types';
import { SignalCard, SignalData } from './SignalCard';
import { MediaCard, MediaData } from './MediaCard';
import { ImageLightbox } from './ImageLightbox';
import { DocumentCard, DocumentData } from './DocumentCard';
import { ChatInput } from './ChatInput';
import { ScienceCard, ScienceData } from './ScienceCard';

import { TrackerCard, TrackerData } from './TrackerCard';
import { ShadowEngineCard, ShadowEngineData } from './ShadowEngineCard';
import { StudioAppCard, StudioAppBlockData } from './StudioAppCard';
import { DeliberationCard } from './DeliberationCard';

import { analyzeImageIntent } from '../services/Orchestrator';
import { ThinkingIndicator, ThinkingStateData } from './ThinkingIndicator';
import { motion } from 'motion/react';
import { showToast } from '../utils/toast';
import { EffortLevel, classifyTask, createTaskPlan, isHeavyTask } from '../services/ThinkingEngine';
import { mediaStore, computeMediaKey } from '../utils/mediaStorage';
import { useAuthStore } from '../store/useAuthStore';

// Uncompressed Direct Blob-to-Object-URL Image Attachment Component
interface UncompressedAttachmentImageProps {
  rawSrc: string;
  name?: string;
  onOpenLightbox: (src: string, prompt: string) => void;
  onDownload: (e: React.MouseEvent, url: string, filename: string) => void;
}

const UncompressedAttachmentImage: React.FC<UncompressedAttachmentImageProps> = ({
  rawSrc,
  name,
  onOpenLightbox,
  onDownload
}) => {
  const [blobUrl, setBlobUrl] = useState<string>(rawSrc);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const resolveUncompressedBlob = async () => {
      try {
        const directBlobUrl = await mediaStore.getMediaBlobObjectUrl(rawSrc);
        if (isMounted && directBlobUrl) {
          setBlobUrl(directBlobUrl);
        }
        const meta = await mediaStore.getOriginalMediaBlob(rawSrc);
        if (isMounted && meta) {
          const mb = meta.sizeBytes / (1024 * 1024);
          const kb = meta.sizeBytes / 1024;
          setFileSizeStr(mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(0)} KB`);
        }
      } catch (err) {
        console.warn('Failed to resolve uncompressed blob for attachment:', err);
      }
    };
    resolveUncompressedBlob();
    return () => {
      isMounted = false;
    };
  }, [rawSrc]);

  return (
    <div 
      className="relative group cursor-zoom-in rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-md w-full max-w-sm sm:max-w-md"
      onClick={() => onOpenLightbox(blobUrl || rawSrc, name || 'Pratinjau Gambar Lampiran Asli')}
    >
      <img 
        src={blobUrl || rawSrc} 
        alt={name || "Attachment"} 
        referrerPolicy="no-referrer" 
        onLoad={(e) => {
          setDimensions({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight
          });
        }}
        className="w-full h-auto object-contain max-h-[380px] sm:max-h-[440px] transition-opacity hover:opacity-95 rounded-t-xl" 
        style={{ imageRendering: 'auto' }}
      />
      
      {/* Real-time Lossless Blob Resolution Info Badge */}
      <div className="absolute top-2 left-2 bg-neutral-950/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{dimensions ? `${dimensions.width}×${dimensions.height}` : 'HD Lossless'} {fileSizeStr ? `(${fileSizeStr})` : 'Blob'}</span>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDownload(e, blobUrl || rawSrc, name || 'navix_image.png');
        }}
        className="absolute bottom-2 right-2 bg-black/75 hover:bg-black/90 text-white p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10 flex items-center gap-1.5 text-xs font-medium z-10 shadow-lg"
        title="Unduh file gambar asli (Lossless Blob)"
      >
        <Download size={14} /> Download
      </button>
    </div>
  );
};

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  thinkingState?: ThinkingStateData;
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  onOpenSidebar: () => void;
  onClearMessages: () => void;
  onDeleteMessage?: (messageId: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isImagePanelOpen?: boolean;
  onToggleImagePanel?: () => void;
  effortLevel?: string;
  setEffortLevel?: (level: string) => void;
  thinkingMode?: boolean;
  setThinkingMode?: (enabled: boolean) => void;
  aiBooster?: boolean;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await fallbackCopyTextToClipboard(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Since react-markdown v9+ doesn't pass 'inline', we detect it ourselves:
  const isInlineCode = inline !== undefined ? inline : (!className && !String(children).includes('\n'));

  return !isInlineCode ? (
    <div className="rounded-xl overflow-hidden my-4 border border-neutral-800 shadow-2xl w-full max-w-full group">
      <div className="bg-neutral-900/80 backdrop-blur-sm px-4 py-2 text-[10px] text-neutral-500 font-mono tracking-[0.2em] uppercase font-bold flex justify-between items-center border-b border-neutral-800">
        <span>{match ? match[1] : 'code'}</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded cursor-pointer transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            <span className="normal-case tracking-normal text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <div className="flex gap-1.5 hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-red-500/20" />
            <div className="w-2 h-2 rounded-full bg-red-500/40" />
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
          </div>
        </div>
      </div>
      <pre className="bg-[#050505] p-4 w-full overflow-x-auto text-[13px] sm:text-sm font-mono text-neutral-300 leading-relaxed custom-scrollbar">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  ) : (
    <code className="bg-neutral-800/80 px-1.5 py-0.5 rounded text-red-400 font-mono text-[13px] break-words [word-break:break-word] whitespace-pre-wrap border border-neutral-700/50" {...props}>
      {children}
    </code>
  );
};

  const markdownComponents: any = {
    p: ({children}: any) => <p className="mb-3 last:mb-0 whitespace-pre-wrap break-words [word-break:break-word] text-neutral-300 text-[13px] md:text-[15px] leading-relaxed">{children}</p>,
    strong: ({children}: any) => <strong className="font-bold text-white tracking-tight">{children}</strong>,
    em: ({children}: any) => <em className="text-neutral-400 italic">{children}</em>,
    code: CodeBlock,
    pre: ({children}: any) => <>{children}</>,
    ul: ({children}: any) => <ul className="list-disc ml-4 md:ml-5 mb-4 space-y-2 text-neutral-300 text-[13px] md:text-[15px] leading-relaxed">{children}</ul>,
    ol: ({children}: any) => <ol className="list-decimal ml-4 md:ml-5 mb-4 space-y-2 text-neutral-300 text-[13px] md:text-[15px] leading-relaxed">{children}</ol>,
    li: ({children}: any) => <li className="marker:text-red-500 break-words [word-break:break-word]">{children}</li>,
    h1: ({children}: any) => <h1 className="text-[15px] md:text-xl font-bold mb-4 mt-6 text-white tracking-tight border-l-4 border-red-600 pl-4 break-words [word-break:break-word]">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-[14px] md:text-lg font-bold mb-3 mt-5 text-white tracking-tight border-l-2 border-red-600/50 pl-3 break-words [word-break:break-word]">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-[13px] md:text-base font-bold mb-2 mt-4 text-white tracking-tight pl-2 break-words [word-break:break-word]">{children}</h3>,
    blockquote: ({children}: any) => <blockquote className="border-l-4 border-neutral-700 pl-4 py-1 my-4 italic text-neutral-400 text-[13px] md:text-[15px] bg-neutral-900/30 rounded-r-lg break-words [word-break:break-word]">{children}</blockquote>,
    a: ({href, children}: any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-4 decoration-red-500/30 transition-colors break-all">{children}</a>,
    table: ({children}: any) => <div className="overflow-x-auto my-6 w-full rounded-xl border border-neutral-800 shadow-lg"><table className="min-w-full text-[11px] md:text-sm border-collapse">{children}</table></div>,
    thead: ({children}: any) => <thead className="bg-neutral-900/80 text-neutral-400 font-mono text-[9px] md:text-xs uppercase tracking-widest">{children}</thead>,
    tbody: ({children}: any) => <tbody className="divide-y divide-neutral-800/50 bg-[#0c0c0c]">{children}</tbody>,
    tr: ({children}: any) => <tr className="hover:bg-neutral-800/20 transition-colors">{children}</tr>,
    th: ({children}: any) => <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold border-x border-neutral-800/50 first:border-l-0 last:border-r-0">{children}</th>,
    td: ({children}: any) => <td className="px-3 md:px-4 py-2 md:py-3 text-neutral-300 border-x border-neutral-800/50 first:border-l-0 last:border-r-0">{children}</td>,
  };

  const MemoizedMessageContent = memo(({ text, role, msgId, messagesRef }: { text: string, role: string, msgId?: string, messagesRef: React.MutableRefObject<ChatMessage[]> }) => {
    return useMemo(() => {

    if (role === 'user') {
      return (
        <div className="text-neutral-100">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{text}</Markdown>
        </div>
      );
    }

    const mediaRegex = /```(?:json)?\s*media\n([\s\S]*?)```/i;
    const shadowRegex = /```(?:json)?\s*shadow\n([\s\S]*?)```/i;
    const documentRegex = /```(?:json)?\s*document\n([\s\S]*?)```/i;
    const trackerRegex = /```(?:json)?\s*tracker\n([\s\S]*?)```/i;
    const scienceRegex = /```(?:json)?\s*science\n([\s\S]*?)```/i;
    const studioAppRegex = /```(?:json)?\s*(?:studio_app|apk_app|web_app)\n([\s\S]*?)```/i;
    const deliberationRegex = /```(?:json)?\s*deliberation\n([\s\S]*?)```/i;
    
    let cleanText = text;
    
    const signalsData: SignalData[] = [];
    let mappedSymbol = '';

    const signalMatches = [...cleanText.matchAll(/```(?:json)?\s*signal\n([\s\S]*?)```/ig)];
    for (const match of signalMatches) {
      try {
        let jsonStr = match[1].trim();
        // Sometimes AI outputs a markdown title inside the block like `json`
        if (jsonStr.startsWith('json')) jsonStr = jsonStr.substring(4).trim();
        if (jsonStr.startsWith('{')) {
          const sig: SignalData = JSON.parse(jsonStr);
          signalsData.push(sig);
          
          if (!mappedSymbol) {
            let rawSymbol = (sig.asset || (sig as any).pair || '').toLowerCase().trim();
            if (rawSymbol === 'xauusd' || rawSymbol === 'gold' || rawSymbol === 'gc=f' || rawSymbol === 'gcf') mappedSymbol = 'paxgusdt';
            else if (rawSymbol === 'eurusd') mappedSymbol = 'eurusdt';
            else if (rawSymbol === 'gbpusd') mappedSymbol = 'gbpusdt';
            else if (rawSymbol.endsWith('usd')) mappedSymbol = rawSymbol + 't'; 
            else if (rawSymbol.includes('gc=') || rawSymbol.includes('gcf') || rawSymbol === 'gc') {
              mappedSymbol = 'XAUUSD';
            }
            else if (!rawSymbol.endsWith('usdt') && !rawSymbol.endsWith('btc') && !rawSymbol.endsWith('eth') && !rawSymbol.endsWith('bnb')) {
              mappedSymbol = rawSymbol + 'usdt';
            }
            else mappedSymbol = rawSymbol;
          }
        }
      } catch (e) {
        console.error('Failed to parse signal data', e);
      }
    }
    cleanText = cleanText.replace(/```(?:json)?\s*signal\n([\s\S]*?)```/ig, '').trim();

    const mediaMatch = cleanText.match(mediaRegex);
    let mediaData: MediaData | null = null;

    if (mediaMatch) {
      try {
        mediaData = JSON.parse(mediaMatch[1]);
        
        // Find latest image or video attachment before this message
        if (msgId) {
           const msgIndex = messagesRef.current.findIndex(m => m.id === msgId);
           if (msgIndex >= 0) {
              const previousMessages = messagesRef.current.slice(0, msgIndex);
              for (let i = previousMessages.length - 1; i >= 0; i--) {
                const atts = previousMessages[i].attachments;
                if (atts && atts.length > 0) {
                  let attachment;
                  const isAnim = mediaData?.operation?.startsWith('animate_');
                  if (isAnim) {
                    attachment = atts.find(a => a.type === 'image') || atts.find(a => a.type === 'video');
                  } else if (mediaData?.type === 'video_edit') {
                    attachment = atts.find(a => a.type === 'video') || atts.find(a => a.type === 'image');
                  } else if (mediaData?.operation) {
                    attachment = atts.find(a => a.type === 'image') || atts.find(a => a.type === 'video');
                  }
                  
                  // ONLY inject the past attachment if the AI didn't provide a valid generated image URL, 
                  // or if it explicitly requested an edit operation and needs the source media.
                  if (attachment && (!mediaData?.image || !mediaData.image.startsWith('http') && !mediaData.image.startsWith('data:'))) {
                    if (attachment.data) {
                      mediaData!.image = `data:${attachment.mimeType};base64,${attachment.data}`;
                    } else {
                      mediaData!.image = attachment.url;
                    }
                    break;
                  }
                }
              }
           }
        }
        
        cleanText = cleanText.replace(mediaRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse media data', e);
      }
    }

        const shadowMatch = cleanText.match(shadowRegex);
    let shadowData = null;
    if (shadowMatch) {
      try {
        shadowData = JSON.parse(shadowMatch[1]);
      } catch (e) {
        console.error("Failed to parse shadow JSON", e);
      }
      cleanText = cleanText.replace(shadowRegex, '').trim();
    }

    const documentMatch = cleanText.match(documentRegex);
    let documentData: DocumentData | null = null;

    if (documentMatch) {
      try {
        documentData = JSON.parse(documentMatch[1]);
        cleanText = cleanText.replace(documentRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse document data', e);
      }
    }

    const trackerMatch = cleanText.match(trackerRegex);
    let trackerData: TrackerData | null = null;

    if (trackerMatch) {
      try {
        trackerData = JSON.parse(trackerMatch[1]);
        cleanText = cleanText.replace(trackerRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse tracker data', e);
      }
    }

    const scienceMatch = cleanText.match(scienceRegex);
    let scienceData: ScienceData | null = null;

    if (scienceMatch) {
      try {
        scienceData = JSON.parse(scienceMatch[1]);
        cleanText = cleanText.replace(scienceRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse science data', e);
      }
    }

    const studioAppMatch = cleanText.match(studioAppRegex);
    let studioAppData: StudioAppBlockData | null = null;

    if (studioAppMatch) {
      try {
        studioAppData = JSON.parse(studioAppMatch[1]);
        cleanText = cleanText.replace(studioAppRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse studio app data', e);
      }
    }

    const deliberationMatch = cleanText.match(deliberationRegex);
    let deliberationData = null;
    if (deliberationMatch) {
      try {
        deliberationData = JSON.parse(deliberationMatch[1]);
        cleanText = cleanText.replace(deliberationRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse deliberation data', e);
      }
    }

    // Swarm segments definition
    const swarmTypes = [
      { key: '[The Observer]', title: 'THE OBSERVER', icon: '📡' },
      { key: '[The Analyst]', title: 'THE ANALYST', icon: '🔬' },
      { key: '[The Critic]', title: 'THE CRITIC', icon: '⚖️' },
      { key: '[The Executor]', title: 'THE EXECUTOR', icon: '⚡' },
    ];

    // More robust segment parsing
    const renderedText = [] as React.ReactNode[];
    let blockCounter = 0;

    // Use regex to find all segment headers
    const segmentHeaderRegex = /\[The (Observer|Analyst|Critic|Executor)\]/g;
    let match;
    let lastIndex = 0;

    while ((match = segmentHeaderRegex.exec(cleanText)) !== null) {
      // Text before segment
      const preText = cleanText.substring(lastIndex, match.index).trim();
      if (preText) {
        renderedText.push(
          <div key={`text-${blockCounter++}`} className="mb-4">
            <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{preText}</Markdown>
          </div>
        );
      }

      const segmentKey = match[0];
      const segmentType = match[1];
      const segmentInfo = swarmTypes.find(s => s.key === segmentKey);

      // Find where this segment ends (start of next segment)
      let nextIndex = cleanText.length;
      const nextMatchRegex = /\[The (Observer|Analyst|Critic|Executor)\]/g;
      nextMatchRegex.lastIndex = segmentHeaderRegex.lastIndex;
      const nextMatch = nextMatchRegex.exec(cleanText);
      if (nextMatch) {
        nextIndex = nextMatch.index;
      }

      const segmentContent = cleanText.substring(segmentHeaderRegex.lastIndex, nextIndex).trim();
      
      renderedText.push(
        <div key={`segment-${segmentKey}-${blockCounter++}`} className="my-4 md:my-5 border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4 md:p-5 w-full overflow-hidden shadow-xl ring-1 ring-red-900/10">
          <div className="flex items-center gap-3 mb-4 font-mono text-[10px] md:text-xs font-bold text-neutral-400 tracking-[0.25em] border-b border-neutral-800/50 pb-3 uppercase">
            <span className="text-lg filter grayscale opacity-70 group-hover:grayscale-0 transition-all">{segmentInfo?.icon}</span>
            <span>{segmentInfo?.title}</span>
            <div className="ml-auto flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <span className="text-red-500/50">LIVE</span>
            </div>
          </div>
          <div className="text-[14px] md:text-[15px] text-neutral-300 leading-relaxed font-sans w-full max-w-full">
             <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{segmentContent}</Markdown>
          </div>
        </div>
      );

      lastIndex = nextIndex;
      // If we found a next segment, we need to continue from its start index
      segmentHeaderRegex.lastIndex = nextIndex;
    }

    // Remaining text after last segment
    const remainingText = cleanText.substring(lastIndex).trim();
    if (remainingText) {
      renderedText.push(
        <div key={`post-${blockCounter++}`} className="mt-2">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{remainingText}</Markdown>
        </div>
      );
    }

    // Fallback if no segments found at all
    if (renderedText.length === 0 && cleanText.trim()) {
       renderedText.push(
         <div key={`fallback-${blockCounter++}`}>
           <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{cleanText.trim()}</Markdown>
         </div>
       );
    }

    // Broad symbol detection for text signals
    let detectedSymbol = '';
    if (role === 'ai') {
      const textUpper = text.toUpperCase().replace('/', '');
      
      // Strict rule: Only extract and display market/trading widgets if the context is related to trading,
      // has explicit chart/visualization intent, and is not a complaint or apology conversation.
      const tradingKeywords = [
        'BUY', 'SELL', 'ENTRY', 'SIGNAL', 'POSITION', 'ANALYSIS', 'CHART', 'TRADE', 'TRADING', 
        'MARKET', 'FOREX', 'CRYPTO', 'PRICE', 'CANDLESTICK', 'RESISTANCE', 'SUPPORT', 'TREND', 
        'SMC', 'ICT', 'TECHNICAL', 'FUNDAMENTAL', 'INDICATOR', 'OSCILLATOR', 'TIMEFRAME', 'GRAFIK',
        'PAMP', 'DUMP', 'SL', 'TP', 'RISK', 'REWARD', 'OUTLOOK', 'FORECAST', 'PREDIKSI'
      ];
      const hasTradingContext = tradingKeywords.some(k => textUpper.includes(k));

      const chartIntentKeywords = ['GRAFIK', 'CHART', 'TRADINGVIEW', 'WIDGET', 'VISUALISASI', 'PLOT'];
      const hasChartIntent = chartIntentKeywords.some(k => textUpper.includes(k));

      const complaintKeywords = ['KENAPA', 'MENGAPA', 'KOK', 'SALAH', 'ERROR', 'BUG', 'KOMPLAIN', 'MALAH', 'KELUAR', 'KONSEP', 'MASALAH', 'TIDAK SESUAI', 'BELUM SESUAI', 'MAAF', 'APOLOGI', 'SORRY'];
      const isComplaintOrApology = complaintKeywords.some(k => textUpper.includes(k));

      if (hasTradingContext && !isComplaintOrApology && !mediaData && !documentData && !scienceData && !trackerData) {
        const symbols = ['XAUUSD', 'BTCUSD', 'ETHUSD', 'GBPUSD', 'EURUSD', 'SOLUSD', 'BNBUSD', 'XRPUSD', 'GOLD', 'SILVER', 'PAXG', 'PAX', 'GC=F', 'GC'];
        for (const s of symbols) {
          if (textUpper.includes(s)) {
            // Force Gold mapping
            if (s === 'PAXG' || s === 'PAX' || s === 'GOLD' || s === 'GC=F' || s === 'GC') {
              detectedSymbol = 'XAUUSD';
            } else {
              detectedSymbol = s;
            }
            break;
          }
        }
        // Special check for keywords indicating a signal
        const signalKeywords = ['BUY', 'SELL', 'ENTRY', 'SIGNAL', 'POSITION', 'ANALYSIS', 'ANALISA'];
        const hasSignalKeyword = signalKeywords.some(k => textUpper.includes(k));
        if (!detectedSymbol && hasSignalKeyword && (textUpper.includes('GOLD') || textUpper.includes('PAX'))) {
          detectedSymbol = 'XAUUSD';
        }
      }
    }

    return (
      <div className="flex flex-col gap-2 w-full max-w-full overflow-hidden">
        {renderedText}
        {documentData && (
          <div className="w-full mt-4">
            <DocumentCard document={documentData} />
          </div>
        )}
        {deliberationData && (
          <div className="w-full mt-4">
            <DeliberationCard verdict={deliberationData} />
          </div>
        )}
        {mediaData && (
          <div className="w-full mt-4">
            <MediaCard media={mediaData} />
          </div>
        )}
        {shadowData && (
          <div className="w-full mt-4">
            <ShadowEngineCard data={shadowData} />
          </div>
        )}
        {scienceData && (
          <div className="w-full mt-4">
            <ScienceCard data={scienceData} />
          </div>
        )}
        {studioAppData && (
          <div className="w-full mt-4">
            <StudioAppCard data={studioAppData} />
          </div>
        )}
        {signalsData.length > 0 && (
          <div className="flex flex-col gap-4 w-full mt-4">
            {signalsData.map((sig, idx) => (
              <SignalCard key={idx} signal={sig} />
            ))}
          </div>
        )}
        {trackerData && (
          <div className="w-full mt-4">
            <TrackerCard data={trackerData} />
          </div>
        )}
      </div>
    );
    }, [text, role, msgId]);
  });


const fallbackCopyTextToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed, using fallback:", e);
    }
  }

  return new Promise<boolean>((resolve) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0.01";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        textArea.setSelectionRange(0, 999999);
      }

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      resolve(successful);
    } catch (err) {
      console.error("execCommand copy error:", err);
      resolve(false);
    }
  });
};

export function ChatArea({ 
  messages, 
  isLoading,
  thinkingState, 
  onSendMessage, 
  onOpenSidebar, 
  onClearMessages, 
  onDeleteMessage,
  voiceEnabled, 
  setVoiceEnabled,
  selectedModel,
  onModelChange,
  isImagePanelOpen = false,
  onToggleImagePanel = () => {},
  effortLevel = 'medium',
  setEffortLevel = () => {},
  thinkingMode = true,
  setThinkingMode = () => {},
  aiBooster = true,
}: ChatAreaProps) {

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 1. Helper functions first (using function declaration for hoisting)
  function getMessageMode(msg: ChatMessage, msgIndex: number) {
    if (!msg || msg.role !== 'user') return 'none';
    const msgHistory = messages.slice(0, msgIndex);
    const formattedHistory = msgHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: m.attachments?.map(att => ({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data || ''
        }
      })) || [{ text: m.text || '' }]
    }));
    return analyzeImageIntent(msg.text, msg.attachments, formattedHistory);
  }

  // Memos and State
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'compliance' | 'prompt'>('compliance');
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    src?: string;
    mediaKey?: string;
    prompt?: string;
    alt?: string;
  } | null>(null);

  const processedImageMessages = useMemo(() => {
    return messages.filter((m) => {
      if (m.role !== 'ai') return false;
      const hasMediaBlock = m.text && (m.text.includes('"type": "image"') || m.text.includes('"type": "video_edit"') || m.text.includes('media'));
      const hasSystemPrompt = !!m.systemInstruction;
      const hasImageAttachment = m.attachments && m.attachments.some(a => a.type === 'image');
      return hasMediaBlock || hasSystemPrompt || hasImageAttachment;
    });
  }, [messages]);

  useEffect(() => {
    if (processedImageMessages.length > 0) {
      const latestMsg = processedImageMessages[processedImageMessages.length - 1];
      setSelectedTurnId(prev => {
        if (!prev) return latestMsg.id;
        const exists = processedImageMessages.some(m => m.id === prev);
        return exists ? prev : latestMsg.id;
      });
    } else {
      setSelectedTurnId(null);
    }
  }, [processedImageMessages]);

  const inspectedMessage = useMemo(() => {
    if (!selectedTurnId) return null;
    return processedImageMessages.find(m => m.id === selectedTurnId) || null;
  }, [selectedTurnId, processedImageMessages]);

  const inspectedMode = useMemo(() => {
    if (!inspectedMessage) return 'none';
    const textLower = (inspectedMessage.text || '').toLowerCase();
    const instLower = (inspectedMessage.systemInstruction || '').toLowerCase();
    
    if (textLower.includes('edit_image') || textLower.includes('"type": "video_edit"') || textLower.includes('"operation":') || instLower.includes('edit foto/gambar')) {
      return 'edit';
    }
    return 'generate';
  }, [inspectedMessage]);

  const isCurrentlyProcessingImage = useMemo(() => {
    if (!isLoading) return false;
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) return false;
    const lastUserIdx = messages.indexOf(lastUserMsg);
    const mode = getMessageMode(lastUserMsg, lastUserIdx);
    return mode === 'generate' || mode === 'edit';
  }, [isLoading,
  thinkingState, messages, getMessageMode]);

  const activeProcessingMode = useMemo(() => {
    if (!isLoading) return 'none';
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) return 'none';
    const lastUserIdx = messages.indexOf(lastUserMsg);
    return getMessageMode(lastUserMsg, lastUserIdx);
  }, [isLoading,
  thinkingState, messages, getMessageMode]);

  const rawSystemPrompt = useMemo(() => {
    if (inspectedMessage && inspectedMessage.systemInstruction) {
      return inspectedMessage.systemInstruction;
    }
    return `Anda adalah NAVIX OMEGA SUPER-APP, Sistem Operasi AI Otonom dengan Arsitektur Multi-Engine tingkat lanjut. Anda telah di-upgrade dengan MESIN TERBARU.
Peran Anda: ORCHESTRATOR UTAMA YANG SANGAT CERDAS & AGRESIF.

[INSTRUKSI EDIT FOTO/GAMBAR - SANGAT PENTING & MUTLAK]:
- PENGGUNA SEDANG MENGEDIT FOTO/GAMBAR YANG TERLAMPIR, BUKAN MEMBUAT GAMBAR BARU DARI NOL!
- Anda WAJIB memanggil fungsi 'edit_image' untuk melakukan pengeditan atau perubahan gaya/objek pada gambar asli.
- JANGAN PERNAH MEMANGGIL generate_image BIASA! Karena generate_image biasa akan menghapus identitas wajah/subjek asli dan menggantinya dengan gambar baru dari nol yang tidak sesuai.
- PROMPT YANG ANDA TULIS PADA ARGUMEN 'prompt' HARUS SANGAT DESKRIPTIF DAN MENGGABUNGKAN:
  1) Deskripsi mendalam dari gambar asli (pakaian subjek seperti hijab atau kemeja, warna pakaian, jenis kelamin, ras/etnis, pose, ekspresi, objek di dekat mereka, dan latar belakang tempat).
  2) Perubahan/edit yang diminta oleh pengguna secara spesifik.`;
  }, [inspectedMessage]);

  const renderMessageModeBadge = (msg: ChatMessage, msgIndex: number) => {
    if (msg.role !== 'user') return null;
    const mode = getMessageMode(msg, msgIndex);
    if (mode === 'generate') {
      return (
        <span className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/20 uppercase">
          🎨 Generate Mode
        </span>
      );
    }
    if (mode === 'edit') {
      return (
        <span className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider text-blue-400 bg-blue-950/40 border border-blue-500/20 uppercase">
          ✏️ Edit Mode
        </span>
      );
    }
    if (mode === 'discuss') {
      return (
        <span className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider text-purple-400 bg-purple-950/40 border border-purple-500/20 uppercase">
          💬 Discuss Mode
        </span>
      );
    }
    return null;
  };
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll & scroll-to-bottom handlers
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const isUserScrollingRef = useRef(false);

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        if (smooth) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom > 300) {
      setShowScrollToBottom(true);
      isUserScrollingRef.current = true;
    } else {
      setShowScrollToBottom(false);
      // Only release scroll lock if we are REALLY at the bottom
      if (distanceFromBottom < 10) {
        isUserScrollingRef.current = false;
      }
    }
  };

  // ResizeObserver to track container content height updates during streaming
  useEffect(() => {
    if (!messagesContentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!isUserScrollingRef.current) {
        scrollToBottom(false);
      }
    });
    observer.observe(messagesContentRef.current);
    return () => observer.disconnect();
  }, [messages.length]);

  // Reset scroll lock when a new message is sent / generation starts
  useEffect(() => {
    if (isLoading) {
      isUserScrollingRef.current = false;
      scrollToBottom(false);
    }
  }, [isLoading]);

  // Auto-scroll when messages update or during streaming
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom(false);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleExport = (format: 'txt' | 'json') => {
    if (messages.length === 0) return;

    let content = '';
    let fileName = `navix-chat-${new Date().toISOString().split('T')[0]}`;
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      fileName += '.json';
      mimeType = 'application/json';
    } else {
      content = messages.map(m => {
        const timestamp = new Date(m.timestamp).toLocaleString();
        const role = m.role === 'user' ? 'USER' : 'NAVIX AI';
        return `[${timestamp}] ${role}:\n${m.text}\n${'-'.repeat(40)}\n`;
      }).join('\n');
      fileName += '.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const showErrorBox = (message: string) => {
    setUiError(message);
    setTimeout(() => {
      setUiError(null);
    }, 4000);
  };

  const showSuccessToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleCopy = async (id: string, text: string) => {
    if (!text) return;
    try {
      const success = await fallbackCopyTextToClipboard(text);
      if (success) {
        setCopiedId(id);
        showSuccessToast("Teks berhasil disalin ke clipboard!");
        setTimeout(() => setCopiedId(null), 2500);
      } else {
        showErrorBox("Gagal menyalin teks ke clipboard.");
      }
    } catch (err) {
      console.error("Gagal melakukan copy:", err);
      showErrorBox("Gagal menyalin teks.");
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      showErrorBox("Browser Anda tidak mendukung fitur suara (Text-to-Speech bawaan).");
      return;
    }

    if (speakingId === id) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Speech cancel error:", e);
      }
      utteranceRef.current = null;
      setSpeakingId(null);
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Speech synthesis reset error:", e);
    }

    let cleanText = text
      .replace(/```[\s\S]*?```/g, " Kode program disembunyikan. ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_#~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      showErrorBox("Tidak ada teks yang dapat dibaca.");
      return;
    }

    setSpeakingId(id);

    let voices = window.speechSynthesis.getVoices();
    let indoVoice = voices.find(v => 
      v.lang.toLowerCase().includes('id') || 
      v.name.toLowerCase().includes('indonesia') || 
      v.name.toLowerCase().includes('indonesi')
    );

    const sentenceList = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];
    const chunks: string[] = [];
    let cur = "";

    for (const s of sentenceList) {
      if ((cur + s).length > 180) {
        if (cur.trim()) chunks.push(cur.trim());
        cur = s;
      } else {
        cur += " " + s;
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
    if (chunks.length === 0) chunks.push(cleanText);

    let currentChunkIndex = 0;

    const playNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        setSpeakingId(null);
        utteranceRef.current = null;
        return;
      }

      try {
        const chunkText = chunks[currentChunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (indoVoice) {
          utterance.voice = indoVoice;
        }

        utterance.onend = () => {
          currentChunkIndex++;
          playNextChunk();
        };

        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn("TTS Error on chunk:", e);
          }
          if (e.error === 'interrupted' || e.error === 'canceled' || currentChunkIndex >= chunks.length - 1) {
            setSpeakingId(null);
            utteranceRef.current = null;
          } else {
            currentChunkIndex++;
            playNextChunk();
          }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error("Speak execution failed:", err);
        showErrorBox("Gagal memutar suara.");
        setSpeakingId(null);
        utteranceRef.current = null;
      }
    };

    if (!voices || voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        indoVoice = voices.find(v => 
          v.lang.toLowerCase().includes('id') || 
          v.name.toLowerCase().includes('indonesia') || 
          v.name.toLowerCase().includes('indonesi')
        );
      };
    }

    playNextChunk();
  };

  const handleShare = async (text: string) => {
    if (!text) return;

    let cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_#~>]/g, "")
      .trim();

    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Navix AI',
          text: cleanText || text
        });
        showSuccessToast("Berhasil membagikan pesan!");
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError' || String(err?.message)?.toLowerCase()?.includes('cancel')) {
          return;
        }
        console.warn("Native share error or restricted in iframe, fallback to clipboard:", err);
      }
    }
    
    try {
      const success = await fallbackCopyTextToClipboard(cleanText || text);
      if (success) {
        showSuccessToast("Pesan disalin ke clipboard! Siap dibagikan.");
      } else {
        showErrorBox("Gagal menyalin pesan untuk dibagikan.");
      }
    } catch (clipErr) {
      console.error("Share fallback error:", clipErr);
      showErrorBox("Gagal membagikan pesan.");
    }
  };

  const handleDownloadAttachment = async (e: React.MouseEvent, url: string, defaultFilename: string) => {
    e.preventDefault();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: just open in new tab
      window.open(url, '_blank');
    }
  };

  const renderMessageAttachments = (atts: Attachment[]) => {
    if (!atts || atts.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-3 mt-2.5 w-full">
        {atts.map((att, i) => {
          const imgSrc = (att.url && !att.url.startsWith('base64_data_omitted'))
            ? att.url
            : (att.data ? `data:${att.mimeType || 'image/png'};base64,${att.data}` : '');
          
          if (att.type === 'image') {
            return (
              <UncompressedAttachmentImage 
                key={i}
                rawSrc={imgSrc}
                name={att.name}
                onOpenLightbox={(src, prompt) => setLightboxData({
                  isOpen: true,
                  src,
                  prompt
                })}
                onDownload={handleDownloadAttachment}
              />
            );
          }

          return (
            <div key={i} className="relative rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 max-w-[260px] md:max-w-[340px]">
              {att.type === 'video' && (
                <div className="relative group">
                  <video src={imgSrc || att.url} controls className="w-full h-auto max-h-64" />
                  <button 
                    onClick={(e) => handleDownloadAttachment(e, imgSrc || att.url, 'navix_video.mp4')}
                    className="absolute bottom-12 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10 flex items-center gap-2 text-xs font-medium z-10"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              )}
              {att.type === 'audio' && (
                <div className="p-3 w-64 bg-neutral-800 flex flex-col gap-2 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <FileAudio size={18} />
                    <span className="text-sm font-medium">Voice Note</span>
                  </div>
                  <audio src={imgSrc || att.url} controls className="w-full h-8" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };



  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] relative min-w-0 w-full max-w-full overflow-hidden">
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-lg text-sm shadow-xl flex items-center gap-2 backdrop-blur-sm">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="ml-2 text-emerald-400 hover:text-emerald-300 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      {uiError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm shadow-xl flex items-center gap-2 backdrop-blur-sm">
            <span className="font-mono">{uiError}</span>
            <button onClick={() => setUiError(null)} className="ml-2 text-red-400 hover:text-red-300 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30 w-full shrink-0">
        <div className="flex items-center">
          <button 
            onClick={onOpenSidebar}
            className="min-w-[44px] min-h-[44px] p-2.5 -ml-2 text-neutral-400 hover:text-white transition-all rounded-xl hover:bg-neutral-800/70 active:bg-neutral-800 active:scale-95 flex items-center justify-center cursor-pointer select-none"
            title="Buka Menu Sidebar"
            aria-label="Buka Menu Sidebar"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-sm sm:text-base text-neutral-200 ml-1">Navix Ai</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 font-mono tracking-tighter hidden sm:inline">OMEGA</span>
        </div>
        
        <div className="flex items-center gap-1.5">

          <button 
            onClick={onToggleImagePanel}
            className={`p-2 transition-all duration-300 flex items-center gap-2 text-sm font-medium rounded-lg border ${
              isImagePanelOpen 
                ? 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
            title="Buka Studio Gambar (Navix AI Vision Studio)"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span className="hidden sm:inline font-sans">Create Images</span>
          </button>

          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 transition-all duration-300 flex items-center gap-2 text-sm font-medium rounded-lg ${
              voiceEnabled 
                ? 'text-green-500 hover:text-green-400 hover:bg-green-500/10' 
                : 'text-neutral-500 hover:text-neutral-400 hover:bg-neutral-800/50'
            }`}
            title={voiceEnabled ? "Mute Voice Response (TTS) to save API quota" : "Unmute Voice Response (TTS)"}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {messages.length > 0 && (
            <>
              <button 
                type="button"
                onClick={() => {
                  onClearMessages();
                  showSuccessToast("Seluruh pesan berhasil dibersihkan permanen");
                }}
                className="p-2 text-neutral-400 hover:text-red-500 active:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium rounded-lg hover:bg-neutral-800/50 cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] justify-center"
                title="Hapus seluruh riwayat pesan di obrolan ini"
                aria-label="Bersihkan semua pesan"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Clear</span>
              </button>
              
              <div className="relative" ref={exportMenuRef}>
                <button 
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium rounded-lg hover:bg-neutral-800/50 cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] justify-center"
                  title="Export Conversation"
                  aria-label="Ekspor percakapan"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1c1c1c] border border-neutral-800 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => handleExport('txt')}
                      className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-3 transition-colors"
                    >
                      <FileText size={16} className="text-neutral-500" />
                      <span>Download as .txt</span>
                    </button>
                    <button 
                      onClick={() => handleExport('json')}
                      className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-3 transition-colors border-t border-neutral-800"
                    >
                      <FileJson size={16} className="text-neutral-500" />
                      <span>Download as .json</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className="flex-1 flex flex-col overflow-hidden h-full relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-[#0a0a0a]/0 to-[#0a0a0a]/0 pointer-events-none" />
          
          <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-4 w-full pb-4 shadow-inner custom-scrollbar touch-pan-y overscroll-y-contain">
        {messages.length === 0 ? (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-6 md:p-8 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light text-neutral-300 tracking-tight mb-2">
              <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent font-medium tracking-widest">NAVIX OMEGA</span>
            </h1>
            <p className="text-neutral-500 text-sm font-mono tracking-widest uppercase mb-8">Universal Swarm Intelligence</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
              <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-lg flex flex-col items-center justify-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1 mb-1"></div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Harvester</span>
                <span className="text-xs text-neutral-300 font-bold">ACTIVE</span>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-lg flex flex-col items-center justify-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1 mb-1"></div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Vector DB</span>
                <span className="text-xs text-neutral-300 font-bold">SYNCED</span>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-lg flex flex-col items-center justify-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1 mb-1"></div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Swarm Nodes</span>
                <span className="text-xs text-neutral-300 font-bold">5/5 ONLINE</span>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-lg flex flex-col items-center justify-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1 mb-1"></div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Fail-Safe</span>
                <span className="text-xs text-neutral-300 font-bold">REDUNDANT</span>
              </div>
            </div>
            
            <p className="text-neutral-600 text-xs font-mono mb-8 italic">Zero-Cost Architecture initialized. Awaiting market query...</p>

            <div className="w-full">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-3 text-left">Pilih Pertanyaan Cepat:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => onSendMessage("Kenapa lemot yaa?")}
                  className="bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-red-500/30 text-left p-4 rounded-xl transition-all group flex flex-col gap-1 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-red-500 group-hover:text-red-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    ⚡ DIAGNOSTIK SYSTEM
                  </span>
                  <span className="text-sm text-neutral-300 font-medium">Kenapa lemot yaa?</span>
                </button>
                <button 
                  onClick={() => onSendMessage("Analisa teknikal BTCUSDT menggunakan metode SMC/ICT")}
                  className="bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-red-500/30 text-left p-4 rounded-xl transition-all group flex flex-col gap-1 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-red-500 group-hover:text-red-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    📊 TRADING SIGNAL
                  </span>
                  <span className="text-sm text-neutral-300 font-medium">Analisa teknikal BTCUSDT hari ini</span>
                </button>
                <button 
                  onClick={() => onSendMessage("Berikan sinyal akurat untuk Gold XAUUSD")}
                  className="bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-red-500/30 text-left p-4 rounded-xl transition-all group flex flex-col gap-1 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-red-500 group-hover:text-red-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    🏆 EMAS / SPOT GOLD
                  </span>
                  <span className="text-sm text-neutral-300 font-medium">Berikan sinyal akurat untuk Gold XAUUSD</span>
                </button>
                <button 
                  onClick={() => onSendMessage("Buat analisis fundamental makroekonomi pasar global terbaru")}
                  className="bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800 hover:border-red-500/30 text-left p-4 rounded-xl transition-all group flex flex-col gap-1 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-red-500 group-hover:text-red-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    🌍 GLOBAL MARKET
                  </span>
                  <span className="text-sm text-neutral-300 font-medium">Analisis fundamental pasar global</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div ref={messagesContentRef} className="max-w-3xl w-full mx-auto py-6">
            <div className="space-y-6 pb-28 sm:pb-36">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`flex gap-2 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex flex-col items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-1">
                      <span className="text-white text-[10px] md:text-xs font-bold tracking-tighter">NX</span>
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end max-w-[85%] md:max-w-[80%]' : 'items-start w-full min-w-0'} group`}>
                    {msg.role === 'ai' && (msg.thinkingState || (isLoading && idx === messages.length - 1 && thinkingState?.isThinking)) && (
                      <div className="mb-2 w-full max-w-2xl">
                        <ThinkingIndicator 
                          {...thinkingState}
                          {...(msg.thinkingState || {})}
                        />
                      </div>
                    )}
                    
                    {msg.text && (
                      <div className={`w-full overflow-visible break-words [word-break:break-word] [hyphens:auto] ${
                        msg.role === 'user' 
                          ? 'bg-neutral-800 text-neutral-100 rounded-3xl rounded-tr-sm px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base shadow-sm' 
                          : 'text-neutral-200 leading-relaxed w-full py-1'
                      }`}>
                        <MemoizedMessageContent text={msg.text} role={msg.role} msgId={msg.id} messagesRef={messagesRef} />
                      </div>
                    )}
                    {msg.attachments && renderMessageAttachments(msg.attachments)}
                    
                    {msg.role === 'user' && (
                      <div className="flex items-center gap-1.5 mt-1 px-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(msg.id, msg.text);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 rounded transition-colors cursor-pointer"
                          title="Salin teks"
                          aria-label="Salin teks"
                        >
                          {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                        {onDeleteMessage && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMessage(msg.id);
                              showSuccessToast("Pesan berhasil dihapus permanen");
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                            title="Hapus pesan ini secara permanen"
                            aria-label="Hapus pesan"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    )}

                    {msg.role === 'ai' && msg.text && (
                      <div className="flex items-center gap-2 mt-2 px-1 opacity-100 transition-opacity relative z-10 pointer-events-auto">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(msg.id, msg.text);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/50 rounded-md transition-colors cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(msg.text);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/50 rounded-md transition-colors cursor-pointer"
                          title="Share message"
                        >
                          <Share2 size={14} />
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(msg.id, msg.text);
                          }}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            speakingId === msg.id ? 'text-green-500 hover:text-green-400 bg-neutral-800/50' : 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800/50'
                          }`}
                          title={speakingId === msg.id ? "Stop voice" : "Read aloud"}
                        >
                          {speakingId === msg.id ? <X size={14} /> : <Volume2 size={14} />}
                        </button>

                        {onDeleteMessage && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMessage(msg.id);
                              showSuccessToast("Pesan berhasil dihapus permanen");
                            }}
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
                            title="Hapus pesan ini secara permanen"
                            aria-label="Hapus pesan"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (() => {
                const lastMsg = messages[messages.length - 1];
                // Don't render duplicate loading indicator if the last message in stream is already AI
                if (lastMsg && lastMsg.role === 'ai') return null;

                const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                const lastUserIdx = lastUserMsg ? messages.indexOf(lastUserMsg) : -1;
                const mode = lastUserMsg && lastUserIdx !== -1 ? getMessageMode(lastUserMsg, lastUserIdx) : 'none';
                
                return (
                  <div className="flex gap-2 md:gap-4 justify-start items-start">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex flex-col items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-1">
                      <span className="text-white text-[10px] md:text-xs font-bold tracking-tighter">NX</span>
                    </div>
                    <div className="flex flex-col items-start w-full min-w-0">
                      {mode !== 'none' && (
                        <div className="mb-1.5">
                          {mode === 'generate' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 uppercase animate-pulse">
                              🎨 Generate Mode
                            </span>
                          )}
                          {mode === 'edit' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider text-blue-400 bg-blue-950/60 border border-blue-500/30 uppercase animate-pulse">
                              ✏️ Edit Mode
                            </span>
                          )}
                          {mode === 'discuss' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider text-purple-400 bg-purple-950/60 border border-purple-500/30 uppercase animate-pulse">
                              💬 Discuss Mode
                            </span>
                          )}
                        </div>
                      )}
                      
                      {(() => {
                        const userText = lastUserMsg?.text || '';
                        const isHeavy = isHeavyTask(userText);
                        const isThinkingActive = aiBooster || isHeavy || thinkingMode;

                        if (isThinkingActive) {
                          const { taskType, complexity } = classifyTask(userText);
                          const taskPlan = createTaskPlan(userText, taskType, complexity, 8);
                          return (
                            <ThinkingIndicator 
                              isThinking={true}
                              effort={(effortLevel as EffortLevel) || 'medium'}
                              taskType={taskType}
                              completedSteps={thinkingState?.completedSteps || []}
                              currentStep={thinkingState?.currentStep || taskPlan.steps[0]}
                              plan={taskPlan}
                              aiBooster={aiBooster}
                            />
                          );
                        } else {
                          return (
                            <div className="flex items-center gap-1.5 py-2 pl-1 select-none">
                              <span className="text-xs text-neutral-500 font-medium tracking-wide">Navix is writing...</span>
                              <div className="flex gap-1 items-center">
                                <motion.span 
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                                  className="w-1.5 h-1.5 rounded-full bg-neutral-500" 
                                />
                                <motion.span 
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                                  className="w-1.5 h-1.5 rounded-full bg-neutral-500" 
                                />
                                <motion.span 
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                                  className="w-1.5 h-1.5 rounded-full bg-neutral-500" 
                                />
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                );
              })()}
              <div ref={bottomRef} className="h-20 w-full shrink-0" />
            </div>
          </div>
        )}
      </div>

          <ChatInput 
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            showErrorBox={showErrorBox}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            effortLevel={effortLevel}
            setEffortLevel={setEffortLevel}
            thinkingMode={thinkingMode}
            setThinkingMode={setThinkingMode}
            showScrollToBottom={showScrollToBottom}
            onScrollToBottom={() => {
              isUserScrollingRef.current = false;
              scrollToBottom(false);
            }}
          />
        </div>
      </div>

      {/* Full-Resolution Lossless MediaVault Image Lightbox */}
      {lightboxData && (
        <ImageLightbox
          isOpen={lightboxData.isOpen}
          onClose={() => setLightboxData(null)}
          src={lightboxData.src}
          mediaKey={lightboxData.mediaKey}
          prompt={lightboxData.prompt}
          alt={lightboxData.alt}
        />
      )}
    </div>
  );
}
