const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/imagen-3\.0-generate-001/g, 'imagen-3.0-generate-002');

fs.writeFileSync('server.ts', code);
console.log("Replaced imagen-3.0-generate-001 with imagen-3.0-generate-002");
