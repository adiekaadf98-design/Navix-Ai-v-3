const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
    'const fallbackModelsList = [\n                "gemini-3.8-flash",\n                "gemini-3.1-flash-lite",\n                "gemini-3.1-pro-preview"\n             ];',
    'const fallbackModelsList = [\n                "gemini-3.8-flash",\n                "gemini-3.1-flash-lite",\n                "gemini-3.1-pro-preview",\n                "gemini-2.5-flash",\n                "gemini-3.7-flash"\n             ];'
);
fs.writeFileSync('server.ts', code);
