const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  /<ApiKeysStudio \s*onUpgradeClick/g,
  "<ApiKeysStudio \n            onClose={() => setCurrentView('chat')}\n            onUpgradeClick"
);
fs.writeFileSync('src/App.tsx', appCode);
console.log('Forcibly patched App.tsx');
