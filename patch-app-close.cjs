const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes("onClose={() => setCurrentView('chat')}")) {
  appCode = appCode.replace(
    "<ApiKeysStudio \\n            onUpgradeClick",
    "<ApiKeysStudio \\n            onClose={() => setCurrentView('chat')}\\n            onUpgradeClick"
  );
  appCode = appCode.replace(
    "<ApiKeysStudio \n            onUpgradeClick",
    "<ApiKeysStudio \n            onClose={() => setCurrentView('chat')}\n            onUpgradeClick"
  );
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('Patched App.tsx for ApiKeysStudio onClose');
}
