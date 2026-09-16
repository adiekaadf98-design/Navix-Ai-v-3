const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/gemini-3\.1-pro-preview/g, 'gemini-3.5-flash');
fs.writeFileSync('server.ts', code);
console.log("Fixed pro models to use 3.5 flash to avoid quota limits.");
