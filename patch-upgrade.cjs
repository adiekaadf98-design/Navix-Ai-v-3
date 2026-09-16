const fs = require('fs');
let content = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

const upgradeFn = `
  const handleUpgradePlan = async (plan: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/developer/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan })
      });
      const data = await res.json();
      if (data.success && data.usage) {
        setUsage(data.usage);
        showToast('Plan upgraded to ' + plan, 'success');
      }
    } catch(e) {}
  };
`;

if (!content.includes('handleUpgradePlan')) {
  content = content.replace('const apiKey = apiKeys.length > 0 ? apiKeys[0] : ', upgradeFn + '\n  const apiKey = apiKeys.length > 0 ? apiKeys[0] : ');
}

const upgradeBtn = `
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
`;

if (content.includes('<span>{usage.limit} Limit</span>\n                  </div>\n                </div>')) {
  content = content.replace('<span>{usage.limit} Limit</span>\n                  </div>\n                </div>', upgradeBtn);
  fs.writeFileSync('src/components/studios/PluginsStudio.tsx', content);
  console.log('Patched upgrade UI');
} else {
  console.log('Upgrade UI marker not found');
}
