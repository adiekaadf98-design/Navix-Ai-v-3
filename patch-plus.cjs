const fs = require('fs');
let content = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');
content = content.replace("Copy, ", "Copy, Plus, ");
if (!content.includes("Plus,")) content = content.replace("CheckCircle2,", "CheckCircle2, Plus,");
fs.writeFileSync('src/components/studios/PluginsStudio.tsx', content);
