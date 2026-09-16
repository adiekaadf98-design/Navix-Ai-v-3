import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Moon, Sun, Monitor, Key, Globe, Shield, CheckCircle2, 
  XCircle, Loader2, Trash2, Plus, RotateCcw, AlertCircle, 
  List, Check, Eye, EyeOff, Save, UserCheck, LogOut, Mail, Lock, Unlock,
  Cpu, Activity, Database, Cloud, CreditCard, Brain, CheckCircle, Palette
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { isDeveloperEmail } from '../services/auth';
import { episodicMemory } from '../services/memory/EpisodicMemoryEngine';
import { showToast } from '../utils/toast';
import { 
  getRotationKeys, 
  saveRotationKeys, 
  KeyItem, 
  resetAllRotationKeys, 
  sanitizeApiKey, 
  updateKeyStatus 
} from '../lib/apiKeyRotator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // Auth state
  const { user, logout } = useAuthStore();
  const isDeveloper = user?.role === 'developer' || isDeveloperEmail(user?.email);

  // Theme state
  const [theme, setTheme] = useState<'dark'>('dark');

  // Developer PIN Security Gate State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Keys states
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [singleKey, setSingleKey] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [importMode, setImportMode] = useState<'single' | 'bulk'>('single');
  
  // Security visual state (show/hide actual keys in list)
  const [showFullKeys, setShowFullKeys] = useState<Record<string, boolean>>({});

  // Testing states
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    key: string;
    status: 'success' | 'failed';
    error?: string;
  } | null>(null);

  // Save success visual alert
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Episodic Memory State
  const [memorySummary, setMemorySummary] = useState('');

  // Sync keys to backend ServerKeyRotator
  const syncKeysToServer = async (keysToSync: string[]) => {
    if (!keysToSync || keysToSync.length === 0) return;
    try {
      const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('navix_auth_token') || localStorage.getItem('navix_token')) : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-navix-developer-pin': 'Adieka123'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/admin/keys', {
        method: 'POST',
        headers,
        body: JSON.stringify({ keys: keysToSync })
      });
    } catch (e) {
      console.warn('Could not sync keys to server pool:', e);
    }
  };

  const removeKeyFromServer = async (keyToRemove: string) => {
    try {
      const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('navix_auth_token') || localStorage.getItem('navix_token')) : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-navix-developer-pin': 'Adieka123'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ key: keyToRemove })
      });
    } catch (e) {
      console.warn('Could not remove key from server pool:', e);
    }
  };

  // Load keys on open
  useEffect(() => {
    if (isOpen) {
      const loadedKeys = getRotationKeys();
      setKeys(loadedKeys);
      setMemorySummary(episodicMemory.generateMemoryContextSummary());
      setTestResult(null);
      setTestingKey(null);
      setSaveSuccess(null);
      setPinError('');

      // Auto-sync active keys to server pool
      if (loadedKeys.length > 0) {
        syncKeysToServer(loadedKeys.map(k => k.key));
      }
    }
  }, [isOpen]);

  // Handle Developer PIN Unlock
  const handleUnlockDeveloper = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === 'Adieka123') {
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
      const loadedKeys = getRotationKeys();
      if (loadedKeys.length > 0) {
        syncKeysToServer(loadedKeys.map(k => k.key));
      }
    } else {
      setPinError('Kata kunci salah! Hanya developer Navix AI yang memiliki akses.');
    }
  };

  // Handle adding a single key
  const handleAddSingleKey = () => {
    const cleaned = sanitizeApiKey(singleKey);
    if (!cleaned) return;

    // Check if duplicate
    const exists = keys.some(k => k.key === cleaned);
    if (exists) {
      alert('Kunci API ini sudah terdaftar.');
      return;
    }

    const updated = [
      ...keys,
      {
        key: cleaned,
        status: 'active' as const,
        errorCount: 0,
        lastUsed: Date.now()
      }
    ];

    setKeys(updated);
    saveRotationKeys(updated);
    syncKeysToServer([cleaned]);
    setSingleKey('');
    setSaveSuccess('Kunci API berhasil disimpan & diaktifkan dalam rotasi!');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Handle adding bulk keys (one per line)
  const handleAddBulkKeys = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split(/[\n,;]+/);
    const newItems: KeyItem[] = [];

    lines.forEach(line => {
      const cleaned = sanitizeApiKey(line);
      if (cleaned && !keys.some(k => k.key === cleaned) && !newItems.some(n => n.key === cleaned)) {
        newItems.push({
          key: cleaned,
          status: 'active',
          errorCount: 0,
          lastUsed: Date.now()
        });
      }
    });

    if (newItems.length === 0) {
      alert('Tidak ada kunci baru yang valid ditemukan. Periksa kembali input Anda.');
      return;
    }

    const updated = [...keys, ...newItems];
    setKeys(updated);
    saveRotationKeys(updated);
    syncKeysToServer(newItems.map(n => n.key));
    setBulkText('');
    setSaveSuccess(`Berhasil menyimpan ${newItems.length} kunci API baru ke sistem rotasi!`);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Delete a key
  const handleDeleteKey = (keyToDelete: string) => {
    const updated = keys.filter(k => k.key !== keyToDelete);
    setKeys(updated);
    saveRotationKeys(updated);
    removeKeyFromServer(keyToDelete);
    if (testResult && testResult.key === keyToDelete) {
      setTestResult(null);
    }
  };

  // Reset statuses
  const handleResetAllKeys = () => {
    resetAllRotationKeys();
    const refreshed = getRotationKeys();
    setKeys(refreshed);
    setTestResult(null);
    if (refreshed.length > 0) {
      syncKeysToServer(refreshed.map(k => k.key));
    }
  };

  // Test connection of a specific key
  const handleTestKeyConnection = async (keyString: string) => {
    setTestingKey(keyString);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: keyString })
      });
      const data = await res.json();
      
      if (data.success) {
        setTestResult({
          key: keyString,
          status: 'success'
        });
        updateKeyStatus(keyString, 'active');
      } else {
        const errorMsg = data.error || 'Autentikasi gagal atau tidak diizinkan.';
        setTestResult({
          key: keyString,
          status: 'failed',
          error: errorMsg
        });
        updateKeyStatus(keyString, 'invalid', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Gagal menghubungi server verifikasi.';
      setTestResult({
        key: keyString,
        status: 'failed',
        error: errorMsg
      });
      updateKeyStatus(keyString, 'invalid', errorMsg);
    } finally {
      setTestingKey(null);
      // Refresh local list status
      setKeys(getRotationKeys());
    }
  };

  // Toggle reveal key
  const toggleRevealKey = (keyString: string) => {
    setShowFullKeys(prev => ({
      ...prev,
      [keyString]: !prev[keyString]
    }));
  };

  // Mask key format: AQ...abcd atau AIza...efgh
  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    const start = key.substring(0, 6);
    const end = key.substring(key.length - 4);
    return `${start}••••••••${end}`;
  };

  // Key stats
  const totalKeys = keys.length;
  const activeCount = keys.filter(k => k.status === 'active').length;
  const exhaustedCount = keys.filter(k => k.status === 'exhausted').length;
  const invalidCount = keys.filter(k => k.status === 'invalid').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full h-full sm:h-auto sm:max-w-3xl bg-[#0a0c10] sm:border border-neutral-800 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800 shrink-0 bg-neutral-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500">
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Navix AI Settings</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Konfigurasi penampilan dan rotasi kunci API cerdas</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 text-neutral-400 hover:text-white rounded-xl bg-neutral-900/60 sm:bg-transparent hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shrink-0 z-50 border border-neutral-800/50 sm:border-transparent"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-neutral-300 space-y-6 sm:space-y-8 custom-scrollbar pb-safe">
              
              {/* Account Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-400" />
                  Akun & Sesi Pengguna
                </h3>
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-11 h-11 rounded-full border-2 border-neutral-700 shadow-md object-cover" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-base shadow-md">
                            {(user?.name || user?.email || 'A')[0].toUpperCase()}
                          </div>
                        )}
                        {/* Provider Badge Icon */}
                        <div className="absolute -bottom-1 -right-1 bg-neutral-900 p-0.5 rounded-full border border-neutral-700 shadow-sm flex items-center justify-center w-5 h-5">
                          {user?.provider === 'google' ? (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          ) : user?.provider === 'github' ? (
                            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                          ) : user?.provider === 'apple' ? (
                            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                            </svg>
                          ) : (
                            <Mail size={12} className="text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white truncate">{user?.name || 'Adieka (Developer)'}</h4>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                            Terautentikasi
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-300 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                          <Mail size={12} className="text-neutral-400 shrink-0" />
                          {user?.email || 'adiekaadf98@gmail.com'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-neutral-400">
                            Akun: <span className="text-white font-semibold capitalize">{user?.provider === 'apple' ? 'Apple (iOS/macOS)' : user?.provider || 'Google'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 hover:border-red-700 text-red-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              </section>
              
              {/* Appearance Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-400" />
                  Appearance & Theme
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 transition-colors opacity-50 cursor-not-allowed text-center">
                    <Sun size={20} className="text-neutral-500 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-semibold">Light Mode</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-red-500/50 bg-red-950/20 text-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                    <Moon size={20} className="text-red-500 mb-0.5 sm:mb-1 relative z-10" />
                    <span className="text-[10px] sm:text-xs font-bold text-white relative z-10">Calm Dark</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 transition-colors opacity-50 cursor-not-allowed text-center">
                    <Monitor size={20} className="text-neutral-500 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-semibold">System</span>
                  </button>
                </div>
              </section>

              {/* API Key Section - Restricted to Developer Only / Cloud Managed for Consumers */}
              {!isDeveloper ? (
                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-400" />
                    Layanan AI & Infrastruktur Cloud
                  </h3>
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <div>
                          <h4 className="text-sm font-bold text-white">Navix Cloud Accelerated Engine</h4>
                          <span className="text-[10px] text-neutral-400 font-mono">Navix Ultra Flash • Accelerated Neural • 32 Mesin</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
                        TERKONEKSI & TERENKRIPSI
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Sistem Navix AI menggunakan infrastruktur komputasi cloud terpusat yang dioptimasi untuk akurasi tinggi dan respon instan. Kunci API dan backend dikelola secara otomatis sehingga Anda tidak perlu memasukkan kunci API apa pun secara manual.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                      <div className="p-2.5 bg-black/40 border border-neutral-800/60 rounded-xl">
                        <span className="text-neutral-500 block text-[9px]">STATUS API</span>
                        <span className="text-emerald-400 font-bold">Online & Aktif</span>
                      </div>
                      <div className="p-2.5 bg-black/40 border border-neutral-800/60 rounded-xl">
                        <span className="text-neutral-500 block text-[9px]">ENKRIPSI DATA</span>
                        <span className="text-neutral-200 font-bold">End-to-End SSL</span>
                      </div>
                      <div className="p-2.5 bg-black/40 border border-neutral-800/60 rounded-xl col-span-2 sm:col-span-1">
                        <span className="text-neutral-500 block text-[9px]">KONTROL AKSES</span>
                        <span className="text-blue-400 font-bold">Otomatis / Cloud</span>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                /* API Key Rotation Section (Developer Only with PIN Gate) */
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Key size={14} className="text-red-500" />
                      Gemini API Keys Manager (Developer Only)
                    </h3>
                    {isUnlocked && totalKeys > 0 && (
                      <button
                        onClick={handleResetAllKeys}
                        className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold rounded-lg border border-neutral-700 transition-colors"
                      >
                        <RotateCcw size={13} />
                        Reaktivasi Semua Kunci
                      </button>
                    )}
                  </div>

                  {!isUnlocked ? (
                    /* Locked Developer Gate */
                    <div className="p-6 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl text-center space-y-4 shadow-xl">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                        <Lock size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">Developer Security Gate</h4>
                        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                          Akses manajemen API Key & Rotasi Kunci dibatasi hanya untuk Developer Navix AI.
                        </p>
                      </div>

                      <form onSubmit={handleUnlockDeveloper} className="max-w-xs mx-auto space-y-3">
                        <div className="relative">
                          <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => {
                              setPinInput(e.target.value);
                              if (pinError) setPinError('');
                            }}
                            placeholder="Masukkan Kata Kunci Developer..."
                            className="w-full bg-black/60 border border-neutral-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm text-center text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                          />
                        </div>

                        {pinError && (
                          <p className="text-xs text-red-400 font-medium flex items-center justify-center gap-1">
                            <AlertCircle size={13} className="shrink-0" />
                            {pinError}
                          </p>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Unlock size={14} />
                          Buka Akses API Key
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Unlocked Developer Content */
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                        <Unlock size={14} />
                        <span>Akses Developer Terbuka (Adieka)</span>
                      </div>
                      <button
                        onClick={() => setIsUnlocked(false)}
                        className="text-[11px] text-neutral-400 hover:text-white px-2 py-1 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                      >
                        Kunci Kembali
                      </button>
                    </div>

                    {/* Info Alert */}
                    <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs leading-relaxed text-neutral-400 flex gap-3">
                      <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-neutral-200">Bagaimana Cara Kerjanya?</p>
                        <p className="mt-1">
                          Navix AI mendukung rotasi otomatis hingga 100 kunci API. Jika salah satu kunci mengalami limit kuota (<span className="text-amber-400 font-medium">429 Resource Exhausted</span>) atau tidak valid, sistem secara otomatis menandainya dan melompat ke kunci berikutnya tanpa mengganggu proses analisis Anda.
                        </p>
                      </div>
                    </div>

                    {/* Keys Stat Cards */}
                    <div className="grid grid-cols-4 gap-2.5">
                      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 text-center">
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Total Kunci</p>
                        <p className="text-lg font-black text-white mt-0.5">{totalKeys}</p>
                      </div>
                      <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-3 text-center">
                        <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-wider">Aktif</p>
                        <p className="text-lg font-black text-emerald-400 mt-0.5">{activeCount}</p>
                      </div>
                      <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-3 text-center">
                        <p className="text-amber-500/80 text-[10px] font-bold uppercase tracking-wider">Limit Habis</p>
                        <p className="text-lg font-black text-amber-400 mt-0.5">{exhaustedCount}</p>
                      </div>
                      <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-3 text-center">
                        <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-wider">Invalid</p>
                        <p className="text-lg font-black text-red-400 mt-0.5">{invalidCount}</p>
                      </div>
                    </div>

                    {/* Add Keys Form */}
                    <div className="bg-neutral-900/30 border border-neutral-800/80 rounded-xl overflow-hidden p-4 space-y-4">
                      {/* Mode Selector Tab */}
                      <div className="flex flex-wrap border-b border-neutral-800/60 pb-3 gap-2 sm:gap-4">
                        <button
                          onClick={() => setImportMode('single')}
                          className={`text-xs font-bold pb-1.5 border-b-2 transition-colors ${
                            importMode === 'single' ? 'border-red-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          💾 Simpan Satu API Key
                        </button>
                        <button
                          onClick={() => setImportMode('bulk')}
                          className={`text-xs font-bold pb-1.5 border-b-2 transition-colors ${
                            importMode === 'bulk' ? 'border-red-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          📥 Simpan Massal (Hingga 100 Kunci)
                        </button>
                      </div>

                      {importMode === 'single' ? (
                        <div className="space-y-3">
                          <input
                            type="password"
                            value={singleKey}
                            onChange={(e) => setSingleKey(e.target.value)}
                            placeholder="Masukkan kunci API Gemini pribadi Anda"
                            className="w-full bg-black/40 border border-neutral-800 hover:border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                          />
                          <button
                            onClick={handleAddSingleKey}
                            disabled={!singleKey.trim()}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg"
                            title="Simpan Kunci API"
                          >
                            <Save size={16} />
                            Simpan API Key
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            rows={4}
                            placeholder="Paste daftar Kunci API Anda di sini, dipisahkan dengan baris baru (Satu kunci per baris). Contoh:&#10;AQ.key_kesatu_anda&#10;AQ.key_kedua_anda"
                            className="w-full bg-black/40 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-mono resize-none leading-relaxed"
                          />
                          <div className="space-y-2.5">
                            <span className="block text-[10px] text-neutral-500 text-center">Mendukung pemisahan baris, koma, atau titik koma.</span>
                            <button
                              onClick={handleAddBulkKeys}
                              disabled={!bulkText.trim()}
                              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg"
                            >
                              <Save size={16} />
                              Simpan Semua API Key
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save Success Alert Banner */}
                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2.5"
                        >
                          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                          <span className="font-semibold">{saveSuccess}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* API Keys Scrollable List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-400">Daftar Kunci Terdaftar ({totalKeys})</h4>
                      {keys.length === 0 ? (
                        <div className="border border-neutral-800/50 border-dashed rounded-xl py-8 text-center text-xs text-neutral-500">
                          Belum ada kunci API kustom yang ditambahkan. Sistem akan menggunakan kunci bawaan server.
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto border border-neutral-800/80 rounded-xl bg-[#141414]/30 divide-y divide-neutral-800/60 custom-scrollbar">
                          {keys.map((k, idx) => {
                            const isRevealed = showFullKeys[k.key] || false;
                            const isTesting = testingKey === k.key;
                            const isThisTestResult = testResult && testResult.key === k.key;

                            return (
                              <div key={k.key} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="font-mono text-[10px] text-neutral-500 w-5 text-right shrink-0">#{idx + 1}</span>
                                  
                                  {/* Status badge */}
                                  {k.status === 'active' && (
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  )}
                                  {k.status === 'exhausted' && (
                                    <span className="flex h-2 w-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                  )}
                                  {k.status === 'invalid' && (
                                    <span className="flex h-2 w-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                  )}

                                  <div className="min-w-0 flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-neutral-200 select-all truncate">
                                        {isRevealed ? k.key : maskKey(k.key)}
                                      </span>
                                      <button 
                                        onClick={() => toggleRevealKey(k.key)} 
                                        className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
                                        title={isRevealed ? "Sembunyikan" : "Tampilkan penuh"}
                                      >
                                        {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                                      </button>
                                    </div>
                                    {k.status !== 'active' && k.errorMsg && (
                                      <p className="text-[10px] text-red-400 font-mono italic truncate mt-0.5 max-w-sm sm:max-w-md">
                                        Error: {k.errorMsg}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                  {/* Key state badge text */}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    k.status === 'active' 
                                      ? 'bg-emerald-500/10 text-emerald-400' 
                                      : k.status === 'exhausted'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {k.status === 'active' ? 'Ready' : k.status === 'exhausted' ? 'Limit Habis' : 'Invalid'}
                                  </span>

                                  {/* Test Button */}
                                  <button
                                    onClick={() => handleTestKeyConnection(k.key)}
                                    disabled={isTesting}
                                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-[10px] font-bold rounded-md border border-neutral-700 transition-colors inline-flex items-center gap-1 text-neutral-300 hover:text-white"
                                  >
                                    {isTesting ? <Loader2 size={10} className="animate-spin" /> : "Test"}
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteKey(k.key)}
                                    className="p-1.5 hover:bg-red-950/20 text-neutral-500 hover:text-red-400 rounded-md transition-colors"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Specific key test output */}
                    {testResult && (
                      <div className={`p-4 rounded-xl border text-xs flex gap-2.5 ${
                        testResult.status === 'success' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {testResult.status === 'success' ? (
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={16} className="shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">
                            {testResult.status === 'success' ? '✓ Koneksi API Key Berhasil!' : '✗ Autentikasi Kunci Gagal'}
                          </p>
                          <p className="text-[11px] opacity-80 mt-1 select-all font-mono break-all bg-black/20 p-2 rounded">
                            Kunci: {maskKey(testResult.key)}
                            {testResult.error && `\nError: ${testResult.error}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
              )}

              {/* Autonomous MCP Zero-Config Engine Matrix */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cloud size={14} className="text-rose-400" />
                    Autonomous MCP Execution Engine (Zero-Config)
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <CheckCircle size={10} />
                    100% Otomatis Aktif
                  </span>
                </div>
                
                <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <p className="text-xs font-semibold text-white">
                      Semua Server & Tools MCP Terhubung Otomatis
                    </p>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Anda tidak perlu memasukkan API key manual untuk MCP. Navix AI mengeksekusi seluruh 10.000+ skills (Anthropic Sequential Thinking, Semgrep SAST, TypeScript Compiler, NVIDIA NIM, TA-Lib, PostHog, dll) secara otonom melalui Sandbox Server Engine internal.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Anthropic Reasoning', 'Semgrep SAST', 'PostHog Telemetry', 'NVIDIA NIM', 'TradingView SMC', 'Resend Automation', 'TypeScript Engine'].map(badge => (
                      <span key={badge} className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Episodic Memory & Personalized Knowledge Graph */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain size={14} className="text-amber-400" />
                    Deep Episodic Memory & Personal Knowledge Graph
                  </h3>
                  <button
                    onClick={() => {
                      episodicMemory.clearMemories();
                      setMemorySummary(episodicMemory.generateMemoryContextSummary());
                      showToast('Memory reset successfully', 'info');
                    }}
                    className="text-[10px] text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    Reset Memories
                  </button>
                </div>

                <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                  <p className="text-xs text-neutral-400">
                    Navix AI secara adaptif merekam preferensi analisis, gaya trading, dan kebiasaan pengembangan Anda tanpa membebani context window LLM.
                  </p>
                  <pre className="p-2.5 bg-black/40 border border-neutral-800/80 rounded-lg text-[10px] font-mono text-emerald-400/90 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                    {memorySummary}
                  </pre>
                </div>
              </section>

              {/* Data Privacy & Info */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Security & Privacy</h3>
                <div className="flex items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-white">Data Privacy</p>
                      <p className="text-xs text-neutral-400">Kunci API disimpan secara lokal di browser Anda</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md">LOCAL ONLY</span>
                </div>
              </section>

            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 shrink-0 text-center flex flex-col sm:flex-row sm:items-center justify-center gap-2">
              <p className="text-xs text-neutral-500 font-mono tracking-wide">Navix AI v3.5 • Omega Edition</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
