import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const content = input;
    setInput('');
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#121212] rounded-xl border border-white/10 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#00E5FF]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#00E5FF]" />
          Navix Orchestrator
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Connected to Thinking & Knowledge Engines</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00E5FF]/20 to-[#BD00FF]/20 border border-white/10 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-[#00E5FF]" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">How can I assist you today?</h3>
            <p className="text-gray-500 text-sm">
              I am connected to the Master Architecture. I can execute trades, search vectors, generate media, or analyze data.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.role !== 'user';
            const isSystem = msg.role === 'system';
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "flex gap-4 max-w-[85%]",
                  isBot ? "mr-auto" : "ml-auto flex-row-reverse"
                )}
              >
                <div className={clsx(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
                  isSystem 
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : isBot
                      ? "bg-gradient-to-tr from-[#00E5FF]/20 to-[#BD00FF]/20 border-white/10 text-[#00E5FF]"
                      : "bg-gray-800 border-white/10 text-gray-300"
                )}>
                  {isSystem ? <Bot className="w-4 h-4" /> : isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>

                <div className={clsx(
                  "px-5 py-3.5 rounded-2xl",
                  isSystem
                    ? "bg-red-500/5 border border-red-500/10 text-red-200 text-sm"
                    : isBot 
                      ? "bg-white/5 border border-white/10 text-gray-200" 
                      : "bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-white"
                )}>
                  {isBot && !isSystem ? (
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-4 max-w-[85%] mr-auto"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF]/20 to-[#BD00FF]/20 border border-white/10 flex items-center justify-center text-[#00E5FF]">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10 relative z-10">
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message to Navix Engine..."
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all shadow-inner"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-lg bg-[#00E5FF] text-black hover:bg-[#00D4FF] disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-600 font-medium tracking-wide uppercase">Navix Core v1.0 • Secure Connection</span>
        </div>
      </div>
    </div>
  );
};
