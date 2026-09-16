const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
    'const waitTime = isServerError ? 300 : delay;\n             await new Promise(resolve => setTimeout(resolve, waitTime));\n             delay = Math.min(delay * 1.2, 500);',
    'const waitTime = isServerError ? delay * 2 : delay;\n             await new Promise(resolve => setTimeout(resolve, waitTime));\n             delay = Math.min(delay * 1.5, 3000);'
);
fs.writeFileSync('server.ts', code);
