const fs = require('fs');
let code = fs.readFileSync('src/components/ThinkingIndicator.tsx', 'utf8');

// Replace the duplicate keys by deleting the first block of duplicates or combining them
code = code.replace(/    'EXECUTING': 'Mengeksekusi Sub-tugas & Logika',\n/g, "");
code = code.replace(/    'VERIFYING': 'Memverifikasi Sintaks & Validitas',\n/g, "");
code = code.replace(/    'COMPLETED': 'Penalaran Selesai',\n/g, "");

fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
