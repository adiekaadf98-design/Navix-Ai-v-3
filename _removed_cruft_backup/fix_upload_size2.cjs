const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInput.tsx', 'utf8');

code = code.replace(/h-32 sm:h-40/g, 'h-24 sm:h-32');
fs.writeFileSync('src/components/ChatInput.tsx', code);
console.log("Fixed upload sizes again.");
