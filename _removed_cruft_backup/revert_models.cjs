const fs = require('fs');

function revertFile(path) {
    let code = fs.readFileSync(path, 'utf8');
    code = code.replace(/gemini-2\.5-flash/g, 'gemini-3.5-flash');
    code = code.replace(/gemini-2\.5-flash-lite/g, 'gemini-3.1-flash-lite');
    code = code.replace(/gemini-2\.5-pro/g, 'gemini-3.1-pro-preview');
    fs.writeFileSync(path, code);
}

revertFile('server.ts');
revertFile('src/services/Orchestrator.ts');
console.log("Reverted bad model names back to 3.5-flash and 3.1-pro-preview");
