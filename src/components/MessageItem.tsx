import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import { ShadowEngineCard } from './ShadowEngineCard';
import { MediaCard } from './MediaCard';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Code2, 
  Sparkles 
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showChartOverride, setShowChartOverride] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message.content.replace(/[*#`]/g, ''));
        utterance.lang = 'id-ID';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const isMediaMessage = message.content && (
    message.content.includes('```media') || 
    message.content.includes('```json media') || 
    message.content.includes('```media-engine') ||
    message.content.includes('```shadow-engine')
  );

  // Extract media blocks for pure rendering
  const mediaBlocks: any[] = [];
  if (isMediaMessage) {
    const regex = /```(?:media|json media|media-engine|shadow-engine)\s*([\s\S]*?)\s*```/g;
    let match;
    while ((match = regex.exec(message.content)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        mediaBlocks.push(parsed);
      } catch (e) {
        console.error("Failed to parse media block in MessageItem:", e);
      }
    }
  }

  return (
    <div className={`py-6 px-4 md:px-8 border-b border-slate-900/60 transition-colors ${
      isUser ? 'bg-slate-950/40' : 'bg-slate-900/40'
    }`}>
      <div className="max-w-4xl mx-auto flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 text-white'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">
                {isUser ? 'Anda' : 'NAVIX AI'}
              </span>
              {!isUser && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {isMediaMessage ? 'Creative Studio' : 'Smart AI'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Thinking process indicator if active */}
          {message.isThinking && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>NAVIX AI sedang memproses...</span>
            </div>
          )}

          {/* PURE MEDIA OUTPUT RENDERING (Clean, zero clutter, no text chatter if media exists) */}
          {isMediaMessage && mediaBlocks.length > 0 ? (
            <div className="space-y-4">
              {mediaBlocks.map((mediaData, idx) => {
                if (mediaData.job_id && mediaData.pipeline) {
                  return <ShadowEngineCard key={idx} data={mediaData} />;
                }
                return <MediaCard key={idx} media={mediaData} />;
              })}
            </div>
          ) : (
            /* Standard Text/Code markdown rendering when not a pure media message */
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 space-y-3">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    if (!inline && language === 'pinescript') {
                      return <PineScriptViewer code={String(children).replace(/\n$/, '')} />;
                    }

                    if (!inline && (language === 'media' || language === 'media-engine')) {
                      try {
                        const cleanJSON = String(children).trim();
                        const parsed = JSON.parse(cleanJSON);
                        if (parsed.type) {
                          return <MediaCard media={parsed} />;
                        }
                      } catch (e) {
                        console.error("Failed to parse media JSON:", e);
                      }
                    }

                    if (!inline && language === 'shadow-engine') {
                      try {
                        const cleanJSON = String(children).trim();
                        const parsed = JSON.parse(cleanJSON);
                        if (parsed.job_id && parsed.pipeline) {
                          return <ShadowEngineCard data={parsed} />;
                        }
                      } catch (e) {
                        console.error("Failed to parse shadow-engine JSON:", e);
                      }
                    }

                    if (!inline && match) {
                      return (
                        <div className="my-3 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                            {language}
                          </div>
                          <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto">
                            <code>{children}</code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* CONDITIONAL INTENT RENDERING - ONLY show Chart or PineScript if message explicitly requested it AND not a media message! */}

          {/* Action Bar */}
          {!isUser && message.content && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/40">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors py-1 px-2 rounded hover:bg-slate-800/50"
                  title="Salin teks"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>

                {!isMediaMessage && (
                  <button
                    onClick={handleSpeak}
                    className="flex items-center gap-1 hover:text-slate-200 transition-colors py-1 px-2 rounded hover:bg-slate-800/50"
                    title="Dengarkan jawaban"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Berhenti' : 'Baca Teks'}</span>
                  </button>
                )}

                {!isMediaMessage && !message.hasChartIntent && (
                  <button
                    onClick={() => setShowChartOverride(!showChartOverride)}
                    className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2 rounded hover:bg-slate-800/50"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{showChartOverride ? 'Sembunyikan Chart' : 'Lihat Chart Pasar'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
