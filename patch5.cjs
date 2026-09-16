const fs = require('fs');
let code = fs.readFileSync('src/components/ThinkingIndicator.tsx', 'utf8');
code = code.replace(/    'UNDERSTANDING': 'Memahami Kompleksitas & Konteks',\n/g, "");
code = code.replace(/    'PLANNING': 'Mendekomposisi Rencana Tindakan',\n/g, "");
fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
