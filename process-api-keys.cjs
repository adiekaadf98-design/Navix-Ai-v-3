const fs = require('fs');

let apiCode = fs.readFileSync('src/components/studios/ApiKeysStudio.tsx', 'utf8');

apiCode = apiCode.replace(/export const PluginsStudio: React\.FC<PluginsStudioProps>/, 'export const ApiKeysStudio: React.FC<PluginsStudioProps>');
apiCode = apiCode.replace(/PluginsStudioProps/g, 'ApiKeysStudioProps');

// Remove the tabs UI
const tabsMatch = /<div className="flex p-1 bg-neutral-900\/50 rounded-xl border border-neutral-800">[\s\S]*?<\/div>/;
apiCode = apiCode.replace(tabsMatch, '');

// Remove activeTab state
apiCode = apiCode.replace(/const \[activeTab, setActiveTab\] = useState[^;]+;/, '');

// Remove {activeTab === 'installed' && ...}
const installedMatch = /\{activeTab === 'installed' && \([\s\S]*?\n\s*\)\}/;
apiCode = apiCode.replace(installedMatch, '');

// Remove {activeTab === 'store' && ...}
const storeMatch = /\{activeTab === 'store' && \([\s\S]*?\n\s*\)\}/;
apiCode = apiCode.replace(storeMatch, '');

// Clean up {activeTab === 'sdk' && (  ... )}
apiCode = apiCode.replace(/\{activeTab === 'sdk' && \(\s*<div className="space-y-6 max-w-4xl mx-auto">/, '<div className="space-y-6 max-w-4xl mx-auto">');
apiCode = apiCode.replace(/<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>/, '</div>\n        </div>\n      </div>');

// Update header
apiCode = apiCode.replace(
  /<div className="w-10 h-10 rounded-xl bg-indigo-500\/20 flex items-center justify-center border border-indigo-500\/30">\s*<Puzzle className="text-indigo-400" size={20} \/>\s*<\/div>/,
  '<div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">\n                <Key className="text-purple-400" size={20} />\n              </div>'
);
apiCode = apiCode.replace(
  /<h2 className="text-xl font-bold text-white">Plugins & SDK<\/h2>/,
  '<h2 className="text-xl font-bold text-white">Navix API Keys</h2>'
);
apiCode = apiCode.replace(
  /<p className="text-sm text-neutral-400">Kelola plugin eksternal dan akses API untuk Navix AI\.<\/p>/,
  '<p className="text-sm text-neutral-400">Kelola kunci API Anda untuk mengintegrasikan Navix AI ke aplikasi pihak ketiga.</p>'
);

fs.writeFileSync('src/components/studios/ApiKeysStudio.tsx', apiCode);
console.log('ApiKeysStudio processed.');
