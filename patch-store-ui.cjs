const fs = require('fs');
let code = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

const target1 = `            </div>
            {isSearching ? (`;

const replace1 = `            </div>

            {!isSearching && storePlugins.length > 0 && (
              <div className="flex items-center justify-between mb-4 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
                <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer hover:text-white transition">
                  <input 
                    type="checkbox"
                    checked={selectedPlugins.length === storePlugins.length && storePlugins.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-700 text-purple-600 focus:ring-purple-500 bg-neutral-800 accent-purple-500"
                  />
                  <span>Select All ({storePlugins.length})</span>
                </label>
                
                {selectedPlugins.length > 0 && (
                  <button
                    onClick={handleBatchInstall}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-lg flex items-center gap-2"
                  >
                    <Download size={14} />
                    Install {selectedPlugins.length} Plugin
                  </button>
                )}
              </div>
            )}

            {isSearching ? (`;

if (code.includes("            </div>\n            {isSearching ? (")) {
  code = code.replace("            </div>\n            {isSearching ? (", replace1);
} else {
    console.log("target1 not found");
}

const target2 = `              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storePlugins.map((plugin) => (
                  <div key={plugin.id} className="p-5 rounded-2xl bg-[#0a0a0a] border border-neutral-800 hover:border-purple-500/50 transition shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded font-mono border border-neutral-800 flex items-center gap-1">
                          <Github size={10} />
                          {plugin.publisher}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">{plugin.version}</span>
                      </div>`;

const replace2 = `              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storePlugins.map((plugin) => (
                  <div key={plugin.id} onClick={() => handleToggleSelect(plugin.id)} className={\`cursor-pointer p-5 rounded-2xl bg-[#0a0a0a] border transition shadow-lg flex flex-col justify-between \${selectedPlugins.includes(plugin.id) ? 'border-purple-500/80 ring-1 ring-purple-500/50' : 'border-neutral-800 hover:border-purple-500/50'}\`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={selectedPlugins.includes(plugin.id)}
                            onChange={() => {}} 
                            className="w-4 h-4 rounded border-neutral-700 text-purple-600 focus:ring-purple-500 bg-neutral-800 accent-purple-500"
                          />
                          <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded font-mono border border-neutral-800 flex items-center gap-1">
                            <Github size={10} />
                            {plugin.publisher}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">{plugin.version}</span>
                      </div>`;

if (code.includes(target2)) {
  code = code.replace(target2, replace2);
} else {
    console.log("target2 not found");
}

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', code);
console.log('UI patch applied.');
