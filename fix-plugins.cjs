const fs = require('fs');

let pluginsCode = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

const regex = /\s*<div className="flex flex-col sm:flex-row items-center gap-2">[\s\S]*?\{activeTab === 'sdk' && \([\s\S]*?\)\}/;
// Actually, it's easier to find exactly where `        )}` belongs to.

// Let's just find the end of `{activeTab === 'store' && (...) }` and cut off the rest before `      </div>\n    </div>\n  );\n};`
const storeEnd = "          </div>\n        )}";
const idx = pluginsCode.indexOf(storeEnd);

if (idx !== -1) {
  pluginsCode = pluginsCode.substring(0, idx + storeEnd.length) + "\n      </div>\n    </div>\n  );\n};\n";
  fs.writeFileSync('src/components/studios/PluginsStudio.tsx', pluginsCode);
  console.log("PluginsStudio fixed by truncating after store tab");
}

