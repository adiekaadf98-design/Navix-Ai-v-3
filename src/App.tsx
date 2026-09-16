import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { WorldClock } from './components/WorldClock';
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
  const [sessions, setSessions] = useState<ChatSession[]>(() => { const saved = localStorage.getItem('navix_chat_sessions'); if (saved) { try { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } catch {} } return [{ id: Date.now().toString(), title: 'Obrolan Baru', messages: [], updatedAt: new Date() }]; });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => sessions[0]?.id || Date.now().toString());
  const [currentView, setCurrentView] = useState<NavixAppView>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false); const [isLoading, setIsLoading] = useState(false); const [voiceEnabled, setVoiceEnabled] = useState(false); const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash'); const [effortLevel, setEffortLevel] = useState('auto'); const [thinkingMode, setThinkingMode] = useState(true); const aiBooster = true; const [thinkingState, setThinkingState] = useState<ThinkingStateData | undefined>();

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  useEffect(() => { const unsub = firestoreSync.subscribeToSessions((cloudSessions) => { if (cloudSessions?.length) setSessions(cloudSessions); }); firestoreSync.loadAllSessions().then((cloudSessions) => { if (cloudSessions?.length) setSessions(cloudSessions); }).catch(() => {}); return () => unsub?.(); }, []);
  useEffect(() => { try { localStorage.setItem('navix_chat_sessions', JSON.stringify(sessions.map((s) => ({ ...s, messages: s.messages.slice(-50).map((m) => ({ ...m, attachments: m.attachments?.map((a) => a.data && a.data.length > 500000 ? { ...a, data: undefined } : a) })) })))); } catch {} }, [sessions]);
  const handleNewChat = () => { const next = { id: Date.now().toString(), title: 'Obrolan Baru', messages: [], updatedAt: new Date() }; setSessions((current) => [next, ...current]); setCurrentSessionId(next.id); setCurrentView('chat'); firestoreSync.saveSession(next).catch(() => {}); };
  const handleDeleteSession = (id: string, e: React.MouseEvent) => { e.stopPropagation(); firestoreSync.deleteSession(id).catch(() => {}); setSessions((current) => { const next = current.filter((s) => s.id !== id); if (currentSessionId === id && next[0]) setCurrentSessionId(next[0].id); return next.length ? next : [{ id: Date.now().toString(), title: 'Obrolan Baru', messages: [], updatedAt: new Date() }]; }); };
  const handleClearMessages = () => setSessions((current) => current.map((s) => s.id === currentSessionId ? { ...s, messages: [], updatedAt: new Date() } : s));
  const handleDeleteMessage = (messageId: string) => setSessions((current) => current.map((s) => s.id === currentSessionId ? { ...s, messages: s.messages.filter((m) => m.id !== messageId), updatedAt: new Date() } : s));
  const handleSendMessage = async (text: string, attachments?: Attachment[]) => {
    if ((!text?.trim() && !attachments?.length) || isLoading) return;
    const target = currentSessionId; const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date(), attachments };
    setSessions((current) => current.map((s) => s.id === target ? { ...s, title: s.messages.length === 0 && text.trim() ? text.trim().slice(0, 30) : s.title, messages: [...s.messages, userMsg], updatedAt: new Date() } : s));
    const quota = await QuotaService.getQuotaStatus(user); if (!quota.canChat) { showToast(`Kuota gratis harian telah habis.`, 'info'); return; }
    setIsLoading(true); setThinkingState(undefined); const aiMsgId = `${Date.now()}-ai`; const history = (currentSession?.messages || []).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
    try { const data = await orchestrator.processUserRequest({ message: text, attachments: attachments?.map((a) => ({ mimeType: a.mimeType, data: a.data || '' })), history, model: selectedModel, voiceEnabled, effort: effortLevel, thinkingMode, aiBooster, onProgress: (event) => setThinkingState((previous: any) => ({ ...previous, currentStep: event.detail || event.step, isThinking: true })) }); if (data.error) throw new Error(data.error); const aiMsg: ChatMessage = { id: aiMsgId, role: 'ai', text: data.text || '', timestamp: new Date(), attachments: data.audioBase64 ? [{ type: 'audio', url: `data:audio/wav;base64,${data.audioBase64}`, mimeType: 'audio/wav' }] : undefined }; setSessions((current) => current.map((s) => s.id === target ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date() } : s)); } catch (error: any) { setSessions((current) => current.map((s) => s.id === target ? { ...s, messages: [...s.messages, { id: aiMsgId, role: 'ai', text: `⚠️ ${error.message || 'Gagal terhubung ke AI'}`, timestamp: new Date() }], updatedAt: new Date() } : s)); } finally { setIsLoading(false); setThinkingState(undefined); }
  };
  const studioProps = { onOpenSidebar: () => setIsSidebarOpen((open) => !open), onSendToChat: (prompt: string) => { setCurrentView('chat'); handleSendMessage(prompt); } };
  return <div className="flex h-screen overflow-hidden bg-[#0a0a0a] font-sans text-white"><Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onNewChat={handleNewChat} sessions={sessions} currentSessionId={currentSessionId} onSelectSession={setCurrentSessionId} onDeleteSession={handleDeleteSession} currentView={currentView} onSwitchView={setCurrentView} /><main className="relative flex h-full flex-1 flex-col overflow-hidden bg-[#0c0c0c]">{currentView === 'chat' && <ChatArea messages={currentSession?.messages || []} isLoading={isLoading} thinkingState={thinkingState} onSendMessage={handleSendMessage} onOpenSidebar={() => setIsSidebarOpen((open) => !open)} onClearMessages={handleClearMessages} onDeleteMessage={handleDeleteMessage} voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled} selectedModel={selectedModel} onModelChange={setSelectedModel} isImagePanelOpen={isImagePanelOpen} onToggleImagePanel={() => setIsImagePanelOpen((open) => !open)} effortLevel={effortLevel} setEffortLevel={setEffortLevel} thinkingMode={thinkingMode} setThinkingMode={setThinkingMode} aiBooster={aiBooster} />}{currentView === 'world_clock' && <WorldClock />}{currentView === 'studio' && <AIStudioCanvas {...studioProps} />}{currentView === 'document' && <DocumentEditor {...studioProps} />}{currentView === 'science' && <ScienceSandbox {...studioProps} />}{currentView === 'cloud' && <CloudConsole onOpenSidebar={studioProps.onOpenSidebar} onClose={() => setCurrentView('chat')} />}{currentView === 'image_studio' && <ImageStudio {...studioProps} />}{currentView === 'stock_image_studio' && <StockImageStudio {...studioProps} />}{currentView === 'video_studio' && <VideoStudio {...studioProps} />}{currentView === 'audio_studio' && <AudioStudio {...studioProps} />}{currentView === 'media_library' && <MediaLibrary {...studioProps} />}{currentView === 'ai_agents' && <AIAgentsStudio onOpenSidebar={studioProps.onOpenSidebar} onLaunchAgent={(name, _prompt, welcome) => { setCurrentView('chat'); handleSendMessage(`Halo ${name}! ${welcome || ''}`); }} />}{currentView === 'app_connectors' && <AppConnectorsStudio {...studioProps} />}{currentView === 'plugins_sdk' && <PluginsStudio onOpenSidebar={studioProps.onOpenSidebar} onUpgradeClick={() => setIsPaymentOpen(true)} />}{currentView === 'api_keys' && <ApiKeysStudio onClose={() => setCurrentView('chat')} onUpgradeClick={() => setIsPaymentOpen(true)} onOpenSidebar={studioProps.onOpenSidebar} onSendToChat={studioProps.onSendToChat} />}{currentView === 'knowledge_base' && <KnowledgeBaseStudio {...studioProps} />}{currentView === 'automations' && <AutomationsStudio {...studioProps} />}{currentView === 'projects_isolation' && <ProjectsIsolationStudio {...studioProps} />}{currentView === 'trading_desk' && <CloudMarketStudio {...studioProps} />}{currentView === 'admin_dashboard' && <AdminDashboard onClose={() => setCurrentView('chat')} />}{isImagePanelOpen && <ImageGenerationPanel onClose={() => setIsImagePanelOpen(false)} onSendMessage={handleSendMessage} isLoading={isLoading} />}{isPaymentOpen && <PaymentModal plan="pro" onClose={() => setIsPaymentOpen(false)} onSuccess={() => { setIsPaymentOpen(false); showToast('Permintaan upgrade kuota berhasil dikirim!', 'success'); }} />}<ToastContainer /></main></div>;
}

export function App() { const isAuthenticated = useAuthStore((state) => state.isAuthenticated); const checkAuth = useAuthStore((state) => state.checkAuth); useEffect(() => { checkAuth(); }, [checkAuth]); return isAuthenticated ? <MainChatApp /> : <LandingLoginScreen />; }
export default App;
