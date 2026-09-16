import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AIStudioCanvas } from './components/AIStudioCanvas';
import { DocumentEditor } from './components/DocumentEditor';
import { ScienceSandbox } from './components/ScienceSandbox';
import { CloudConsole } from './components/CloudConsole';
import { ImageGenerationPanel } from './components/ImageGenerationPanel';
import { ToastContainer } from './components/ToastContainer';
import { LandingLoginScreen } from './components/auth/LandingLoginScreen';
import { PaymentModal } from './components/PaymentModal';
import { useAuthStore } from './store/useAuthStore';
import { ChatSession, ChatMessage, Attachment, NavixAppView } from './types';
import { orchestrator } from './services/Orchestrator';
import { classifyTask, decideEffort, buildToolBudget, createTaskPlan, EffortLevel, isHeavyTask } from './services/ThinkingEngine';
import { firestoreSync } from './services/firestoreSync';
import { QuotaService } from './services/quotaService';
import { showToast } from './utils/toast';
import { ThinkingStateData } from './components/ThinkingIndicator';

// Studios
import { ImageStudio } from './components/studios/ImageStudio';
import { StockImageStudio } from './components/studios/StockImageStudio';
import { VideoStudio } from './components/studios/VideoStudio';
import { AudioStudio } from './components/studios/AudioStudio';
import { MediaLibrary } from './components/studios/MediaLibrary';
import { AIAgentsStudio } from './components/studios/AIAgentsStudio';
import { AppConnectorsStudio } from './components/studios/AppConnectorsStudio';
import { PluginsStudio } from './components/studios/PluginsStudio';
import { ApiKeysStudio } from './components/studios/ApiKeysStudio';
import { KnowledgeBaseStudio } from './components/studios/KnowledgeBaseStudio';
import { AutomationsStudio } from './components/studios/AutomationsStudio';
import { ProjectsIsolationStudio } from './components/studios/ProjectsIsolationStudio';
import { CloudMarketStudio } from './components/trading/CloudMarketStudio';
import { AdminDashboard } from './components/admin/AdminDashboard';

function MainChatApp() {
  const { user } = useAuthStore();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('navix_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    }
    const defaultId = Date.now().toString();
    return [{
      id: defaultId,
      title: 'Obrolan Baru',
      messages: [],
      updatedAt: new Date()
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || Date.now().toString();
  });

  const [currentView, setCurrentView] = useState<NavixAppView>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [effortLevel, setEffortLevel] = useState<string>('auto');
  const [thinkingMode, setThinkingMode] = useState<boolean>(true);
  // Pendorong Kinerja AI terhubung langsung & permanen di balik layar (always-on under the hood)
  const aiBooster = true;
  const [thinkingState, setThinkingState] = useState<ThinkingStateData | undefined>(undefined);

  // Smart merge between local memory state and Cloud Firestore data
  const mergeSessionsWithCloud = (localList: ChatSession[], cloudList: ChatSession[]): ChatSession[] => {
    const sessionMap = new Map<string, ChatSession>();

    // 1. Populate all local sessions that are not marked as deleted
    localList
      .filter(ls => !firestoreSync.isSessionDeleted(ls.id))
      .forEach(ls => {
        const validLocalMessages = (ls.messages || []).filter(
          m => !firestoreSync.isMessageDeleted(ls.id, m.id) && !firestoreSync.isMessageCleared(ls.id, m.timestamp)
        );
        sessionMap.set(ls.id, { ...ls, messages: validLocalMessages });
      });

    // 2. Intelligently merge with cloud sessions without ever dropping or resurrecting deleted messages
    cloudList
      .filter(cs => !firestoreSync.isSessionDeleted(cs.id))
      .forEach(cs => {
        const local = sessionMap.get(cs.id);
        const validCloudMessages = (cs.messages || []).filter(
          m => !firestoreSync.isMessageDeleted(cs.id, m.id) && !firestoreSync.isMessageCleared(cs.id, m.timestamp)
        );

        if (!local) {
          sessionMap.set(cs.id, { ...cs, messages: validCloudMessages });
        } else {
          const msgMap = new Map<string, ChatMessage>();
          // Valid Cloud messages first
          validCloudMessages.forEach(m => msgMap.set(m.id, m));
          // Local messages supplement/override (local always preserves full text, attachments, and active thinking states)
          (local.messages || []).forEach(m => {
            const existing = msgMap.get(m.id);
            if (!existing || (m.text && m.text.length >= (existing.text || '').length)) {
              msgMap.set(m.id, m);
            }
          });

          const mergedMessages = Array.from(msgMap.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          const latestUpdatedAt = new Date(local.updatedAt).getTime() > new Date(cs.updatedAt).getTime()
            ? local.updatedAt
            : cs.updatedAt;

          sessionMap.set(cs.id, {
            ...cs,
            title: local.title && local.title !== 'Obrolan Baru' ? local.title : cs.title,
            messages: mergedMessages,
            updatedAt: latestUpdatedAt
          });
        }
      });

    return Array.from(sessionMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  // Cloud Firestore Synchronization & Hydration
  useEffect(() => {
    let isMounted = true;

    const hydrateFromCloud = async () => {
      try {
        const cloudSessions = await firestoreSync.loadAllSessions();
        if (isMounted && cloudSessions && cloudSessions.length > 0) {
          setSessions(prev => mergeSessionsWithCloud(prev, cloudSessions));
        }
        // Also pre-cache media vault assets across devices
        firestoreSync.loadAllMediaVault().catch(() => {});
      } catch (e) {
        console.warn('Initial cloud sync notice:', e);
      }
    };

    hydrateFromCloud();

    // Listen for real-time updates from other devices/tabs
    const unsub = firestoreSync.subscribeToSessions((cloudSessions) => {
      if (!isMounted) return;
      
      setSessions(prev => {
        // If cloud is empty or sessions deleted, clean up
        if (!cloudSessions || cloudSessions.length === 0) {
          const survivingLocal = prev.filter(ls => !firestoreSync.isSessionDeleted(ls.id));
          if (survivingLocal.length > 0) return survivingLocal;
          const fresh: ChatSession = {
            id: Date.now().toString(),
            title: 'Obrolan Baru',
            messages: [],
            updatedAt: new Date()
          };
          setCurrentSessionId(fresh.id);
          return [fresh];
        }

        return mergeSessionsWithCloud(prev, cloudSessions);
      });
    });

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  // Save sessions to localStorage & Cloud Firestore with safety truncation for huge base64 strings
  useEffect(() => {
    const handleOpenStudio = () => {
      setCurrentView('studio');
    };
    window.addEventListener('open_studio_canvas', handleOpenStudio);
    return () => window.removeEventListener('open_studio_canvas', handleOpenStudio);
  }, []);

  useEffect(() => {
    try {
      const sanitizedSessions = sessions
        .filter(s => !firestoreSync.isSessionDeleted(s.id))
        .map(s => ({
          ...s,
          messages: s.messages.slice(-50).map(m => {
            if (!m.attachments || m.attachments.length === 0) return m;
            const cleanAttachments = m.attachments.map(att => {
              if (att.data && typeof att.data === 'string' && att.data.length > 500000) {
                return { ...att, data: undefined };
              }
              return att;
            });
            return { ...m, attachments: cleanAttachments };
          })
        }));
      localStorage.setItem('navix_chat_sessions', JSON.stringify(sanitizedSessions));
    } catch (e) {
      console.warn('Failed to persist chat sessions:', e);
    }
  }, [sessions, currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Obrolan Baru',
      messages: [],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setCurrentView('chat');
    firestoreSync.saveSession(newSession).catch(() => {});
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 1. Mark as permanently deleted to stop zombie restoration
    firestoreSync.markSessionDeleted(id);

    // 2. Permanently delete from Firestore Cloud
    firestoreSync.deleteSession(id).catch(err => {
      console.warn('Firestore deleteSession warning:', err);
    });

    // 3. Permanently delete from Local State & localStorage
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('navix_chat_sessions', JSON.stringify(filtered));
      } catch (err) {
        console.warn('Failed to update localStorage after delete:', err);
      }

      if (filtered.length === 0) {
        const newId = Date.now().toString();
        const freshSession: ChatSession = {
          id: newId,
          title: 'Obrolan Baru',
          messages: [],
          updatedAt: new Date()
        };
        setCurrentSessionId(newId);
        firestoreSync.saveSession(freshSession).catch(() => {});
        try {
          localStorage.setItem('navix_chat_sessions', JSON.stringify([freshSession]));
        } catch (_) {}
        return [freshSession];
      }

      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearMessages = () => {
    if (!currentSessionId) return;

    // 1. Permanently delete all message subdocuments from Firestore
    firestoreSync.clearSessionMessages(currentSessionId).catch(err => {
      console.warn('Firestore clearSessionMessages warning:', err);
    });

    // 2. Permanently clear messages in local state & localStorage
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [], updatedAt: new Date() };
        }
        return s;
      });
      try {
        localStorage.setItem('navix_chat_sessions', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update localStorage after clear:', err);
      }
      return updated;
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!currentSessionId || !messageId) return;

    // 1. Permanently delete from Firestore Cloud
    firestoreSync.deleteSingleMessage(currentSessionId, messageId).catch(err => {
      console.warn('Firestore deleteSingleMessage warning:', err);
    });

    // 2. Permanently delete from Local State & localStorage
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          const filteredMessages = s.messages.filter(m => m.id !== messageId);
          return { ...s, messages: filteredMessages, updatedAt: new Date() };
        }
        return s;
      });
      try {
        localStorage.setItem('navix_chat_sessions', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update localStorage after delete message:', err);
      }
      return updated;
    });
  };

  const handleSendMessage = async (text: string, attachments?: Attachment[]) => {
    if ((!text || !text.trim()) && (!attachments || attachments.length === 0)) return;
    if (isLoading) return;

    const targetSessionId = currentSessionId;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
      attachments: attachments
    };

    // Auto-update session title if first message
    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        const newTitle = s.messages.length === 0 && text.trim() 
          ? (text.trim().slice(0, 30) + (text.length > 30 ? '...' : '')) 
          : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg],
          updatedAt: new Date()
        };
      }
      return s;
    }));
    // Verify chat quota (5 daily free chats for non-developer users).
    // The REAL check already happened server-side (src/backend/middleware/quota.ts)
    // when the request hits /api/chat -- the server returns HTTP 429 if the
    // daily limit is exceeded. This client-side check just avoids sending a
    // request we already expect to be rejected, for faster UI feedback.
    const quotaCheck = await QuotaService.getQuotaStatus(user);
    if (!quotaCheck.canChat) {
      const quotaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `🔒 **Batas Kuota Gratis Harian (${quotaCheck.dailyFreeLimit}/${quotaCheck.dailyFreeLimit}) Telah Habis**\n\nAnda telah menggunakan jatah **${quotaCheck.dailyFreeLimit} chat gratis** hari ini. Kuota gratis harian Anda akan otomatis di-reset besok. NAVIX AI 100% gratis untuk semua pengguna -- tidak ada paket berbayar. Silakan coba lagi besok.`,
        timestamp: new Date()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, quotaMsg],
            updatedAt: new Date()
          };
        }
        return s;
      }));
      showToast(`Kuota gratis harian (${quotaCheck.dailyFreeLimit}/${quotaCheck.dailyFreeLimit}) Anda telah habis. Coba lagi besok.`, 'info');
      return;
    }
    QuotaService.bumpLocalEstimate(user);


    setIsLoading(true);
    setThinkingState(undefined);

    const aiMsgId = (Date.now() + 1).toString();
    const { taskType, complexity } = classifyTask(text);
    const isHeavy = isHeavyTask(text) || taskType !== 'chat' || complexity !== 'simple' || Boolean(attachments && attachments.length > 0);
    // Smart activation: Thinking indicator triggers for booster, heavy/engine tasks or non-trivial prompts, leaving casual chat clean & instant
    const isThinkingActive = aiBooster || isHeavy || (thinkingMode && (text.trim().length > 80 || Boolean(attachments && attachments.length > 0)));
    const thinkingStartTime = Date.now();

    try {
      // Build history
      const history = (currentSession?.messages || []).map(m => {
        const parts: any[] = [];
        if (m.text) {
          const cleanText = m.text.replace(/```(json )?media[\s\S]*?```/g, '[Aset Media berhasil dibuat]');
          parts.push({ text: cleanText });
        }
        if (m.attachments) {
          m.attachments.forEach(att => {
            if (att.data) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data
                }
              });
            }
          });
        }
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts
        };
      });

      const partsToSend = attachments?.map(att => ({
        mimeType: att.mimeType,
        data: att.data || ''
      }));

      let plan: any = null;

      if (isThinkingActive) {
        const { taskType, complexity } = classifyTask(text);
        const resolvedEffort = aiBooster
          ? (effortLevel === 'max' ? 'max' : 'extra')
          : decideEffort(taskType, complexity, effortLevel as EffortLevel);
        const budget = buildToolBudget(resolvedEffort, taskType);
        plan = createTaskPlan(text, taskType, complexity, budget.maxCalls > 0 ? budget.maxCalls + 5 : 2);

        const initialThinkingData = {
          effort: resolvedEffort,
          taskType,
          plan,
          budget,
          completedSteps: [],
          currentStep: plan.steps[0],
          isThinking: true,
          aiBooster
        };

        setThinkingState(initialThinkingData);

        setSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: [...s.messages, {
                id: aiMsgId,
                role: 'ai',
                text: '',
                timestamp: new Date(),
                thinkingState: initialThinkingData
              }],
              updatedAt: new Date()
            };
          }
          return s;
        }));
      }

      const requestPromise = orchestrator.processUserRequest({
        message: text,
        attachments: partsToSend,
        history,
        model: selectedModel,
        voiceEnabled,
        effort: aiBooster ? (effortLevel === 'max' ? 'max' : 'extra') : effortLevel,
        thinkingMode: isThinkingActive,
        aiBooster,
        onProgress: (event: any) => {
          const stepDetail = event.step === 'supervisor_state' ? event.detail : (event.detail || event.step);
          
          setThinkingState(prev => {
            const prevCompleted = prev.completedSteps || [];
            const cur = prev.currentStep;
            const completed = cur && cur !== stepDetail && !prevCompleted.includes(cur) 
              ? [...prevCompleted, cur] 
              : prevCompleted;
            return {
              ...prev,
              completedSteps: completed,
              currentStep: stepDetail,
              isThinking: true
            };
          });

          setSessions(prev => prev.map(s => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === aiMsgId) {
                    const prevCompleted = m.thinkingState?.completedSteps || [];
                    const cur = m.thinkingState?.currentStep;
                    const newCompleted = cur && cur !== stepDetail && !prevCompleted.includes(cur)
                      ? [...prevCompleted, cur]
                      : prevCompleted;
                    return {
                      ...m,
                      thinkingState: {
                        ...m.thinkingState,
                        completedSteps: newCompleted,
                        currentStep: stepDetail,
                        isThinking: true
                      }
                    };
                  }
                  return m;
                })
              };
            }
            return s;
          }));
        }
      });

      const data = await requestPromise;

      if (data.isRateLimit || data.error === '429') {
        setIsPaymentOpen(true);
        throw new Error('429');
      }
      if (data.error === '413 Payload Too Large') {
        throw new Error('413 Payload Too Large');
      }
      if (data.error && !data.text) {
        throw new Error(data.error);
      }

      if (data.text) {
        const aiAttachments: Attachment[] = [];
        if (data.audioBase64) {
          aiAttachments.push({
            type: 'audio',
            url: `data:audio/wav;base64,${data.audioBase64}`,
            mimeType: 'audio/wav'
          });
        }
        if (data.attachments) {
          aiAttachments.push(...data.attachments);
        }

        if (isThinkingActive && plan) {
          const finalElapsed = Number(((Date.now() - thinkingStartTime) / 1000).toFixed(1));
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === targetSessionId) {
                const updatedSession = {
                  ...s,
                  messages: s.messages.map(m => {
                    if (m.id === aiMsgId) {
                      return {
                        ...m,
                        text: data.text,
                        attachments: aiAttachments.length > 0 ? aiAttachments : undefined,
                        systemInstruction: data.systemInstruction,
                        thinkingState: {
                          ...m.thinkingState,
                          currentStep: null,
                          completedSteps: plan.steps,
                          isThinking: false,
                          elapsedSeconds: finalElapsed
                        }
                      };
                    }
                    return m;
                  }),
                  updatedAt: new Date()
                };
                firestoreSync.saveSession(updatedSession).catch(() => {});
                return updatedSession;
              }
              return s;
            });
            return updated;
          });
        } else {
          const newAiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: data.text,
            timestamp: new Date(),
            attachments: aiAttachments.length > 0 ? aiAttachments : undefined,
            systemInstruction: data.systemInstruction
          };
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === targetSessionId) {
                const updatedSession = { ...s, messages: [...s.messages, newAiMsg], updatedAt: new Date() };
                firestoreSync.saveSession(updatedSession).catch(() => {});
                return updatedSession;
              }
              return s;
            });
            return updated;
          });
        }
      }
    } catch (err: any) {
      console.error('Error handling message:', err);
      const errStr = (err.message || String(err)).toLowerCase();
      const errMsgText = err.message === '429' 
        ? '⚠️ Terjadi pembatasan kuota API (Rate Limit / 429). Sistem sedang mengalihkan ke kunci cadangan, silakan coba lagi sebentar.' 
        : err.message === '413 Payload Too Large' 
        ? '⚠️ Ukuran file atau pesan terlalu besar.' 
        : errStr.includes('timed out') || errStr.includes('timeout')
        ? '⚠️ Waktu tunggu terlampaui karena antrean permintaan model AI sedang tinggi. Sistem telah mengoptimalkan jalur ke model tercepat, silakan coba kirim kembali.'
        : errStr.includes('503') || errStr.includes('unavailable') || errStr.includes('all models in the cognitive chain failed')
        ? '⚠️ Model AI sedang mengalami lonjakan beban sementara dari Google (503). Sistem telah menyiapkan rute cadangan, silakan coba kirim kembali.'
        : `⚠️ Terjadi kesalahan: ${err.message || 'Gagal terhubung ke AI'}.`;

      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === targetSessionId) {
            let updatedMessages = s.messages;
            if (isThinkingActive) {
              // Remove empty thinking placeholder so loading spinner doesn't get stuck
              updatedMessages = updatedMessages.filter(m => m.id !== aiMsgId);
            }
            const errMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              text: errMsgText,
              timestamp: new Date()
            };
            const updatedSession = { ...s, messages: [...updatedMessages, errMsg], updatedAt: new Date() };
            firestoreSync.saveSession(updatedSession).catch(() => {});
            return updatedSession;
          }
          return s;
        });
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden select-none">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        currentView={currentView}
        onSwitchView={setCurrentView}
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0c0c0c]">
        {currentView === 'chat' && (
          <ChatArea
            messages={currentSession?.messages || []}
            isLoading={isLoading}
            thinkingState={thinkingState}
            onSendMessage={handleSendMessage}
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onClearMessages={handleClearMessages}
            onDeleteMessage={handleDeleteMessage}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isImagePanelOpen={isImagePanelOpen}
            onToggleImagePanel={() => setIsImagePanelOpen(!isImagePanelOpen)}
            effortLevel={effortLevel}
            setEffortLevel={setEffortLevel}
            thinkingMode={thinkingMode}
            setThinkingMode={setThinkingMode}
            aiBooster={aiBooster}
          />
        )}

        {currentView === 'studio' && <AIStudioCanvas onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
        {currentView === 'document' && <DocumentEditor onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
        {currentView === 'science' && <ScienceSandbox onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
        {currentView === 'cloud' && <CloudConsole onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onClose={() => setCurrentView('chat')} />}

        {/* Specialized High-End Studios */}
        {currentView === 'stock_image_studio' && (
          <StockImageStudio
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'image_studio' && (
          <ImageStudio
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'video_studio' && (
          <VideoStudio 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'audio_studio' && (
          <AudioStudio 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'media_library' && (
          <MediaLibrary 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'trading_desk' && (
          <CloudMarketStudio
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'ai_agents' && (
          <AIAgentsStudio
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onLaunchAgent={(agentName, systemPrompt, welcomeMsg) => {
              setCurrentView('chat');
              handleSendMessage(`Halo ${agentName}! ${welcomeMsg || 'Tolong bantu saya dengan keahlian Anda.'}`);
            }}
          />
        )}
        {currentView === 'app_connectors' && (
          <AppConnectorsStudio 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        
        {currentView === 'api_keys' && (
          <ApiKeysStudio 
            onClose={() => setCurrentView('chat')}
            onUpgradeClick={() => setIsPaymentOpen(true)}
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'plugins_sdk' && (
          <PluginsStudio 
            onUpgradeClick={() => setIsPaymentOpen(true)}
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'knowledge_base' && (
          <KnowledgeBaseStudio 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'automations' && (
          <AutomationsStudio 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
        {currentView === 'admin_dashboard' && (
          <AdminDashboard onClose={() => setCurrentView('chat')} />
        )}
        {currentView === 'projects_isolation' && (
          <ProjectsIsolationStudio 
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}

        {isImagePanelOpen && (
          <ImageGenerationPanel
            onClose={() => setIsImagePanelOpen(false)}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        )}

        {isPaymentOpen && (
          <PaymentModal
            plan="pro"
            onClose={() => setIsPaymentOpen(false)}
            onSuccess={() => {
              setIsPaymentOpen(false);
              showToast('Permintaan upgrade kuota berhasil dikirim! Menunggu konfirmasi developer.', 'success');
            }}
          />
        )}
      </main>

      <ToastContainer />
    </div>
  );
}

export function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <LandingLoginScreen />;
  }

  return <MainChatApp />;
}

export default App;
