const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInput.tsx', 'utf8');

code = code.replace(/h-48 sm:h-56/g, 'h-32 sm:h-40');
fs.writeFileSync('src/components/ChatInput.tsx', code);
console.log("Fixed upload sizes.");
