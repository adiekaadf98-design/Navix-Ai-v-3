const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the start of Try Google Imagen 3
const startStr = '// 1. Try Google Imagen 3';
const endStr = '// 2. High-Quality Multi-Tier Fallback Engine';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + '// 1. (DIHAPUS) Ketergantungan ke Gemini Image / Imagen 3 telah diputus karena hasil seperti manekin plastik.\n    ' + code.substring(endIndex);
    fs.writeFileSync('server.ts', code);
    console.log('Successfully patched server.ts');
} else {
    console.log('Could not find markers in server.ts');
}
