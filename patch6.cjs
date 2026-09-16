const fs = require('fs');
let code = fs.readFileSync('src/components/ThinkingIndicator.tsx', 'utf8');
code = code.replace(/    'supervisor_state': 'Validasi Pengawas Kualitas',\n/g, "");
fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
