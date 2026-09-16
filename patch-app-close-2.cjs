const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes("onClose={() => setCurrentView('chat')}")) {
  appCode = appCode.replace(
    /currentView === 'api_keys' && \(\s*<ApiKeysStudio\s*onUpgradeClick/g,
    "currentView === 'api_keys' && (\n          <ApiKeysStudio \n            onClose={() => setCurrentView('chat')}\n            onUpgradeClick"
  );
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('Patched App.tsx for ApiKeysStudio onClose');
}
