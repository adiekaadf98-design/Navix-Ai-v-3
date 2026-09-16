const fs = require('fs');

const code = `
import { useAuthStore } from '../../store/useAuthStore';
import React, { useState, useEffect } from 'react';
import { Key, Activity, Terminal, Check, Copy, Plus, Sparkles } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface ApiKeysStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
  onUpgradeClick?: () => void;
}

export const ApiKeysStudio: React.FC<ApiKeysStudioProps> = ({ onOpenSidebar, onSendToChat, onUpgradeClick }) => {
  const { user } = useAuthStore();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [apiKeys, setApiKeys] = useState<{id: string, key: string, createdAt: string}[]>([]);
  const [usage, setUsage] = useState<{ requests: number, limit: number, plan: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch('/api/developer/keys?userId=' + user.id)
        .then(res => res.json())
        .then(data => {
          if (data.keys) setApiKeys(data.keys);
          if (data.usage) setUsage(data.usage);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleGenerateKey = async () => {
    if (!user?.id) {
      showToast('Harap login terlebih dahulu', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.success && data.key) {
        setApiKeys([{ id: '1', key: data.key, createdAt: new Date().toISOString() }]);
        showToast('API Key berhasil dibuat!', 'success');
      }
    } catch (err) {
      showToast('Gagal membuat API Key', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgradePlan = (plan: string) => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      showToast('Payment system connecting...');
    }
  };

  const apiKey = apiKeys.length > 0 ? apiKeys[0].key : '';
  const sampleCurl = \`curl -X POST https://api.navix.ai/v1/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer \${apiKey || 'YOUR_API_KEY'}" \\\\
  -d '{
    "model": "navix-pro",
    "messages": [{"role": "user", "content": "Halo, siapa kamu?"}]
  }'\`;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex-none p-4 md:p-6 border-b border-neutral-800/60 bg-[#0a0a0a] z-10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Key className="text-purple-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Navix API Keys</h2>
            <p className="text-sm text-neutral-400">Kelola kunci API Anda untuk mengintegrasikan Navix AI ke aplikasi pihak ketiga.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-y-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* API Key Box */}
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Navix Live API Key
                </h3>
              </div>
              {apiKeys.length > 0 ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                  No Keys
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="password"
                readOnly
                value={apiKeys.length > 0 ? apiKey : ''}
                placeholder={apiKeys.length > 0 ? '' : 'Anda belum memiliki API Key'}
                className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 text-xs font-mono text-neutral-300 border border-neutral-800"
              />
              {apiKeys.length > 0 ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                    showToast('API Key tersalin!', 'success');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer w-full sm:w-auto shrink-0"
                >
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey ? 'Tersalin' : 'Copy'}
                </button>
              ) : (
                <button
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer w-full sm:w-auto shrink-0"
                >
                  <Plus size={14} />
                  {isGenerating ? 'Membuat...' : 'Buat Key'}
                </button>
              )}
            </div>

            {/* Quota Section */}
            {usage && (
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Activity size={14} />
                    <span className="text-xs font-semibold">API Quota & Usage</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {usage.plan}
                  </span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all" 
                    style={{ width: \`\${Math.min(100, (usage.requests / usage.limit) * 100)}%\` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500 mb-3">
                  <span>{usage.requests} Requests used</span>
                  <span>{usage.limit} Limit</span>
                </div>
                {usage.plan === 'Free Tier' && (
                  <button
                    onClick={() => handleUpgradePlan('Pro')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-semibold transition flex items-center justify-center gap-1.5 border border-neutral-700"
                  >
                    <Sparkles size={12} className="text-yellow-400" />
                    Upgrade to Pro (10,000 requests/mo)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Code Snippet Box */}
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-purple-400" />
                <span className="text-xs font-mono font-bold text-white">cURL Example</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleCurl);
                  setCopiedSnippet(true);
                  setTimeout(() => setCopiedSnippet(false), 2000);
                  showToast('Snippet cURL tersalin!', 'info');
                }}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition cursor-pointer"
              >
                {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>Salin Code</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-950 text-xs font-mono text-purple-300 overflow-x-auto border border-neutral-800/80 leading-relaxed">
              {sampleCurl}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/studios/ApiKeysStudio.tsx', code);
console.log('ApiKeysStudio completely rewritten');
