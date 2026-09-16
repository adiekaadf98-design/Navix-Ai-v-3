const fs = require('fs');

function fixFile(path) {
    let code = fs.readFileSync(path, 'utf8');
    code = code.replace(/gemini-3\.5-flash-lite/g, 'gemini-3.1-flash-lite');
    code = code.replace(/gemini-3\.5-flash-tts-preview/g, 'gemini-3.1-flash-tts-preview');
    fs.writeFileSync(path, code);
}

fixFile('server.ts');
console.log("Fixed lite model names.");
