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

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  fs.writeFileSync('src/components/studios/PluginsStudio.tsx', code);
  console.log("UI Patch 2 Applied");
} else {
    console.log("target1 still not found");
}
