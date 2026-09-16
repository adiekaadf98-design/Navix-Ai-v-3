const fs = require('fs');
let content = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// Add quota state
const stateInsert = `
  const [usage, setUsage] = useState<{requests: number, limit: number, plan: string} | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(\`/api/developer/usage?userId=\${user.id}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.usage) {
            setUsage(data.usage);
          }
        });
    }
  }, [user]);
`;

if (!content.includes('const [usage, setUsage]')) {
  content = content.replace('const [isLoadingKeys, setIsLoadingKeys] = useState(false);', 'const [isLoadingKeys, setIsLoadingKeys] = useState(false);\n' + stateInsert);
}

// Ensure Activity icon is imported
if (!content.includes('Activity,')) {
  content = content.replace('Puzzle,', 'Puzzle, Activity,');
}

// Replace the API Key Box
const startMarker = '{/* API Key Box */}';
const endMarker = '{/* Code Snippet Box */}';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newUi = `
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
                  <div className="flex justify-between text-[11px] text-neutral-500">
                    <span>{usage.requests} Requests used</span>
                    <span>{usage.limit} Limit</span>
                  </div>
                </div>
              )}
            </div>

            `;
  content = content.substring(0, startIndex) + newUi + content.substring(endIndex);
  fs.writeFileSync('src/components/studios/PluginsStudio.tsx', content);
  console.log("Patched UI successfully");
} else {
  console.log("Could not find markers");
}
