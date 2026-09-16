import { create } from 'zustand';
import { ChatSession, Message, AIMode, MarketMeta } from '../types/chat';
import { rotateFetch } from '../lib/apiKeyRotator';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeMode: AIMode;
  isLoading: boolean;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  systemInstruction: string;
  
  // Actions
  setActiveMode: (mode: AIMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setSystemInstruction: (inst: string) => void;
  createSession: (mode?: AIMode) => string;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearActiveSessionMessages: () => void;
  sendMessage: (content: string, attachments?: any[]) => Promise<void>;
}

// Default system instruction
const DEFAULT_SYSTEM_INSTRUCTION = 
  'Anda adalah NAVIX AI, asisten AI trading & pemrograman profesional yang sangat cerdas, ' +
  'terstruktur, dan komunikatif. Anda memberikan penjelasan yang mendalam, kode yang bersih (clean code), ' +
  'dan analisis pasar yang akurat. ' +
  'Jika pengguna bertanya tentang kode Pine Script, tulislah di dalam blok kode ```pinescript ... ``` agar dapat dirender dengan indah.';

// Load initial sessions from localStorage if available
const getInitialSessions = (): ChatSession[] => {
  try {
    const saved = localStorage.getItem('navix_ai_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved sessions:', e);
  }

  // Fallback initial session
  const initialId = 'welcome-session';
  return [
    {
      id: initialId,
      title: 'Selamat Datang di NAVIX AI',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: 'general',
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: 
            'Halo! Saya **NAVIX AI v2.5**, asisten cerdas Anda.\n\n' +
            'Saya siap membantu Anda dalam:\n' +
            '- 💬 **Konsultasi Umum**: Tanya jawab topik apa saja secara presisi.\n' +
            '- 💻 **Coding & Debugging**: Membuat, menganalisis, dan memperbaiki kode Anda.\n' +
            '- 🧠 **Deep Thinking**: Pemecahan masalah rumit dengan penalaran mendalam.\n' +
            '- 📈 **Analisis Pasar & Trading**: Pembuatan indikator Pine Script v5 dan visualisasi chart.\n\n' +
            'Silakan pilih salah satu contoh pertanyaan di bawah atau ketik langsung pertanyaan Anda!',
          timestamp: Date.now()
        }
      ]
    }
  ];
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: getInitialSessions(),
  activeSessionId: localStorage.getItem('navix_ai_active_id') || 'welcome-session',
  activeMode: 'general',
  isLoading: false,
  isSidebarOpen: true,
  isSettingsOpen: false,
  systemInstruction: localStorage.getItem('navix_ai_system_instruction') || DEFAULT_SYSTEM_INSTRUCTION,

  setActiveMode: (mode) => set({ activeMode: mode }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setSystemInstruction: (inst) => {
    localStorage.setItem('navix_ai_system_instruction', inst);
    set({ systemInstruction: inst });
  },

  createSession: (mode = 'general') => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: mode === 'market_analysis' ? 'Analisis Pasar Baru' : mode === 'coding' ? 'Sesi Coding Baru' : 'Obrolan Baru',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      mode: mode
    };

    set((state) => {
      const updated = [newSession, ...state.sessions];
      localStorage.setItem('navix_ai_sessions', JSON.stringify(updated));
      localStorage.setItem('navix_ai_active_id', newId);
      return {
        sessions: updated,
        activeSessionId: newId,
        activeMode: mode
      };
    });

    return newId;
  },

  selectSession: (id) => {
    localStorage.setItem('navix_ai_active_id', id);
    set((state) => {
      const session = state.sessions.find(s => s.id === id);
      return {
        activeSessionId: id,
        activeMode: session ? session.mode : 'general'
      };
    });
  },

  deleteSession: (id) => {
    set((state) => {
      const filtered = state.sessions.filter(s => s.id !== id);
      let nextActiveId = state.activeSessionId;

      if (state.activeSessionId === id) {
        nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      }

      localStorage.setItem('navix_ai_sessions', JSON.stringify(filtered));
      if (nextActiveId) {
        localStorage.setItem('navix_ai_active_id', nextActiveId);
      } else {
        localStorage.removeItem('navix_ai_active_id');
      }

      return {
        sessions: filtered,
        activeSessionId: nextActiveId
      };
    });
  },

  clearActiveSessionMessages: () => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;

    set((state) => {
      const updated = state.sessions.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [], updatedAt: Date.now() };
        }
        return s;
      });
      localStorage.setItem('navix_ai_sessions', JSON.stringify(updated));
      return { sessions: updated };
    });
  },

  sendMessage: async (content, attachments = []) => {
    const { activeSessionId, sessions, activeMode, systemInstruction } = get();
    let currentSessionId = activeSessionId;

    // Create session if none active
    if (!currentSessionId || sessions.length === 0) {
      currentSessionId = get().createSession(activeMode);
    }

    const userMessageId = `msg-${Date.now()}-user`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: content,
      timestamp: Date.now()
    };

    // Update session title based on first user message
    set((state) => {
      const updated = state.sessions.map((s) => {
        if (s.id === currentSessionId) {
          const isFirstRealMsg = s.messages.length === 0 || (s.messages.length === 1 && s.messages[0].id === 'welcome-msg');
          const newTitle = isFirstRealMsg 
            ? (content.slice(0, 30) + (content.length > 30 ? '...' : '')) 
            : s.title;
          const cleanMessages = s.messages.filter(m => m.id !== 'welcome-msg');
          return {
            ...s,
            title: newTitle,
            messages: [...cleanMessages, userMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      });
      localStorage.setItem('navix_ai_sessions', JSON.stringify(updated));
      return { sessions: updated, isLoading: true };
    });

    // Assistant placeholder
    const assistantMessageId = `msg-${Date.now()}-assistant`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 50,
      isThinking: true,
      modelUsed: 'gemini-3.6-flash'
    };

    set((state) => {
      const updated = state.sessions.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantPlaceholder],
            updatedAt: Date.now()
          };
        }
        return s;
      });
      return { sessions: updated };
    });

    try {
      // Get conversation history for context
      const currentSession = get().sessions.find(s => s.id === currentSessionId);
      const historyMessages = currentSession ? currentSession.messages.slice(0, -1) : []; // exclude the thinking placeholder
      
      // Map history to Gemini format
      const geminiContents = historyMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add mode specific guidelines to system instruction
      let modeGuideline = '';
      if (activeMode === 'deep_thinking') {
        modeGuideline = '\n[MODE: DEEP THINKING] Lakukan analisis mendalam, uraikan langkah demi langkah secara logis sebelum memberikan kesimpulan.';
      } else if (activeMode === 'coding') {
        modeGuideline = '\n[MODE: CODING] Berikan penjelasan coding yang optimal, fokus pada efisiensi, sertakan komentar penjelasan di dalam kode.';
      } else if (activeMode === 'market_analysis') {
        modeGuideline = '\n[MODE: ANALISIS PASAR] Fokus pada analisis pasar finansial, chart pattern, trading strategi, dan script TradingView Pine Script v5.';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const res = await rotateFetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          model: 'gemini-3.6-flash',
          history: geminiContents,
          disableTts: true,
          thinkingMode: activeMode === 'deep_thinking'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      const replyContent = data.text || 'Maaf, saya tidak dapat menghasilkan respon.';

      // Determine intent (hasChartIntent / hasPineScriptIntent)
      const lowercasePrompt = content.toLowerCase();
      const lowercaseReply = replyContent.toLowerCase();
      
      let hasChartIntent = false;
      let symbol = 'BTCUSDT';
      
      // Detect chart requests and symbols
      if (
        lowercasePrompt.includes('chart') || 
        lowercasePrompt.includes('grafik') || 
        lowercasePrompt.includes('harga') || 
        lowercasePrompt.includes('analisis teknik')
      ) {
        hasChartIntent = true;
        // Simple symbol extractor
        if (lowercasePrompt.includes('eth') || lowercasePrompt.includes('ethereum')) symbol = 'ETHUSDT';
        else if (lowercasePrompt.includes('sol') || lowercasePrompt.includes('solana')) symbol = 'SOLUSDT';
        else if (lowercasePrompt.includes('gold') || lowercasePrompt.includes('xau')) symbol = 'GOLD';
        else if (lowercasePrompt.includes('forex') || lowercasePrompt.includes('eurusd')) symbol = 'FX:EURUSD';
      }

      // Detect Pine Script code blocks
      const hasPineScriptIntent = lowercaseReply.includes('```pinescript') || lowercasePrompt.includes('pine script');
      let pineScriptCode = '';
      if (hasPineScriptIntent) {
        const match = replyContent.match(/```pinescript\n([\s\S]*?)```/);
        if (match && match[1]) {
          pineScriptCode = match[1].trim();
        }
      }

      const marketMeta: MarketMeta = {};
      if (hasChartIntent) marketMeta.symbol = symbol;
      if (hasPineScriptIntent && pineScriptCode) marketMeta.pineScriptCode = pineScriptCode;

      // Update message state with actual response
      set((state) => {
        const updated = state.sessions.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: replyContent,
                    isThinking: false,
                    hasChartIntent,
                    hasPineScriptIntent,
                    marketMeta
                  };
                }
                return m;
              }),
              updatedAt: Date.now()
            };
          }
          return s;
        });
        localStorage.setItem('navix_ai_sessions', JSON.stringify(updated));
        
        // Cloud Firestore Session Sync
        try {
          const syncedSession = updated.find(s => s.id === currentSessionId);
          if (syncedSession) {
            import('../services/firestoreSync').then(({ firestoreSync }) => {
              firestoreSync.saveSession({
                id: syncedSession.id,
                title: syncedSession.title,
                messages: syncedSession.messages.map(m => ({
                  id: m.id,
                  role: m.role === 'user' ? 'user' : 'ai',
                  text: m.content,
                  timestamp: new Date(m.timestamp)
                })),
                updatedAt: new Date(syncedSession.updatedAt)
              }).catch(() => {});
            }).catch(() => {});
          }
        } catch {
          // offline fallback
        }

        return { sessions: updated, isLoading: false };
      });

    } catch (err: any) {
      console.error('Error generating reply:', err);
      const errorMessage = err.message || 'Terjadi kesalahan sistem saat menghubungi server AI.';

      set((state) => {
        const updated = state.sessions.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: `❌ **Error:** ${errorMessage}`,
                    isThinking: false
                  };
                }
                return m;
              }),
              updatedAt: Date.now()
            };
          }
          return s;
        });
        return { sessions: updated, isLoading: false };
      });
    }
  }
}));
