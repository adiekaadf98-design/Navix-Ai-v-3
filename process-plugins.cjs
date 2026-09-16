const fs = require('fs');

let pluginsCode = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// Remove sdk tab button
const sdkTabRegex = /<button\s*onClick=\{\(\) => setActiveTab\('sdk'\)\}[\s\S]*?SDK & API[\s\S]*?<\/button>/;
pluginsCode = pluginsCode.replace(sdkTabRegex, '');

// Remove sdk tab content
const sdkContentRegex = /\{activeTab === 'sdk' && \([\s\S]*?\n\s*\)\}/;
pluginsCode = pluginsCode.replace(sdkContentRegex, '');

// Change type of activeTab to remove 'sdk'
pluginsCode = pluginsCode.replace(/'installed' \| 'store' \| 'sdk'/, "'installed' | 'store'");

// Update header
pluginsCode = pluginsCode.replace(
  /<h2 className="text-xl font-bold text-white">Plugins & SDK<\/h2>/,
  '<h2 className="text-xl font-bold text-white">Plugins Studio</h2>'
);
pluginsCode = pluginsCode.replace(
  /<p className="text-sm text-neutral-400">Kelola plugin eksternal dan akses API untuk Navix AI\.<\/p>/,
  '<p className="text-sm text-neutral-400">Kelola ekstensi pihak ketiga untuk Navix AI.</p>'
);

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', pluginsCode);
console.log('PluginsStudio processed.');
